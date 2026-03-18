from rest_framework import serializers
from .models import WaterOrder


class WaterOrderSerializer(serializers.ModelSerializer):

    # total is computed in model.save() — expose as read-only
    total = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    # Human-readable labels for choices (used in GET responses)
    order_type_display = serializers.CharField(
        source='get_order_type_display',
        read_only=True,
    )
    product_display = serializers.CharField(
        source='get_product_display',
        read_only=True,
    )

    class Meta:
        model  = WaterOrder
        fields = [
            'id',
            'customer_name',
            'order_type',
            'order_type_display',
            'product',
            'product_display',
            'quantity',
            'unit_price',
            'total',
            'order_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'total', 'created_at', 'updated_at']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError('Quantity must be at least 1.')
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Unit price must be greater than 0.')
        return value
