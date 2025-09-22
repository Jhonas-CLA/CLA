# favoritos/models.py
from django.db import models
from django.conf import settings
from products.models import Product

class Favorito(models.Model):
    """Modelo para gestionar productos favoritos de los usuarios"""
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favoritos',
        verbose_name="Usuario"
    )
    producto = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favoritos',
        verbose_name="Producto"
    )
    fecha_agregado = models.DateTimeField(auto_now_add=True, verbose_name="Fecha agregado")
    
    class Meta:
        verbose_name = "Favorito"
        verbose_name_plural = "Favoritos"
        unique_together = ('usuario', 'producto')  # Un usuario no puede tener el mismo producto duplicado
        ordering = ['-fecha_agregado']
    
    def __str__(self):
        return f"{self.usuario.email} - {self.producto.nombre}"