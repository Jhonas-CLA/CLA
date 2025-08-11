# Agregar estas líneas a tu urlpatterns existente en accounts/urls.py

from django.urls import path
from .views import enviar_email_reset, resetear_password, login_view
from accounts import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('forgot-password/', enviar_email_reset, name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', resetear_password, name='reset_password'),
    path('usuarios/', views.lista_usuarios, name='lista_usuarios'),
    path('usuarios/<int:user_id>/', views.detalle_usuario, name='detalle_usuario'),
    
    # NUEVAS RUTAS - agregar estas dos líneas:
    path('usuarios/<int:user_id>/editar/', views.editar_usuario, name='editar_usuario'),
    path('usuarios/<int:user_id>/toggle-estado/', views.toggle_usuario_estado, name='toggle_usuario_estado'),
]