# favoritos/admin.py
from django.contrib import admin
from .models import Favorito

@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'producto', 'fecha_agregado')
    list_filter = ('fecha_agregado', 'producto__categoria')
    search_fields = ('usuario__email', 'producto__nombre', 'producto__codigo')
    ordering = ('-fecha_agregado',)
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Si está editando
            return ('usuario', 'producto', 'fecha_agregado')
        return ('fecha_agregado',)