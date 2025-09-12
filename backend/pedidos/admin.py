from django.contrib import admin
from .models import Pedido

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'email', 'total', 'fecha')
    search_fields = ('cliente', 'email')
    list_filter = ('fecha',)


# Register your models here.
