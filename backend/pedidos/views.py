from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Pedido
from .serializers import PedidoSerializer

User = get_user_model()

# ✅ Listar y crear pedidos (con validación de cliente por email)
class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all().order_by('-fecha')
    serializer_class = PedidoSerializer

    def perform_create(self, serializer):
        email = self.request.data.get("email")
        cliente_nombre = "Cliente desconocido"

        if email:
            try:
                user = User.objects.get(email=email)
                cliente_nombre = f"{user.first_name} {user.last_name}".strip() or "Sin nombre"
            except User.DoesNotExist:
                pass

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
