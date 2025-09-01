from django.db import models 
from django.core.validators import MinValueValidator
import uuid

class Category(models.Model):
    """Modelo para categorías de productos"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Modelo para productos"""
    categoria = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='products',
        verbose_name="Categoría"
    )
    nombre = models.CharField(max_length=200, verbose_name="Nombre")
    codigo = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Código",
        help_text="Código único del producto"
    )
    precio = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        verbose_name="Precio"
    )
    cantidad = models.PositiveIntegerField(
        default=0,
        verbose_name="Cantidad en stock"
    )
    imagen = models.ImageField(
        upload_to='products/',
        blank=True,
        null=True,
        verbose_name="Imagen del producto"
    )
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nombre} - {self.codigo}"
    
    @property
    def is_in_stock(self):
        """Verificar si el producto está en stock"""
        return self.cantidad > 0
    
    @property
    def stock_status(self):
        """Estado del stock"""
        if self.cantidad == 0:
            return "Sin stock"
        elif self.cantidad <= 5:
            return "Stock bajo"
        else:
            return "En stock"


class Cart(models.Model):
    """Carrito de compras (UUID para usuarios anónimos)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_price(self):
        return sum(item.subtotal() for item in self.items.all())

    def __str__(self):
        return f"Carrito {self.id} - {self.items.count()} items"


class CartItem(models.Model):
    """Productos dentro del carrito"""
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    def subtotal(self):
        return self.product.precio * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.product.nombre} en carrito {self.cart.id}"
