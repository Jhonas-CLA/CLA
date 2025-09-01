# backend/products/urls.py
from django.urls import path
from .views import (
    ProductListView, CategoryListView, ProductDetailView, obtener_productos,
    obtener_carrito, agregar_producto, eliminar_producto, actualizar_cantidad
)

urlpatterns = [
    # -------------------
    # Productos y categorías
    # -------------------
    path('productos/', ProductListView.as_view(), name='productos'),
    path('productos/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('productos/ultimos/', obtener_productos, name='obtener_productos'),
    path('categorias/', CategoryListView.as_view(), name='categorias'),
    
    # -------------------
    # Carrito
    # -------------------
    path('carrito/<uuid:cart_id>/', obtener_carrito, name='obtener_carrito'),
    path('carrito/<uuid:cart_id>/agregar/', agregar_producto, name='agregar_producto'),
    path('carrito/<uuid:cart_id>/eliminar/', eliminar_producto, name='eliminar_producto'),
    path('carrito/<uuid:cart_id>/actualizar/', actualizar_cantidad, name='actualizar_cantidad'),
]