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
    # hice un cambio para que flitre (all()) asi estaba antes 
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # le agrege esto para que el codigo organice los productos y muestre los activos 

    def get_queryset(self):
        qs = Product.objects.all().order_by('-id')
        only_active = self.request.query_params.get('only_active')
        if only_active in ('1', 'true', 'True', 'yes'):
            qs = qs.filter(is_active=True)
        return qs

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(['GET'])
def obtener_productos(request):
    #hice un cambio para que flitre(asi estaba antes all().order_by('-id')[:15] )
    productos = Product.objects.filter(is_active=True).order_by('-id') # Últimos 15 productos
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)

class ProductDetailView(generics.RetrieveUpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer