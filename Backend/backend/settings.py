from pathlib import Path

# =========================
# BASE DIR
# =========================
BASE_DIR = Path(__file__).resolve().parent.parent


# =========================
# SECURITY
# =========================
SECRET_KEY = 'django-insecure-change-this-key'

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '192.168.3.50',
]


# =========================
# APPLICATIONS
# =========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local
    # ✅ CHANGÉ: Utilise la forme complète pour activer les signals
    'api.apps.ApiConfig',  # Au lieu de juste 'api'
]


# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# =========================
# CORS (React Native)
# =========================
CORS_ALLOW_ALL_ORIGINS = True


# =========================
# URLS
# =========================
ROOT_URLCONF = 'backend.urls'


# =========================
# TEMPLATES
# =========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =========================
# WSGI
# =========================
WSGI_APPLICATION = 'backend.wsgi.application'


# =========================
# DATABASE
# =========================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# =========================
# PASSWORD VALIDATION
# =========================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# =========================
# INTERNATIONALIZATION
# =========================
LANGUAGE_CODE = 'fr-fr'

# ✅ CHANGÉ: Timezone du Maroc
TIME_ZONE = 'Africa/Casablanca'

USE_I18N = True

# ✅ CHANGÉ: Activé pour utiliser les timezones
USE_TZ = True


# =========================
# CACHE (POUR LE WEEKLY RESET)
# =========================
# ✅ AJOUTÉ: Configuration du cache pour éviter les resets multiples
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'logistics-cache',
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}


# =========================
# STATIC FILES
# =========================
STATIC_URL = 'static/'


# =========================
# DEFAULT PRIMARY KEY
# =========================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================
# DJANGO REST FRAMEWORK
# =========================
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}


# =========================
# GOOGLE MAPS API
# =========================
# ✅ CLÉ API POUR CALCUL DES ITINÉRAIRES
GOOGLE_MAPS_API_KEY = 'AIzaSyDnnpuAgBvalPKEIRehlhWLHnK-ZhwSekQ'