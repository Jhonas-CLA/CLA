# favoritos/serializers.py
from rest_framework import serializers
from .models import Favorito
from products.models import Product, Category

class ProductoFavoritoSerializer(serializers.ModelSerializer):
    """Serializer para mostrar los datos del producto en favoritos"""
    categoria_nombre = serializers.CharField(source='categoria.name', read_only=True)
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'codigo', 'nombre', 'precio', 'cantidad', 
            'imagen', 'imagen_url', 'descripcion', 'categoria_nombre',
            'is_active', 'created_at'
        ]
    
    def get_imagen_url(self, obj):
        """Devuelve la URL completa de la imagen"""
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

class FavoritoSerializer(serializers.ModelSerializer):
    """Serializer principal para favoritos"""
    producto = ProductoFavoritoSerializer(read_only=True)
    producto_id = serializers.IntegerField(write_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    
    class Meta:
        model = Favorito
        fields = [
            'id', 'producto', 'producto_id', 'usuario_email', 'fecha_agregado'
        ]
        read_only_fields = ['id', 'fecha_agregado']
    
    def validate_producto_id(self, value):
        """Validar que el producto existe y está activo"""
        try:
            producto = Product.objects.get(id=value, is_active=True)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("El producto no existe o está inactivo.")

class AgregarFavoritoSerializer(serializers.Serializer):
    """Serializer simplificado para agregar/quitar favoritos"""
    producto_id = serializers.IntegerField()
    
    def validate_producto_id(self, value):
        """Validar que el producto existe y está activo"""
        try:
            producto = Product.objects.get(id=value, is_active=True)
            return value
        except Product.DoesNotExist:
            raise serializers.ValidationError("El producto no existe o está inactivo.")