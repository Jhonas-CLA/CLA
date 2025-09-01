from rest_framework import serializers
from products.models import Product, Category
import uuid
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    categoria = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = Product
        fields = ['id', 'codigo', 'nombre', 'descripcion', 'precio', 'cantidad', 'categoria','is_active']

    def validate_precio(self, value):
        if isinstance(value, str):
            value = value.replace(',', '.')
        return float(value)

    def create(self, validated_data):
        if not validated_data.get('codigo'):
            validated_data['codigo'] = str(uuid.uuid4())[:8]
        return super().create(validated_data)