from django.urls import path
from .views import obtener_cliente, PedidoListCreateView, get_cliente_info, actualizar_estado_pedido

urlpatterns = [
    path('', PedidoListCreateView.as_view(), name='pedido_list_create'),
    path('cliente/', obtener_cliente, name='obtener_cliente'),
    path('cliente/info/', get_cliente_info, name='get_cliente_info'),
    path('<int:pk>/estado/', actualizar_estado_pedido, name='actualizar_estado_pedido'),  # ✅ NUEVA RUTA
]
