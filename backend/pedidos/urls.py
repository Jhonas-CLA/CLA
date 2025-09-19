from django.urls import path
from .views import (
    obtener_cliente,
    PedidoListCreateView,
    get_cliente_info,
    actualizar_estado_pedido,
    get_pedidos_usuario,  # ✅ nueva vista
)

urlpatterns = [
    path('', PedidoListCreateView.as_view(), name='pedido_list_create'),   # Admin (todos los pedidos)
    path('cliente/', obtener_cliente, name='obtener_cliente'),
    path('cliente/info/', get_cliente_info, name='get_cliente_info'),
    path('<int:pk>/estado/', actualizar_estado_pedido, name='actualizar_estado_pedido'),
    path('mis-pedidos/', get_pedidos_usuario, name='get_pedidos_usuario'),  # ✅ User (solo sus pedidos)
]