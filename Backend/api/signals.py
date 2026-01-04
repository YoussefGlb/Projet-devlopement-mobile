from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.cache import cache
from .models import Mission, Driver


@receiver(post_save, sender=Mission)
def update_driver_hours_on_completion(sender, instance, created, **kwargs):
    """
    Ajoute automatiquement les heures au driver quand une mission est terminée
    
    ⚠️ IMPORTANT: Les heures sont calculées sur la DURÉE PRÉVUE, pas la durée réelle
    → pickup_time jusqu'à expected_dropoff_time
    
    Exemple:
    - Pickup: 08:00
    - Expected dropoff: 14:00
    - Durée prévue: 6 heures ← C'est ce qui est comptabilisé
    
    (Peu importe si le driver termine en 5h ou 7h dans la réalité)
    """
    # Seulement si la mission vient d'être complétée
    if not created and instance.status == 'completed' and instance.driver:
        # Vérifier si les heures n'ont pas déjà été ajoutées
        cache_key = f'hours_added_mission_{instance.id}'
        
        if not cache.get(cache_key):
            # Calculer les heures basées sur la durée prévue
            if instance.pickup_time and instance.expected_dropoff_time:
                duration = instance.expected_dropoff_time - instance.pickup_time
                hours_to_add = duration.total_seconds() / 3600
                
                if hours_to_add > 0:
                    old_hours = instance.driver.hours_worked
                    instance.driver.hours_worked += hours_to_add
                    instance.driver.save()
                    
                    # Marquer comme fait (permanent)
                    cache.set(cache_key, True, None)
                    
                    print(f"✅ Mission #{instance.id} terminée")
                    print(f"   Driver: {instance.driver.name}")
                    print(f"   Heures ajoutées: {hours_to_add:.1f}h (durée prévue)")
                    print(f"   Total: {old_hours:.1f}h → {instance.driver.hours_worked:.1f}h")
                    print(f"   Restantes: {instance.driver.get_remaining_hours():.1f}h/{instance.driver.contractual_hours}h\n")