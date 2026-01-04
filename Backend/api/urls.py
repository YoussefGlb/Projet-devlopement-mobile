from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DriverViewSet,
    TruckViewSet,
    MissionViewSet,
    FuelEntryViewSet,
    NotificationViewSet,
    WeeklyStatsViewSet,
)

router = DefaultRouter()
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'trucks', TruckViewSet, basename='truck')
router.register(r'missions', MissionViewSet, basename='mission')
router.register(r'fuel', FuelEntryViewSet, basename='fuel')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'weekly-stats', WeeklyStatsViewSet, basename='weekly-stats')

urlpatterns = [
    # API REST STANDARD
    path('', include(router.urls)),

    # ⚠️ PRÊT POUR GOOGLE MAPS (SANS L'ACTIVER ENCORE)
    # Ces routes seront utilisées PLUS TARD par le mobile
    # Elles ne cassent RIEN aujourd’hui

    # Exemple futur :
    # path('missions/<int:pk>/route/', MissionRouteAPIView.as_view()),
]
