from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from .models import Documento
from .serializers import DocumentoSerializer
import mimetypes
import os

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer
    
    def perform_create(self, serializer):
        """Al crear un documento, extraer el tipo del archivo"""
        archivo = self.request.FILES.get('archivo')
        if archivo:
            extension = os.path.splitext(archivo.name)[1].lower().replace('.', '')
            serializer.save(tipo=extension)
        else:
            serializer.save()
    
    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        """Endpoint para descargar documentos con el tipo MIME correcto"""
        documento = self.get_object()
        
        # Mapeo de tipos MIME
        mime_types = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
        }
        
        mime_type = mime_types.get(documento.tipo.lower(), 'application/octet-stream')
        
        try:
            response = FileResponse(
                documento.archivo.open('rb'),
                content_type=mime_type
            )
            response['Content-Disposition'] = f'attachment; filename="{documento.nombre}"'
            return response
        except Exception as e:
            return Response(
                {'error': f'No se pudo descargar el archivo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def list(self, request, *args, **kwargs):
        """Listar todos los documentos ordenados por fecha"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)