import os
import json
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  
django.setup()

from django.core.management import call_command
from products.models import Producto  # Ajusta la importación según tu modelo

def load_products():
    # Verificar si ya hay productos
    if Producto.objects.exists():
        print(f"Ya existen {Producto.objects.count()} productos en la base de datos")
        return
    
    # Cargar productos desde data.json
    try:
        print("Cargando productos desde data.json...")
        call_command('loaddata', 'data.json')
        print(f"✅ {Producto.objects.count()} productos cargados exitosamente")
    except Exception as e:
        print(f"❌ Error cargando productos: {e}")

if __name__ == "__main__":
    load_products()