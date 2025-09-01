from django.urls import path
from .views import ProductListView, CategoryListView, obtener_productos, ProductDetailView

urlpatterns = [
    path('productos/', ProductListView.as_view(), name='productos'),
    path('categorias/', CategoryListView.as_view(), name='categorias'),
    path('productos/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('productos/ultimos/', obtener_productos, name='obtener-productos'),
]
