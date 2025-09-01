# backend/products/serializers.py
from rest_framework import serializers
from .models import Product # Ajusta el nombre si tu modelo es distinto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'nombre', 'precio', 'imagen','is_active']  # Ajusta los campos