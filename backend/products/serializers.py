# backend/products/serializers.py
from rest_framework import serializers
from .models import Product, Category, Cart, CartItem

# -------------------
# CATEGORÍAS
# -------------------
class CategorySerializer2(serializers.ModelSerializer):
    # Agregar slug para URLs amigables
    slug = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']
    
    def get_slug(self, obj):
        """Convertir nombre a slug para URLs"""
        return obj.name.lower().replace(' ', '-')

# -------------------
# PRODUCTOS
# -------------------
class ProductSerializer2(serializers.ModelSerializer):
    categoria = CategorySerializer2(read_only=True)  # Anida la categoría
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'nombre', 'codigo', 'precio', 'cantidad', 'imagen', 
            'imagen_url', 'descripcion', 'categoria', 'is_active', 
            'is_in_stock', 'stock_status'
        ]
    
    def get_imagen_url(self, obj):
        """Obtener URL completa de la imagen"""
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

# Este lo dejo porque lo pedías en otra vista (más simple)
class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(source="categoria.name", read_only=True)
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'nombre', 'precio', 'cantidad', 'imagen', 'imagen_url', 'categoria', 'descripcion']
    
    def get_imagen_url(self, obj):
        """Obtener URL completa de la imagen"""
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

# -------------------
# CARRITO
# -------------------
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer2(read_only=True)  # Muestra datos del producto
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal']
    
    def get_subtotal(self, obj):
        return float(obj.product.precio * obj.quantity)

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'items_count', 'total']
    
    def get_total(self, obj):
        return float(sum(item.product.precio * item.quantity for item in obj.items.all()))
    
    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())