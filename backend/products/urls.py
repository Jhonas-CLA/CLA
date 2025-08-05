from django.urls import path
from .views import ProductListView, CategoryListView

urlpatterns = [
    path('productos/', ProductListView.as_view(), name='productos'),
    path('categorias/', CategoryListView.as_view(), name='categorias'),
]
