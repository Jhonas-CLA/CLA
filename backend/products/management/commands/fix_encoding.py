from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models

# Reemplazos comunes de errores de codificación (latin1 <-> utf8)
REPLACEMENTS = {
    "├í": "á", "├ü": "Á", "├│": "ó", "├║": "í", "├®": "é",
    "Ã±": "ñ", "├▒": "ñ", "┬░": "°", "Â°": "°", "┬║": "°",
    "Ã³": "ó", "Ã¡": "á", "Ã©": "é", "Ã­": "í", "Ãº": "ú",
    "Ã": "Á", "Ã‰": "É", "Ã": "Í", "Ã“": "Ó", "Ãš": "Ú",
    "Ã‘": "Ñ", "Ã¼": "ü", "Ãœ": "Ü",
    "â": "“", "â": "”", "â": "—", "â": "–",
    "â¢": "•", "â¦": "…", "Â¡": "¡", "Â¿": "¿", "├¡":"i", "├¡":"i",
    "┬¥ÔÇØ": "3/4 pulgada", "┬¢ÔÇØ": "1/2 pulgada",
}

def fix_text(text):
    """Corrige los textos con base en los reemplazos definidos."""
    if not text:
        return text
    for wrong, right in REPLACEMENTS.items():
        if wrong in text:
            text = text.replace(wrong, right)
    return text

class Command(BaseCommand):
    help = "Corrige problemas de codificación en todos los modelos con campos de texto"

    def handle(self, *args, **kwargs):
        updated = 0
        for model in apps.get_models():
            text_fields = [
                f for f in model._meta.get_fields()
                if isinstance(f, (models.CharField, models.TextField))
            ]
            if not text_fields:
                continue

            for obj in model.objects.all():
                changed = False
                for field in text_fields:
                    value = getattr(obj, field.name, None)
                    fixed = fix_text(value)
                    if value != fixed:
                        setattr(obj, field.name, fixed)
                        changed = True

                if changed:
                    obj.save()
                    updated += 1

        if updated:
            self.stdout.write(self.style.SUCCESS(f"✅ Se corrigieron {updated} registros"))
        else:
            self.stdout.write(self.style.WARNING("No había registros dañados."))
