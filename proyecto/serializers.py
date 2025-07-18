from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Producto
from .serializers import ProductoSerializer

@api_view(['GET'])
def productos_api(request):
    productos = Producto.objects.all()
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)
