from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


# ==================================================
# DRIVER
# ==================================================
class Driver(models.Model):
    """Modèle pour les chauffeurs"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    contractual_hours = models.IntegerField(default=40)
    hours_worked = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'drivers'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
    
    def get_remaining_hours(self):
        """Retourne les heures restantes dans la semaine"""
        return max(0, self.contractual_hours - self.hours_worked)
    
    def has_capacity_for_mission(self, estimated_hours):
        """Vérifie si le driver a la capacité pour une nouvelle mission"""
        return self.get_remaining_hours() >= estimated_hours
    
    def reset_weekly_hours(self):
        """Reset les heures travaillées à 0 (appelé chaque dimanche à minuit)"""
        self.hours_worked = 0
        self.save()


# ==================================================
# TRUCK - FIXED WITH AVG_CONSUMPTION ✅
# ==================================================
class Truck(models.Model):
    """Modèle pour les camions"""
    MOTORIZATION_CHOICES = [
        ('Diesel', 'Diesel'),
        ('Essence', 'Essence'),
        ('Électrique', 'Électrique'),
        ('Hybride', 'Hybride'),
    ]

    plate = models.CharField(max_length=20, unique=True)
    brand = models.CharField(max_length=100)
    capacity = models.IntegerField(help_text="Capacité en kg")
    power = models.IntegerField(help_text="Puissance en CV")
    motorization = models.CharField(max_length=20, choices=MOTORIZATION_CHOICES)
    tank_capacity = models.IntegerField(help_text="Capacité du réservoir en litres")
    current_fuel = models.FloatField(default=0, help_text="Carburant actuel en litres")

    # ✅ AJOUT: Consommation moyenne
    avg_consumption = models.FloatField(
        default=25.0,
        help_text="Consommation moyenne en litres/100km"
    )

    fuel_percentage = models.IntegerField(
        default=100,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trucks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} - {self.plate}"

    def save(self, *args, **kwargs):
        if self.tank_capacity > 0:
            self.fuel_percentage = int((self.current_fuel / self.tank_capacity) * 100)
        super().save(*args, **kwargs)
    
    def calculate_fuel_cost(self, distance_km, price_per_liter=15.0):
        """
        Calcule le coût estimé du carburant
        
        Args:
            distance_km: Distance en kilomètres
            price_per_liter: Prix du carburant par litre (défaut: 15 DH)
        
        Returns:
            float: Coût estimé en DH
        """
        liters_needed = (distance_km * self.avg_consumption) / 100
        return liters_needed * price_per_liter
    
    def calculate_fuel_needed(self, distance_km):
        """
        Calcule les litres nécessaires pour une distance
        
        Args:
            distance_km: Distance en kilomètres
        
        Returns:
            float: Litres nécessaires
        """
        return (distance_km * self.avg_consumption) / 100
    
    def has_enough_fuel(self, distance_km):
        """
        Vérifie si le camion a assez de carburant pour la distance
        
        Args:
            distance_km: Distance en kilomètres
        
        Returns:
            dict: {
                'enough': bool,
                'current_fuel': float,
                'needed': float,
                'missing': float,
                'refuel_cost': float (at 15 DH/L)
            }
        """
        fuel_needed = self.calculate_fuel_needed(distance_km)
        missing = max(0, fuel_needed - self.current_fuel)
        
        return {
            'enough': self.current_fuel >= fuel_needed,
            'current_fuel': self.current_fuel,
            'needed': fuel_needed,
            'missing': missing,
            'refuel_cost': missing * 15.0,  # Prix moyen au Maroc
            'full_tank_cost': (self.tank_capacity - self.current_fuel) * 15.0
        }


# ==================================================
# MISSION (GOOGLE MAPS ENABLED)
# ==================================================
class Mission(models.Model):
    """Modèle pour les missions"""

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]

    CONTAINER_TYPE_CHOICES = [
        ('20ft', '20 pieds'),
        ('40ft', '40 pieds'),
        ('40ft HC', '40 pieds HC'),
    ]

    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        related_name='missions'
    )

    truck = models.ForeignKey(
        Truck,
        on_delete=models.SET_NULL,
        null=True,
        related_name='missions'
    )

    # -------- DEPARTURE --------
    departure_city = models.CharField(max_length=100)
    departure_address = models.TextField()

    departure_lat = models.FloatField(null=True, blank=True)
    departure_lng = models.FloatField(null=True, blank=True)
    departure_place_id = models.CharField(max_length=255, null=True, blank=True)

    pickup_time = models.DateTimeField()

    # -------- ARRIVAL --------
    arrival_city = models.CharField(max_length=100)
    arrival_address = models.TextField()

    arrival_lat = models.FloatField(null=True, blank=True)
    arrival_lng = models.FloatField(null=True, blank=True)
    arrival_place_id = models.CharField(max_length=255, null=True, blank=True)

    expected_dropoff_time = models.DateTimeField()

    # -------- CONTAINER --------
    container_number = models.CharField(max_length=50)
    container_type = models.CharField(max_length=20, choices=CONTAINER_TYPE_CHOICES)

    # -------- METRICS --------
    distance = models.IntegerField(help_text="Distance en km")
    estimated_fuel_cost = models.DecimalField(max_digits=10, decimal_places=2)
    actual_fuel_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # -------- TIMESTAMPS --------
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    hours_worked = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'missions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Mission {self.id}: {self.departure_city} → {self.arrival_city}"

    def calculate_hours_worked(self):
        if self.actual_start_time and self.actual_end_time:
            duration = self.actual_end_time - self.actual_start_time
            self.hours_worked = duration.total_seconds() / 3600
            return self.hours_worked
        return 0
    
    def get_estimated_hours(self):
        """Estime les heures de travail basées sur la distance"""
        # Formule simple: 1 heure pour 60km + 2h de chargement/déchargement
        return (self.distance / 60) + 2


# ==================================================
# FUEL ENTRY
# ==================================================
class FuelEntry(models.Model):
    """Modèle pour le suivi du carburant"""

    truck = models.ForeignKey(Truck, on_delete=models.CASCADE, related_name='fuel_entries')
    mission = models.ForeignKey(
        Mission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fuel_entries'
    )

    quantity = models.FloatField(help_text="Quantité en litres")
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fuel_entries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Carburant - {self.truck.plate} - {self.quantity}L"


# ==================================================
# NOTIFICATION
# ==================================================
class Notification(models.Model):
    """Modèle pour les notifications"""

    NOTIFICATION_TYPES = [
        ('mission', 'Mission'),
        ('fuel', 'Carburant'),
        ('maintenance', 'Maintenance'),
        ('general', 'Général'),
    ]

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general')
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.driver.name}"


# ==================================================
# WEEKLY STATS
# ==================================================
class WeeklyStats(models.Model):
    """Modèle pour les statistiques hebdomadaires"""

    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='weekly_stats')

    week_start = models.DateField()
    week_end = models.DateField()

    total_kilometers = models.IntegerField(default=0)
    total_hours_worked = models.FloatField(default=0)
    completed_missions = models.IntegerField(default=0)
    average_speed = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'weekly_stats'
        ordering = ['-week_start']
        unique_together = ['driver', 'week_start']

    def __str__(self):
        return f"Stats {self.driver.name} - Semaine du {self.week_start}"