from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """
        Import des signals au démarrage de l'application
        Cette méthode est appelée automatiquement par Django
        """
        import api.signals  # ✅ Cette ligne active tous les signals