# backend/products/views.py
from rest_framework.decorators import api_view
from rest_framework import generics
from rest_framework.response import Response
from .models import Product, Category, Cart, CartItem
from .serializers import ProductSerializer, CategorySerializer, ProductoSerializer, CartSerializer
from backend.serializers import ProductSerializer 
# -------------------
# PRODUCTOS Y CATEGORÍAS
# -------------------

class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().order_by('-id')
        
        # Filtro por ID de categoría
        categoria_id = self.request.query_params.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        
        # Filtro por nombre de categoría (corregido)
        categoria_nombre = self.request.query_params.get("categoria")
        if categoria_nombre:
            nombre_formateado = categoria_nombre.replace('-', ' ')
            queryset = queryset.filter(categoria__name__iexact=nombre_formateado)
        
        # Filtro por estado activo
        only_active = self.request.query_params.get('only_active')
        if only_active in ('1', 'true', 'True', 'yes'):
            queryset = queryset.filter(is_active=True) 
        
        return queryset


class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(['GET'])
def obtener_productos(request):
    queryset = Product.objects.filter(is_active=True).order_by('-id')
    
    # Filtro por ID de categoría
    categoria_id = request.query_params.get("categoria_id")
    if categoria_id:
        queryset = queryset.filter(categoria_id=categoria_id)
    
    # Filtro por nombre de categoría (corregido)
    categoria_nombre = request.query_params.get("categoria")
    if categoria_nombre:
        nombre_formateado = categoria_nombre.replace('-', ' ')
        queryset = queryset.filter(categoria__name__iexact=nombre_formateado)
    
    # Limitar a los últimos 15 productos
    queryset = queryset[:15]
    
    serializer = ProductoSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)

# -------------------
# CARRITO
# -------------------

@api_view(["GET"])
def obtener_carrito(request, cart_id):
    cart, _ = Cart.objects.get_or_create(id=cart_id)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(["POST"])
def agregar_producto(request, cart_id):
    cart, _ = Cart.objects.get_or_create(id=cart_id)
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=404)
    
    # Verificar stock disponible
    if product.cantidad < quantity:
        return Response({"error": "No hay suficiente stock disponible"}, status=400)
    
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        nueva_cantidad = item.quantity + quantity
        if product.cantidad < nueva_cantidad:
            return Response({"error": "No hay suficiente stock disponible"}, status=400)
        item.quantity = nueva_cantidad
    else:
        item.quantity = quantity
    item.save()
    
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(["POST"])
def eliminar_producto(request, cart_id):
    product_id = request.data.get("product_id")
    
    try:
        item = CartItem.objects.get(cart_id=cart_id, product_id=product_id)
        item.delete()
    except CartItem.DoesNotExist:
        return Response({"error": "Producto no está en el carrito"}, status=404)
    
    cart, _ = Cart.objects.get_or_create(id=cart_id)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(["POST"])
def actualizar_cantidad(request, cart_id):
    """Actualizar cantidad en el carrito"""
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))
    
    try:
        item = CartItem.objects.get(cart_id=cart_id, product_id=product_id)
        product = item.product
        
        # Verificar stock
        if product.cantidad < quantity:
            return Response({"error": "No hay suficiente stock disponible"}, status=400)
        
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
            
    except CartItem.DoesNotExist:
        return Response({"error": "Producto no está en el carrito"}, status=404)
    
    cart, _ = Cart.objects.get_or_create(id=cart_id)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)
