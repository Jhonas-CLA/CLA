from django.contrib import admin
from .models import Documento

@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'fecha_subida']
    list_filter = ['tipo', 'fecha_subida']
    search_fields = ['nombre', 'descripcion']
    ordering = ['-fecha_subida']
    
    readonly_fields = ['fecha_subida']