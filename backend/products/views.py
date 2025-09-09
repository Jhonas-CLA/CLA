# backend/products/views.py
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status

from .models import Product, Category, Cart, CartItem
from backend.serializers import ProductSerializer, CategorySerializer
from .serializers import (
    ProductSerializer2,
    CategorySerializer2,
    ProductoSerializer,
    CartSerializer,
)

# -------------------
# PRODUCTOS Y CATEGORÍAS
# -------------------

class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().order_by("-id")

        # Filtro por ID de categoría
        categoria_id = self.request.query_params.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        # Filtro por nombre de categoría con mapeo
        categoria_nombre = self.request.query_params.get("categoria")
        if categoria_nombre:
            categoriasMap = {
                "automaticos-breakers": "Automáticos / Breakers",
                "alambres-cables": "Alambres y Cables",
                "abrazaderas-amarres": "Abrazaderas y Amarres",
                "accesorios-canaletas-emt-pvc": "Accesorios para Canaletas / EMT / PVC",
                "bornas-conectores": "Bornas y Conectores",
                "herramientas-accesorios-especiales": "Herramientas y Accesorios Especiales",
                "boquillas": "Boquillas",
                "cajas": "Cajas",
                "canaletas": "Canaletas",
                "capacetes-chazos": "Capacetes y Chazos",
                "cintas-aislantes": "Cintas Aislantes",
                "clavijas": "Clavijas",
                "conectores": "Conectores",
                "contactores-contadores": "Contactores y Contadores",
                "curvas-accesorios-tuberia": "Curvas y Accesorios de Tubería",
                "discos-pulidora": "Discos para Pulidora",
                "duchas": "Duchas",
                "extensiones-multitomas": "Extensiones y Multitomas",
                "hebillas-grapas-perchas": "Hebillas, Grapas y Perchas",
                "iluminacion": "Iluminación",
                "instrumentos-medicion": "Instrumentos de Medición",
                "interruptores-programadores": "Interruptores y Programadores",
                "otros-miscelaneos": "Otros / Misceláneos",
                "portalamparas-plafones": "Portalamparas y Plafones",
                "reflectores-fotoceldas": "Reflectores y Fotoceldas",
                "reles": "Relés",
                "rosetas": "Rosetas",
                "sensores-temporizadores": "Sensores y Temporizadores",
                "soldaduras": "Soldaduras",
                "soportes-pernos-herrajes": "Soportes, Pernos y Herrajes",
                "tableros-electricos": "Tableros Eléctricos",
                "tapas-accesorios-superficie": "Tapas y Accesorios de Superficie",
                "tensores": "Tensores",
                "terminales-uniones": "Terminales y Uniones",
                "timbres": "Timbres",
                "tomas-enchufes": "Tomas y Enchufes",
                "tuberia": "Tuberia",
            }
            categoria_exacta = categoriasMap.get(categoria_nombre)
            if categoria_exacta:
                queryset = queryset.filter(categoria__name__iexact=categoria_exacta)
            else:
                nombre_formateado = categoria_nombre.replace("-", " ").title()
                queryset = queryset.filter(categoria__name__iexact=nombre_formateado)

        # Filtro por estado activo
        only_active = self.request.query_params.get("only_active")
        if only_active in ("1", "true", "True", "yes"):
            queryset = queryset.filter(is_active=True)

        return queryset


class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(["GET"])
def obtener_productos(request):
    """
    Endpoint para obtener productos con filtros
    """
    try:
        queryset = Product.objects.filter(is_active=True).order_by("-id")

        # Filtro por ID de categoría
        categoria_id = request.query_params.get("categoria_id")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        # Filtro por nombre de categoría con mapeo
        categoria_nombre = request.query_params.get("categoria")
        if categoria_nombre:
            categoriasMap = {
                "automaticos-breakers": "Automáticos / Breakers",
                "alambres-cables": "Alambres y Cables",
                "abrazaderas-amarres": "Abrazaderas y Amarres",
                "accesorios-canaletas-emt-pvc": "Accesorios para Canaletas / EMT / PVC",
                "bornas-conectores": "Bornas y Conectores",
                "herramientas-accesorios-especiales": "Herramientas y Accesorios Especiales",
                "boquillas": "Boquillas",
                "cajas": "Cajas",
                "canaletas": "Canaletas",
                "capacetes-chazos": "Capacetes y Chazos",
                "cintas-aislantes": "Cintas Aislantes",
                "clavijas": "Clavijas",
                "conectores": "Conectores",
                "contactores-contadores": "Contactores y Contadores",
                "curvas-accesorios-tuberia": "Curvas y Accesorios de Tubería",
                "discos-pulidora": "Discos para Pulidora",
                "duchas": "Duchas",
                "extensiones-multitomas": "Extensiones y Multitomas",
                "hebillas-grapas-perchas": "Hebillas, Grapas y Perchas",
                "iluminacion": "Iluminación",
                "instrumentos-medicion": "Instrumentos de Medición",
                "interruptores-programadores": "Interruptores y Programadores",
                "otros-miscelaneos": "Otros / Misceláneos",
                "portalamparas-plafones": "Portalamparas y Plafones",
                "reflectores-fotoceldas": "Reflectores y Fotoceldas",
                "reles": "Relés",
                "rosetas": "Rosetas",
                "sensores-temporizadores": "Sensores y Temporizadores",
                "soldaduras": "Soldaduras",
                "soportes-pernos-herrajes": "Soportes, Pernos y Herrajes",
                "tableros-electricos": "Tableros Eléctricos",
                "tapas-accesorios-superficie": "Tapas y Accesorios de Superficie",
                "tensores": "Tensores",
                "terminales-uniones": "Terminales y Uniones",
                "timbres": "Timbres",
                "tomas-enchufes": "Tomas y Enchufes",
                "tuberia": "Tuberia",
            }
            categoria_exacta = categoriasMap.get(categoria_nombre)
            if categoria_exacta:
                queryset = queryset.filter(categoria__name__iexact=categoria_exacta)
            else:
                nombre_formateado = categoria_nombre.replace("-", " ").title()
                queryset = queryset.filter(categoria__name__iexact=nombre_formateado)

        # Límite opcional
        limite = request.query_params.get("limite")
        if limite:
            try:
                limite = int(limite)
                queryset = queryset[:limite]
            except ValueError:
                pass

        serializer = ProductoSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"error": "Error al obtener productos", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def obtener_categorias(request):
    try:
        categorias = Category.objects.all().order_by("name")
        serializer = CategorySerializer(
            categorias, many=True, context={"request": request}
        )
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": "Error al obtener categorías", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

# -------------------
# CARRITO
# -------------------

@api_view(["GET"])
def obtener_carrito(request, cart_id):
    cart, _ = Cart.objects.get_or_create(id=cart_id)
    serializer = CartSerializer(cart, context={"request": request})
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

    serializer = CartSerializer(cart, context={"request": request})
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
    serializer = CartSerializer(cart, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
def actualizar_cantidad(request, cart_id):
    product_id = request.data.get("product_id")
    quantity = int(request.data.get("quantity", 1))

    try:
        item = CartItem.objects.get(cart_id=cart_id, product_id=product_id)
        product = item.product

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
    serializer = CartSerializer(cart, context={"request": request})
    return Response(serializer.data)