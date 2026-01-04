from django.core.management.base import BaseCommand
from logistics.models import Driver


class Command(BaseCommand):
    help = 'Reset les heures travaillées de tous les chauffeurs (à exécuter chaque dimanche à minuit)'

    def handle(self, *args, **options):
        drivers = Driver.objects.filter(is_active=True)
        count = 0

        for driver in drivers:
            old_hours = driver.hours_worked
            driver.reset_weekly_hours()
            count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ {driver.name}: {old_hours:.1f}h → 0h'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 {count} chauffeur(s) réinitialisé(s) avec succès!'
            )
        )