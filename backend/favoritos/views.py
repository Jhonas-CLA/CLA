# favoritos/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Favorito
from .serializers import FavoritoSerializer, AgregarFavoritoSerializer
from products.models import Product

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_favoritos(request):
    """Listar todos los favoritos del usuario autenticado"""
    try:
        favoritos = Favorito.objects.filter(usuario=request.user).select_related(
            'producto', 'producto__categoria'
        )
        
        serializer = FavoritoSerializer(favoritos, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'favoritos': serializer.data,
            'total': favoritos.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Error al cargar favoritos',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def agregar_favorito(request):
    """Agregar un producto a favoritos"""
    serializer = AgregarFavoritoSerializer(data=request.data)
    
    if serializer.is_valid():
        producto_id = serializer.validated_data['producto_id']
        producto = get_object_or_404(Product, id=producto_id, is_active=True)
        
        # Verificar si ya está en favoritos
        favorito_existente = Favorito.objects.filter(
            usuario=request.user, 
            producto=producto
        ).first()
        
        if favorito_existente:
            return Response({
                'success': False,
                'error': 'Este producto ya está en tus favoritos',
                'ya_existe': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear el favorito
        favorito = Favorito.objects.create(
            usuario=request.user,
            producto=producto
        )
        
        favorito_serializer = FavoritoSerializer(favorito, context={'request': request})
        
        return Response({
            'success': True,
            'message': 'Producto agregado a favoritos',
            'favorito': favorito_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'error': 'Datos inválidos',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def quitar_favorito(request, producto_id):
    """Quitar un producto de favoritos"""
    try:
        favorito = Favorito.objects.get(
            usuario=request.user, 
            producto_id=producto_id
        )
        favorito.delete()
        
        return Response({
            'success': True,
            'message': 'Producto quitado de favoritos'
        }, status=status.HTTP_200_OK)
        
    except Favorito.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Este producto no está en tus favoritos'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Error al quitar de favoritos',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verificar_favorito(request, producto_id):
    """Verificar si un producto está en favoritos del usuario"""
    try:
        es_favorito = Favorito.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).exists()
        
        return Response({
            'success': True,
            'es_favorito': es_favorito
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': 'Error al verificar favorito',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorito(request):
    """Alternar favorito (agregar si no existe, quitar si existe)"""
    serializer = AgregarFavoritoSerializer(data=request.data)
    
    if serializer.is_valid():
        producto_id = serializer.validated_data['producto_id']
        producto = get_object_or_404(Product, id=producto_id, is_active=True)
        
        favorito_existente = Favorito.objects.filter(
            usuario=request.user, 
            producto=producto
        ).first()
        
        if favorito_existente:
            # Quitar de favoritos
            favorito_existente.delete()
            return Response({
                'success': True,
                'action': 'removed',
                'message': 'Producto quitado de favoritos',
                'es_favorito': False
            }, status=status.HTTP_200_OK)
        else:
            # Agregar a favoritos
            favorito = Favorito.objects.create(
                usuario=request.user,
                producto=producto
            )
            favorito_serializer = FavoritoSerializer(favorito, context={'request': request})
            
            return Response({
                'success': True,
                'action': 'added',
                'message': 'Producto agregado a favoritos',
                'favorito': favorito_serializer.data,
                'es_favorito': True
            }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'error': 'Datos inválidos',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)