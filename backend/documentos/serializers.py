from rest_framework import serializers
from .models import Documento

class DocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documento
        fields = "__all__"
        extra_kwargs = {
            "nombre": {"required": True},   # obligatorio
            "archivo": {"required": True},  # obligatorio
            "descripcion": {"required": False, "allow_blank": True},  # opcional
            "tipo": {"required": False},    # opcional
            "fecha_subida": {"required": False},  # opcional
        }
    
    def validate_tipo(self, value):
        """Validar que el tipo de archivo sea correcto"""
        tipos_validos = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
        if value.lower() not in tipos_validos:
            raise serializers.ValidationError("Tipo de archivo no válido")
        return value.lower()