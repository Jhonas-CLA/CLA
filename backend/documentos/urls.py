from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentoViewSet

router = DefaultRouter()
router.register(r'documentos', DocumentoViewSet, basename='documento')

app_name = 'documentos'

urlpatterns = [
    path('', include(router.urls)),
]