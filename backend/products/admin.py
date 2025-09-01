from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'categoria', 'precio', 'cantidad', 'stock_status_display', 'is_active']
    list_filter = ['categoria', 'is_active', 'created_at']
    search_fields = ['nombre', 'codigo', 'descripcion']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('nombre', 'codigo', 'categoria', 'descripcion')
        }),
        ('Precio e inventario', {
            'fields': ('precio', 'cantidad')
        }),
        ('Imagen', {
            'fields': ('imagen',)
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def stock_status_display(self, obj):
        return obj.stock_status
    stock_status_display.short_description = "Estado del stock"
