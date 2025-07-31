from django.urls import path
from .views import enviar_email_reset, resetear_password,login_view
from accounts import views


urlpatterns = [
    path('register/', views.register_view),
    path('login/', views.login_view),
    path('forgot-password/', enviar_email_reset),
    path('reset-password/<uidb64>/<token>/', resetear_password),
]
