from django.contrib import admin
from .models import (
    Driver,
    Truck,
    Mission,
    FuelEntry,
    Notification,
    WeeklyStats
)

# ======================================================
# DRIVER
# ======================================================
@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'email',
        'phone',
        'is_active',
        'contractual_hours',
        'hours_worked',
        'created_at',
    )
    list_filter = ('is_active',)
    search_fields = ('name', 'email', 'phone')
    ordering = ('-created_at',)


# ======================================================
# TRUCK
# ======================================================
@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'brand',
        'plate',
        'capacity',
        'tank_capacity',
        'current_fuel',
        'fuel_percentage',
        'is_available',
        'created_at',
    )
    list_filter = ('is_available', 'motorization')
    search_fields = ('brand', 'plate')
    ordering = ('-created_at',)


# ======================================================
# MISSION
# ======================================================
@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'driver',
        'truck',
        'status',
        'departure_city',
        'arrival_city',
        'distance',
        'created_at',
    )

    list_filter = (
        'status',
        'driver',
        'truck',
        'departure_city',
        'arrival_city',
    )

    search_fields = (
        'departure_city',
        'arrival_city',
        'container_number',
    )

    fields = (
        'driver',
        'truck',

        # DÉPART
        'departure_city',
        'departure_address',
        'pickup_time',

        # ARRIVÉE
        'arrival_city',
        'arrival_address',
        'expected_dropoff_time',

        # CONTENEUR
        'container_number',
        'container_type',

        # DONNÉES MISSION
        'distance',
        'estimated_fuel_cost',
        'actual_fuel_cost',
        'status',

        # TEMPS
        'actual_start_time',
        'actual_end_time',
        'hours_worked',
    )

    readonly_fields = (
        'actual_start_time',
        'actual_end_time',
        'hours_worked',
        'created_at',
        'updated_at',
    )

    ordering = ('-created_at',)


# ======================================================
# FUEL
# ======================================================
@admin.register(FuelEntry)
class FuelEntryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'truck',
        'mission',
        'quantity',
        'cost',
        'location',
        'created_at',
    )

    list_filter = ('truck', 'created_at')
    search_fields = ('truck__plate', 'location')
    ordering = ('-created_at',)


# ======================================================
# NOTIFICATION
# ======================================================
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'driver',
        'title',
        'notification_type',
        'is_read',
        'created_at',
    )

    list_filter = ('notification_type', 'is_read')
    search_fields = ('title', 'message')
    ordering = ('-created_at',)


# ======================================================
# WEEKLY STATS
# ======================================================
@admin.register(WeeklyStats)
class WeeklyStatsAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'driver',
        'week_start',
        'week_end',
        'total_kilometers',
        'total_hours_worked',
        'completed_missions',
    )

    list_filter = ('week_start',)
    ordering = ('-week_start',)
