from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
   # Gestión de usuarios
    path('usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('usuarios/<int:usuario_id>/editar/', views.editar_usuario, name='editar_usuario'),
    path('usuarios/<int:usuario_id>/toggle-estado/', views.toggle_estado_usuario, name='toggle_estado_usuario'),
    path('usuarios/crear/', views.crear_usuario, name='crear_usuario'),
    
    # Configuración del admin
    path('perfil-admin/', views.perfil_admin, name='perfil_admin'),
    path('actualizar-perfil-admin/', views.actualizar_perfil_admin, name='actualizar_perfil_admin'),
    
    # Rutas de autenticación
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('forgot-password/', views.enviar_email_reset, name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', views.resetear_password, name='reset_password'),

    # CRUD usuarios
    path('usuarios/', views.lista_usuarios, name='lista_usuarios'),
    path('usuarios/<int:user_id>/', views.detalle_usuario, name='detalle_usuario'),
    path('usuarios/<int:user_id>/editar/', views.editar_usuario, name='editar_usuario'),
    path('usuarios/<int:user_id>/toggle-estado/', views.toggle_usuario_estado, name='toggle_usuario_estado'),

    # Dashboard de usuarios
    path('api/auth/profile/', views.get_profile, name='get_profile'),
    path('api/auth/profile/update/', views.update_profile, name='update_profile'),
    path('api/auth/change-password/', views.change_password, name='change_password'),

    # Autenticación con JWT
    path('api/auth/login/', views.login_user, name='login_user'),
    path('api/auth/logout/', views.logout_user, name='logout_user'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/profile/', views.get_profile, name='get_profile'),
    path('api/auth/admin-phone/', views.get_admin_phone, name='get_admin_phone'),

    # 📌 FIXED: Only one endpoint for WhatsApp orders
    path('api/whatsapp/pedido/', views.enviar_pedido_whatsapp, name='whatsapp_pedido'),
]