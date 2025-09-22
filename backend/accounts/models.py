from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # ✅ Cambiado de 'administrador' a 'admin' para consistencia
        extra_fields.setdefault('rol', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True, verbose_name="Email")
    
    # ✅ Actualizamos las opciones del rol para consistencia
    rol = models.CharField(
        max_length=20, 
        choices=[
            ('usuario', 'Usuario'), 
            ('admin', 'Administrador')
        ], 
        default='usuario',
        verbose_name="Rol"
    )
    
    # ✅ Campos editables desde el admin
    first_name = models.CharField(max_length=30, blank=True, verbose_name="Nombre")
    last_name = models.CharField(max_length=30, blank=True, verbose_name="Apellido")
    phone = models.CharField(max_length=15, blank=True, null=True, verbose_name="Teléfono")
    
    # ✅ Mantenemos tus campos existentes
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True, verbose_name="Imagen de perfil")
    email_verified = models.BooleanField(default=False, verbose_name="Email verificado")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'accounts_user'  # ✅ Mantiene tu tabla actual
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Propiedad para obtener el nombre completo"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def save(self, *args, **kwargs):
        # ✅ Asegurar que el email esté en minúsculas
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)
    
    # ✅ Método helper para el frontend
    def get_profile_image_url(self):
        """Devuelve la URL de la imagen de perfil o None"""
        if self.profile_image:
            return self.profile_image.url
        return None