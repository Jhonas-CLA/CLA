from django.db import models
from django.utils import timezone

class Pedido(models.Model):
    ESTADOS = [
        ("en_proceso", "En proceso"),
        ("empaquetado", "Empaquetado"),
        ("entregado", "Entregado"),
        ("cancelado", "Cancelado"),
    ]

    cliente = models.CharField(max_length=100)  # Nombre del cliente
    email = models.EmailField()  # Correo
    productos = models.JSONField(default=list)  # Lista de productos [{nombre, codigo, cantidad, precio}]
    total = models.DecimalField(max_digits=10, decimal_places=2)  # Total del pedido
    total_productos = models.PositiveIntegerField(default=0)  # Cantidad total de productos
    fecha = models.DateTimeField(default=timezone.now)  # Fecha de creación
    estado = models.CharField(max_length=20, choices=ESTADOS, default="en_proceso")  # ✅ Nuevo campo

    def __str__(self):
        return f"Pedido de {self.cliente} - {self.fecha.strftime('%Y-%m-%d %H:%M')} ({self.get_estado_display()})"
