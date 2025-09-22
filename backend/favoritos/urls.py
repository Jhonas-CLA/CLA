# favoritos/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Listar todos los favoritos del usuario
    path('', views.listar_favoritos, name='listar_favoritos'),
    
    # Agregar producto a favoritos
    path('agregar/', views.agregar_favorito, name='agregar_favorito'),
    
    # Quitar producto de favoritos
    path('quitar/<int:producto_id>/', views.quitar_favorito, name='quitar_favorito'),
    
    # Verificar si un producto es favorito
    path('verificar/<int:producto_id>/', views.verificar_favorito, name='verificar_favorito'),
    
    # Toggle favorito (agregar/quitar)
    path('toggle/', views.toggle_favorito, name='toggle_favorito'),
]