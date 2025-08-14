from rest_framework.decorators import api_view
from rest_framework import generics
from rest_framework.response import Response
from .models import Product
from .serializers import ProductoSerializer
from .models import Product
from .serializers import ProductoSerializer
from products.models import Product, Category
from backend.serializers import ProductSerializer, CategorySerializer
class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(['GET'])
def obtener_productos(request):
    productos = Product.objects.all().order_by('-id')[:15]  # Últimos 15 productos
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)
