from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db import transaction

from .models import (
    Driver,
    Truck,
    Mission,
    FuelEntry,
    Notification,
    WeeklyStats
)

from .serializers import (
    DriverSerializer,
    TruckSerializer,
    MissionSerializer,
    FuelEntrySerializer,
    NotificationSerializer,
    WeeklyStatsSerializer
)

# ======================================================
# DRIVER
# ======================================================
class DriverViewSet(ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

    # -------------------------
    # STATS DRIVER
    # -------------------------
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        driver = self.get_object()
        missions = driver.missions.filter(status='completed')

        total_km = sum(m.distance for m in missions)
        total_hours = sum(m.hours_worked for m in missions)

        return Response({
            "total_kilometers": total_km,
            "total_hours_worked": total_hours,
            "completed_missions": missions.count()
        })

    # -------------------------
    # UPDATE DRIVER (MODIFICATION COMPTE)
    # -------------------------
    def update(self, request, *args, **kwargs):
        driver = self.get_object()
        serializer = self.get_serializer(
            driver,
            data=request.data,
            partial=False
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def partial_update(self, request, *args, **kwargs):
        driver = self.get_object()
        serializer = self.get_serializer(
            driver,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -------------------------
    # DELETE DRIVER (SUPPRESSION COMPTE)
    # -------------------------
    def destroy(self, request, *args, **kwargs):
        driver = self.get_object()

        try:
            with transaction.atomic():

                # ❌ Annuler les missions actives
                active_missions = Mission.objects.filter(
                    driver=driver,
                    status='in_progress'
                )

                for mission in active_missions:
                    mission.status = 'cancelled'
                    mission.actual_end_time = timezone.now()
                    mission.save()

                # ❌ Désactiver le driver
                driver.is_active = False
                driver.save()

                # ❌ Supprimer l'utilisateur Django lié
                if driver.user:
                    driver.user.delete()

                # ❌ Supprimer le driver
                driver.delete()

                return Response(
                    {"status": "Compte chauffeur supprimé avec succès"},
                    status=status.HTTP_204_NO_CONTENT
                )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ======================================================
# TRUCK
# ======================================================
class TruckViewSet(ModelViewSet):
    queryset = Truck.objects.all()
    serializer_class = TruckSerializer

    @action(detail=True, methods=['post'])
    def refuel(self, request, pk=None):
        truck = self.get_object()

        try:
            quantity = float(request.data.get('quantity', 0))
        except ValueError:
            return Response(
                {"error": "Quantité invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {"error": "La quantité doit être positive"},
                status=status.HTTP_400_BAD_REQUEST
            )

        truck.current_fuel += quantity
        truck.save()

        return Response({
            "status": "Camion ravitaillé",
            "current_fuel": truck.current_fuel
        })


# ======================================================
# MISSION
# ======================================================
class MissionViewSet(ModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer

    @action(detail=False, methods=['post'])
    def check_fuel(self, request):
        try:
            truck_id = request.data.get('truck_id')
            distance = float(request.data.get('distance', 0))

            if not truck_id or distance <= 0:
                return Response(
                    {"error": "truck_id et distance sont requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            truck = Truck.objects.get(id=truck_id)
            fuel_check = truck.has_enough_fuel(distance)

            return Response({
                "truck": TruckSerializer(truck).data,
                "fuel_check": fuel_check
            })

        except Truck.DoesNotExist:
            return Response(
                {"error": "Camion introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def refuel_and_create(self, request):
        try:
            truck_id = request.data.get('truck_id')
            refuel_amount = float(request.data.get('refuel_amount', 0))
            mission_data = request.data.get('mission_data')

            if not truck_id or not mission_data:
                return Response(
                    {"error": "Données manquantes"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            truck = Truck.objects.get(id=truck_id)

            # ✅ CRÉER L'ENTRÉE FUEL SI RAVITAILLEMENT
            if refuel_amount > 0:
                FuelEntry.objects.create(
                    truck=truck,
                    quantity=refuel_amount,
                    cost=refuel_amount * 15.0,  # Prix par litre
                    location='Station-service (auto)',
                    notes='Ravitaillement automatique lors de création de mission'
                )
                
                truck.current_fuel += refuel_amount
                truck.save()

            serializer = MissionSerializer(data=mission_data)
            if serializer.is_valid():
                mission = serializer.save()
                return Response({
                    "mission": MissionSerializer(mission).data,
                    "truck": TruckSerializer(truck).data,
                    "refuel_amount": refuel_amount,
                    "refuel_cost": refuel_amount * 15.0
                }, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Truck.DoesNotExist:
            return Response(
                {"error": "Camion introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        try:
            mission = self.get_object()
            
            print(f"🔍 Mission {mission.id} status: {mission.status}")
            print(f"🔍 Mission driver: {mission.driver}")
            print(f"🔍 Mission truck: {mission.truck}")

            if mission.status != 'pending':
                return Response(
                    {"error": f"Cette mission ne peut pas être démarrée. Status actuel: {mission.status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            mission.status = 'in_progress'
            mission.actual_start_time = timezone.now()
            mission.save()

            print(f"✅ Mission {mission.id} démarrée avec succès")

            serializer = self.get_serializer(mission)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Erreur lors du démarrage: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        try:
            mission = self.get_object()

            print(f"🔍 Completing mission {mission.id}, status: {mission.status}")

            # ✅ Validation: Vérifier que la mission est en cours
            if mission.status != 'in_progress':
                return Response(
                    {"error": f"Cette mission n'est pas en cours. Status: {mission.status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Terminer la mission
            mission.status = 'completed'
            mission.actual_end_time = timezone.now()

            # ✅ Calculer les heures basées sur la durée PRÉVUE (pas réelle)
            if mission.pickup_time and mission.expected_dropoff_time:
                duration = mission.expected_dropoff_time - mission.pickup_time
                mission.hours_worked = duration.total_seconds() / 3600

            # ✅ DÉDUIRE LE CARBURANT DU CAMION
            if mission.truck and mission.distance > 0:
                # Calculer les litres consommés
                liters_consumed = (mission.distance * mission.truck.avg_consumption) / 100
                
                # Déduire du réservoir (ne peut pas descendre en dessous de 0)
                old_fuel = mission.truck.current_fuel
                mission.truck.current_fuel = max(0, mission.truck.current_fuel - liters_consumed)
                mission.truck.save()
                
                # Enregistrer le coût réel du carburant consommé
                mission.actual_fuel_cost = liters_consumed * 15.0  # 15 DH par litre
                
                print(f"⛽ Carburant consommé: {liters_consumed:.2f}L")
                print(f"   Avant: {old_fuel:.2f}L → Après: {mission.truck.current_fuel:.2f}L")
                print(f"   Coût réel: {mission.actual_fuel_cost:.2f} DH")

            mission.save()

            print(f"✅ Mission {mission.id} terminée avec succès")
            print(f"   Heures comptabilisées: {mission.hours_worked:.1f}h (durée prévue)")

            # ✅ Retourner la mission complète
            serializer = self.get_serializer(mission)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ Erreur lors de la complétion: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Erreur serveur: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        mission = self.get_object()

        # ❌ Mission déjà terminée ou annulée
        if mission.status not in ['pending', 'in_progress']:
            return Response(
                {"error": "Cette mission ne peut pas être annulée"},
                status=status.HTTP_400_BAD_REQUEST
            )

        mission.status = 'cancelled'
        mission.actual_end_time = timezone.now()
        mission.save()

        return Response(
            self.get_serializer(mission).data,
            status=status.HTTP_200_OK
        )


# ======================================================
# FUEL
# ======================================================
class FuelEntryViewSet(ModelViewSet):
    queryset = FuelEntry.objects.all()
    serializer_class = FuelEntrySerializer


# ======================================================
# NOTIFICATION
# ======================================================
class NotificationViewSet(ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({"status": "Notification lue"})


# ======================================================
# WEEKLY STATS
# ======================================================
class WeeklyStatsViewSet(ModelViewSet):
    queryset = WeeklyStats.objects.all()
    serializer_class = WeeklyStatsSerializer