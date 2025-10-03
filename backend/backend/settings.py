from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-d!3y1vgzp)ax)ist7+^ez^)z6wkjtf#l2on#h+75q9_hvt!87^'

DEBUG = True

# ALLOWED_HOSTS configurado para Render y Local
ALLOWED_HOSTS = [
    "electricosandsoluciones.onrender.com",  # dominio en Render
    "localhost",
    "127.0.0.1",
]

# Aplicaciones instaladas
INSTALLED_APPS = [
    'accounts',
    'products',
    'proveedores',
    'pedidos',
    'media',
    'favoritos',
    'documentos',

    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

# Templates
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

WSGI_APPLICATION = 'backend.wsgi.application'

# Base de datos (usa Render si no defines otras variables)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'proyectocla'),
        'USER': os.environ.get('DB_USER', 'proyectocla_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'TFjFDLeWZeif2FBhocd4BGVVBKQFZs0I'),
        'HOST': os.environ.get('DB_HOST', 'dpg-d3cmph37mgec73allsgg-a.oregon-postgres.render.com'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Archivos subidos (media)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Archivos estáticos
STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Validación de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internacionalización
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Modelo de usuario personalizado
AUTH_USER_MODEL = 'accounts.User'

# Configuración de correo
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'codigolatino123@gmail.com'
EMAIL_HOST_PASSWORD = 'ycax ybjy xog jvqb'
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# CORS y CSRF
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True


CORS_ALLOWED_ORIGINS = [
    "https://electricosandsolucionesfrontend.onrender.com",
]

if DEBUG:
    CORS_ALLOWED_ORIGINS += [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

CSRF_TRUSTED_ORIGINS = [
    "https://electricosandsolucionesfrontend.onrender.com",
]

if DEBUG:
    CSRF_TRUSTED_ORIGINS += [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

# DRF y JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Campo por defecto en modelos
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if os.environ.get('CREATE_SUPERUSER') == 'true':
    import django
    django.setup()
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            email='codigolatino123@gmail.com', 
            password='123456'
        )

FRONTEND_URL = "https://electricosandsolucionesfrontend.onrender.com"
