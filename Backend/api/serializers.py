from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Driver,
    Truck,
    Mission,
    FuelEntry,
    Notification,
    WeeklyStats
)

# =========================
# USER
# =========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# =========================
# DRIVER
# =========================
class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    remaining_hours = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = '__all__'
    
    def get_remaining_hours(self, obj):
        return obj.get_remaining_hours()
    
    def create(self, validated_data):
        from django.contrib.auth.models import User
        
        email = validated_data.get('email')
        name = validated_data.get('name')
        
        # Créer un username unique à partir de l'email
        username = email.split('@')[0]
        counter = 1
        original_username = username
        
        # Vérifier si le username existe déjà
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Créer le User Django
        user = User.objects.create_user(
            username=username,
            email=email,
            password='temp123456'
        )
        
        # Créer le Driver avec le user
        validated_data['user'] = user
        driver = Driver.objects.create(**validated_data)
        
        return driver

# =========================
# TRUCK
# =========================
class TruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Truck
        fields = '__all__'


# =========================
# MISSION - SIMPLIFIÉ ✅
# =========================
class MissionSerializer(serializers.ModelSerializer):
    # 🔹 LECTURE : Toujours retourner les objets complets
    driver = DriverSerializer(read_only=True)
    truck = TruckSerializer(read_only=True)

    # 🔹 ÉCRITURE : Accepter les IDs
    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True,
        required=False,
        allow_null=True
    )

    truck_id = serializers.PrimaryKeyRelatedField(
        queryset=Truck.objects.all(),
        source='truck',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Mission
        fields = '__all__'

    def validate(self, data):
        """
        Validations lors de la création/modification d'une mission
        """
        truck = data.get('truck')
        driver = data.get('driver')

        # ✅ VALIDATION 1: Camion déjà en mission ?
        if truck:
            existing_mission = Mission.objects.filter(
                truck=truck,
                status='in_progress'
            ).exclude(pk=self.instance.pk if self.instance else None).first()

            if existing_mission:
                raise serializers.ValidationError({
                    'truck': f'Ce camion est déjà assigné à la mission #{existing_mission.id} en cours.'
                })

        # ✅ VALIDATION 2: Driver a assez d'heures contractuelles ?
        if driver and data.get('pickup_time') and data.get('expected_dropoff_time'):
            pickup_time = data.get('pickup_time')
            expected_dropoff_time = data.get('expected_dropoff_time')
            
            # Calculer les heures estimées basées sur la durée prévue
            duration = expected_dropoff_time - pickup_time
            estimated_hours = duration.total_seconds() / 3600
            
            if estimated_hours > 0 and not driver.has_capacity_for_mission(estimated_hours):
                remaining = driver.get_remaining_hours()
                raise serializers.ValidationError({
                    'driver': f'{driver.name} n\'a que {remaining:.1f}h disponibles (besoin: {estimated_hours:.1f}h)'
                })

        return data

    def create(self, validated_data):
        """
        Création de mission simple
        L'admin choisit pickup_time et expected_dropoff_time manuellement
        """
        truck = validated_data.get('truck')
        distance = validated_data.get('distance', 0)

        # ✅ CALCUL AUTOMATIQUE DU COÛT CARBURANT UNIQUEMENT
        if truck and distance > 0:
            # Prix moyen du gazole au Maroc: 15 DH/L
            estimated_cost = truck.calculate_fuel_cost(distance, price_per_liter=15.0)
            validated_data['estimated_fuel_cost'] = round(estimated_cost, 2)
        elif 'estimated_fuel_cost' not in validated_data:
            validated_data['estimated_fuel_cost'] = 0

        mission = Mission.objects.create(**validated_data)
        
        print(f"✅ Mission #{mission.id} créée")
        print(f"   Départ: {mission.pickup_time}")
        print(f"   Arrivée prévue: {mission.expected_dropoff_time}")
        if mission.pickup_time and mission.expected_dropoff_time:
            duration = mission.expected_dropoff_time - mission.pickup_time
            hours = duration.total_seconds() / 3600
            print(f"   Durée: {hours:.1f}h")
        
        return mission

    def update(self, instance, validated_data):
        """
        Mise à jour simple
        """
        truck = validated_data.get('truck', instance.truck)
        distance = validated_data.get('distance', instance.distance)

        # Recalculer coût carburant si camion ou distance change
        if truck and distance > 0:
            if truck != instance.truck or distance != instance.distance:
                estimated_cost = truck.calculate_fuel_cost(distance, price_per_liter=15.0)
                validated_data['estimated_fuel_cost'] = round(estimated_cost, 2)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        """
        Force le retour des objets driver et truck complets,
        même après les actions start/complete
        """
        representation = super().to_representation(instance)
        
        # S'assurer que driver et truck sont toujours des objets complets
        if instance.driver:
            representation['driver'] = DriverSerializer(instance.driver).data
        
        if instance.truck:
            representation['truck'] = TruckSerializer(instance.truck).data
        
        return representation


# =========================
# FUEL
# =========================
class FuelEntrySerializer(serializers.ModelSerializer):
    """
    Le front envoie :
    - truck
    - quantity
    - price_per_liter

    Le backend calcule :
    - cost
    """

    price_per_liter = serializers.FloatField(
        write_only=True,
        required=True
    )

    class Meta:
        model = FuelEntry
        fields = [
            'id',
            'truck',
            'quantity',
            'price_per_liter',
            'cost',
            'location',
            'notes',
            'created_at',
        ]
        read_only_fields = ['cost', 'created_at']

    def create(self, validated_data):
        # 🔥 EXTRAIRE LE PRIX (PAS DANS LE MODEL)
        price_per_liter = validated_data.pop('price_per_liter')

        quantity = validated_data.get('quantity')

        # 🧮 CALCUL DU COÛT
        validated_data['cost'] = quantity * price_per_liter

        fuel_entry = FuelEntry.objects.create(**validated_data)

        # ⛽ METTRE À JOUR LE CARBURANT DU CAMION
        truck = fuel_entry.truck
        truck.current_fuel = min(
            truck.current_fuel + fuel_entry.quantity,
            truck.tank_capacity
        )
        truck.save()

        return fuel_entry


# =========================
# NOTIFICATION
# =========================
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


# =========================
# WEEKLY STATS
# =========================
class WeeklyStatsSerializer(serializers.ModelSerializer):
    driver = DriverSerializer(read_only=True)

    class Meta:
        model = WeeklyStats
        fields = '__all__'