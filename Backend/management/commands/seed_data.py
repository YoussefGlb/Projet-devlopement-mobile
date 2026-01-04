"""
Script pour peupler la base de données avec des données de test
Exécuter avec: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Driver, Truck, Mission, FuelEntry, Notification
from datetime import datetime, timedelta
from django.utils import timezone
import random


class Command(BaseCommand):
    help = 'Peuple la base de données avec des données de test'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Début du peuplement de la base de données...')

        # Créer des utilisateurs et chauffeurs
        self.create_drivers()
        
        # Créer des camions
        self.create_trucks()
        
        # Créer des missions
        self.create_missions()
        
        # Créer des entrées de carburant
        self.create_fuel_entries()
        
        # Créer des notifications
        self.create_notifications()

        self.stdout.write(self.style.SUCCESS('✅ Base de données peuplée avec succès!'))

    def create_drivers(self):
        self.stdout.write('👥 Création des chauffeurs...')
        
        drivers_data = [
            {
                'username': 'mohamed.elamrani',
                'email': 'mohamed@transport.ma',
                'name': 'Mohamed El Amrani',
                'phone': '+212 6 12 34 56 78',
                'contractual_hours': 60
            },
            {
                'username': 'ahmed.benali',
                'email': 'ahmed@transport.ma',
                'name': 'Ahmed Benali',
                'phone': '+212 6 23 45 67 89',
                'contractual_hours': 50
            },
            {
                'username': 'youssef.tazi',
                'email': 'youssef@transport.ma',
                'name': 'Youssef Tazi',
                'phone': '+212 6 34 56 78 90',
                'contractual_hours': 55
            }
        ]

        for data in drivers_data:
            username = data.pop('username')
            email = data['email']
            
            # Créer l'utilisateur
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email}
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'  ✓ Utilisateur créé: {username}')

            # Créer le chauffeur
            driver, created = Driver.objects.get_or_create(
                user=user,
                defaults=data
            )
            if created:
                self.stdout.write(f'  ✓ Chauffeur créé: {data["name"]}')

    def create_trucks(self):
        self.stdout.write('🚚 Création des camions...')
        
        trucks_data = [
            {
                'plate': '12345-A-6',
                'brand': 'Mercedes Actros',
                'capacity': 26000,
                'power': 450,
                'motorization': 'Diesel',
                'tank_capacity': 400,
                'current_fuel': 320
            },
            {
                'plate': '67890-B-2',
                'brand': 'Volvo FH16',
                'capacity': 28000,
                'power': 500,
                'motorization': 'Diesel',
                'tank_capacity': 500,
                'current_fuel': 150
            },
            {
                'plate': '24680-C-3',
                'brand': 'Scania R500',
                'capacity': 25000,
                'power': 480,
                'motorization': 'Diesel',
                'tank_capacity': 450,
                'current_fuel': 400
            },
            {
                'plate': '13579-D-4',
                'brand': 'MAN TGX',
                'capacity': 27000,
                'power': 470,
                'motorization': 'Diesel',
                'tank_capacity': 420,
                'current_fuel': 200
            }
        ]

        for data in trucks_data:
            truck, created = Truck.objects.get_or_create(
                plate=data['plate'],
                defaults=data
            )
            if created:
                self.stdout.write(f'  ✓ Camion créé: {data["brand"]} - {data["plate"]}')

    def create_missions(self):
        self.stdout.write('📦 Création des missions...')
        
        drivers = list(Driver.objects.all())
        trucks = list(Truck.objects.all())
        
        cities = [
            ('Casablanca', 'Port de Casablanca'),
            ('Rabat', 'Zone industrielle Hay Riad'),
            ('Tanger', 'Port Tanger Med'),
            ('Oujda', "Port d'Oujda"),
            ('Marrakech', 'Zone logistique'),
            ('Agadir', 'Port d\'Agadir')
        ]

        container_types = ['20ft', '40ft', '40ft HC']
        
        now = timezone.now()
        
        # Créer 15 missions avec différents statuts
        for i in range(15):
            departure = random.choice(cities)
            arrival = random.choice([c for c in cities if c != departure])
            
            pickup_time = now + timedelta(days=random.randint(-10, 10), hours=random.randint(6, 18))
            expected_dropoff_time = pickup_time + timedelta(hours=random.randint(4, 12))
            
            distance = random.randint(150, 600)
            estimated_fuel_cost = distance * random.uniform(1.5, 2.5)
            
            # Définir le statut
            if i < 2:
                status = 'in_progress'
                actual_start_time = pickup_time
                actual_end_time = None
            elif i < 7:
                status = 'pending'
                actual_start_time = None
                actual_end_time = None
            else:
                status = 'completed'
                actual_start_time = pickup_time - timedelta(days=random.randint(1, 5))
                actual_end_time = actual_start_time + timedelta(hours=random.randint(4, 10))
            
            mission = Mission.objects.create(
                driver=random.choice(drivers),
                truck=random.choice(trucks),
                departure_city=departure[0],
                departure_address=departure[1],
                pickup_time=pickup_time,
                arrival_city=arrival[0],
                arrival_address=arrival[1],
                expected_dropoff_time=expected_dropoff_time,
                container_number=f'CONT{1000 + i}',
                container_type=random.choice(container_types),
                distance=distance,
                estimated_fuel_cost=round(estimated_fuel_cost, 2),
                status=status,
                actual_start_time=actual_start_time,
                actual_end_time=actual_end_time
            )
            
            if status == 'completed':
                mission.calculate_hours_worked()
                mission.actual_fuel_cost = mission.estimated_fuel_cost * random.uniform(0.9, 1.1)
                mission.save()
            
            self.stdout.write(f'  ✓ Mission créée: {departure[0]} → {arrival[0]} ({status})')

    def create_fuel_entries(self):
        self.stdout.write('⛽ Création des entrées de carburant...')
        
        trucks = Truck.objects.all()
        
        for truck in trucks:
            # Créer 3-5 entrées de carburant par camion
            for _ in range(random.randint(3, 5)):
                FuelEntry.objects.create(
                    truck=truck,
                    quantity=random.uniform(100, 400),
                    cost=random.uniform(800, 3200),
                    location=random.choice(['Casablanca', 'Rabat', 'Tanger', 'Marrakech']),
                    notes='Plein de carburant'
                )
        
        self.stdout.write('  ✓ Entrées de carburant créées')

    def create_notifications(self):
        self.stdout.write('🔔 Création des notifications...')
        
        drivers = Driver.objects.all()
        
        notification_templates = [
            ('mission', 'Nouvelle mission assignée', 'Une nouvelle mission vous a été assignée.'),
            ('fuel', 'Niveau de carburant bas', 'Le niveau de carburant de votre camion est bas.'),
            ('general', 'Rappel', 'N\'oubliez pas de vérifier votre planning.'),
            ('mission', 'Mission proche', 'Votre prochaine mission commence dans 2 heures.'),
        ]

        for driver in drivers:
            for _ in range(random.randint(2, 4)):
                notif_type, title, message = random.choice(notification_templates)
                Notification.objects.create(
                    driver=driver,
                    title=title,
                    message=message,
                    notification_type=notif_type,
                    is_read=random.choice([True, False])
                )
        
        self.stdout.write('  ✓ Notifications créées')