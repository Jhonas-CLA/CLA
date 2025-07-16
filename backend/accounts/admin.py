from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Campos que se muestran en la lista
    list_display = ['email', 'first_name', 'last_name', 'rol', 'is_active', 'date_joined']
    list_filter = ['rol', 'is_active', 'date_joined', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']  # Cambiar de 'username' a 'email'
    
    # Configuración para agregar usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'rol'),
        }),
    )
    
    # Configuración para editar usuario
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'phone', 'profile_image')}),
        ('Información adicional', {'fields': ('rol', 'email_verified')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Campos de solo lectura
    readonly_fields = ['date_joined', 'last_login']