# create_superuser.py
# Coloca este archivo en la raíz de tu proyecto Django

import os
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Cambia 'backend' por el nombre de tu proyecto
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Crear superusuario solo si no existe
if not User.objects.filter(is_superuser=True).exists():
    print("Creando superusuario...")
    User.objects.create_superuser(
        email='codigolatino123@gmail.com', 
        password='123456'
    )
    print("✅ Superusuario creado exitosamente")
else:
    print("Ya existe un superusuario")