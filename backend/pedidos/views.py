from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Pedido
from .serializers import PedidoSerializer
from django.db.models import Count
from rest_framework.exceptions import ValidationError 

User = get_user_model()

# ✅ Listar y crear pedidos (con validación de cliente por email)
class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all().order_by('-fecha')
    serializer_class = PedidoSerializer
    
    def perform_create(self, serializer):
        email = self.request.data.get("email")
        if not email:
            raise ValidationError({"email": "El email es obligatorio."})

        try:
            user = User.objects.get(email=email)
            cliente_nombre = f"{user.first_name} {user.last_name}".strip() or "Sin nombre"
        except User.DoesNotExist:
            raise ValidationError({"email": "El usuario con este email no existe."})

        # Descontar stock de productos al confirmar pedido
        productos_pedido = self.request.data.get("productos", [])
        from products.models import Product
        for prod in productos_pedido:
            try:
                producto_obj = Product.objects.get(codigo=prod.get("codigo"))
                cantidad_pedida = int(prod.get("cantidad", 1))
                if producto_obj.cantidad < cantidad_pedida:
                    raise ValidationError({"stock": f"No hay suficiente stock de {producto_obj.nombre}"})
                producto_obj.cantidad -= cantidad_pedida
                producto_obj.save()
            except Product.DoesNotExist:
                raise ValidationError({"producto": f"No existe el producto con código {prod.get('codigo')}"})

        serializer.save(cliente=cliente_nombre, email=email)
# ✅ Actualizar estado del pedido
@api_view(['PATCH'])
def actualizar_estado_pedido(request, pk):
    try:
        pedido = Pedido.objects.get(pk=pk)
    except Pedido.DoesNotExist:
        return Response({"error": "Pedido no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    nuevo_estado = request.data.get("estado")
    if nuevo_estado not in dict(Pedido.ESTADOS):
        return Response({"error": "Estado inválido"}, status=status.HTTP_400_BAD_REQUEST)
    
    pedido.estado = nuevo_estado
    pedido.save()
    return Response(PedidoSerializer(pedido).data)

# ✅ Traer información del cliente autenticado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cliente_info(request):
    full_name = f"{request.user.first_name} {request.user.last_name}".strip()
    return Response({
        'id': request.user.id,
        'nombre': full_name,
        'email': request.user.email,
    })

# ✅ Obtener cliente por email (para frontend)
@api_view(['GET'])
def obtener_cliente(request):
    email = request.GET.get('email')
    if not email:
        return Response({"error": "Email requerido"}, status=400)
    
    try:
        user = User.objects.get(email=email)
        full_name = f"{user.first_name} {user.last_name}".strip() or "Sin nombre"
        return Response({"nombre": full_name})
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)

# ✅ Nueva vista: Obtener pedidos del usuario autenticado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pedidos_usuario(request):
    """
    Obtiene todos los pedidos del usuario autenticado basado en su email
    """
    try:
        # Filtrar pedidos por el email del usuario autenticado
        pedidos = Pedido.objects.filter(email=request.user.email).order_by('-fecha')
        serializer = PedidoSerializer(pedidos, many=True)
        
        return Response({
            'pedidos': serializer.data,
            'total_pedidos': pedidos.count()
        })
        
    except Exception as e:
        return Response({
            'error': 'Error al obtener los pedidos',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Nueva vista: Analíticas de pedidos por estado
@api_view(['GET'])
def analiticas_pedidos(request):
    """
    Devuelve el porcentaje de pedidos por estado.
    """
    # Contamos los pedidos agrupados por estado
    total_pedidos = Pedido.objects.count()
    conteo_por_estado = Pedido.objects.values('estado').annotate(total=Count('estado'))

    # Si no hay pedidos, devolvemos 0 para todos
    if total_pedidos == 0:
        return Response({
            "en_proceso": {"count": 0, "porcentaje": 0},
            "empaquetado": {"count": 0, "porcentaje": 0},
            "entregado": {"count": 0, "porcentaje": 0},
            "cancelado": {"count": 0, "porcentaje": 0},
            "total_pedidos": 0
        })

    # Generamos el diccionario con porcentajes
    analiticas = {
        "en_proceso": {"count": 0, "porcentaje": 0},
        "empaquetado": {"count": 0, "porcentaje": 0},
        "entregado": {"count": 0, "porcentaje": 0},
        "cancelado": {"count": 0, "porcentaje": 0},
        "total_pedidos": total_pedidos
    }

    for estado_data in conteo_por_estado:
        estado = estado_data['estado']
        cantidad = estado_data['total']
        porcentaje = round((cantidad / total_pedidos) * 100, 2)

        analiticas[estado] = {
            "count": cantidad,
            "porcentaje": porcentaje
        }

    return Response(analiticas)
