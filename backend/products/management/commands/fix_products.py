# backend/products/management/commands/fix_products.py
from django.core.management.base import BaseCommand
from products.models import Product

# Reemplazos comunes por errores de codificación (latin1 -> utf8)
REPLACEMENTS = {
    "├í": "á",
    "├│": "ó",
    "├║": "í",
    "├®": "é",
    "Ã±": "ñ",
    "├▒": "ñ",
    "┬░": "°",
    "Â°": "°",  
    "┬║": "°",
    "Ã³": "ó",
    "Ã¡": "á",
    "Ã©": "é",
    "Ã­": "í",
    "Ãº": "ú",
}

def fix_text(text):
    if not text:
        return text
    for wrong, right in REPLACEMENTS.items():
        text = text.replace(wrong, right)
    return text

class Command(BaseCommand):
    help = "Corrige problemas de codificación en los productos (tildes, ñ, ° → #, etc.)"

    def handle(self, *args, **kwargs):
        updated = 0
        for product in Product.objects.all():
            fixed_nombre = fix_text(product.nombre)
            fixed_desc = fix_text(product.descripcion)

            if product.nombre != fixed_nombre or product.descripcion != fixed_desc:
                product.nombre = fixed_nombre
                product.descripcion = fixed_desc
                product.save()
                updated += 1

        if updated:
            self.stdout.write(self.style.SUCCESS(f"✅ Se corrigieron {updated} productos"))
        else:
            self.stdout.write(self.style.WARNING("No había productos para corregir."))