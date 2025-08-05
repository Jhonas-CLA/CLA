from rest_framework import generics
from products.models import Product, Category
from backend.serializers import ProductSerializer, CategorySerializer
class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
