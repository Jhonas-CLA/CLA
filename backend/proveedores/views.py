from django.shortcuts import render
from rest_framework import viewsets
from .models import Proveedor
from .serializers import ProveedorSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('-creado_en')
    serializer_class = ProveedorSerializer


# Create your views here.
