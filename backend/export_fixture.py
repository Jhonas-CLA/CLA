import os
import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django.setup()

from django.core.management import call_command

os.makedirs("fixtures", exist_ok=True)

with open("fixtures/productos.json", "w", encoding="utf-8") as f:
    call_command("dumpdata", "products", indent=2, stdout=f)
