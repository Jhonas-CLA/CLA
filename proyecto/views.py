from django.http import JsonResponse
from .models import Categoria

def listar_productos(request):
    productos = [
        {"id": 1, "nombre": "Bombillo LED", "precio": 5000},
        {"id": 2, "nombre": "Cable flexible 3x1.5mm", "precio": 12000},
    ]
    return JsonResponse(productos, safe=False)

def listar_categorias(request):
    categorias = list(Categoria.objects.values())
    return JsonResponse(categorias, safe=False)
