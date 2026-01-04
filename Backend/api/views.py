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

                # ❌ Supprimer l’utilisateur Django lié
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

            if refuel_amount > 0:
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
        mission = self.get_object()

        if mission.status != 'pending':
            return Response(
                {"error": "Mission non démarrable"},
                status=status.HTTP_400_BAD_REQUEST
            )

        mission.status = 'in_progress'
        mission.actual_start_time = timezone.now()
        mission.save()

        return Response(
            self.get_serializer(mission).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        mission = self.get_object()

        if mission.status != 'in_progress':
            return Response(
                {"error": "Mission non en cours"},
                status=status.HTTP_400_BAD_REQUEST
            )

        mission.status = 'completed'
        mission.actual_end_time = timezone.now()
        mission.save()

        return Response(
            self.get_serializer(mission).data,
            status=status.HTTP_200_OK
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

    def perform_create(self, serializer):
        fuel_entry = serializer.save()
        truck = fuel_entry.truck
        truck.current_fuel += fuel_entry.quantity
        truck.save()


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
