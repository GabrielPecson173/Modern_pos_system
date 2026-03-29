from rest_framework import serializers
from .models import WaterOrder, LaundryOrder, LaundryItem, AuditLog


# ─── Water ────────────────────────────────────────────────────────────────────

class WaterOrderSerializer(serializers.ModelSerializer):

    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    product_display    = serializers.CharField(source='get_product_display',    read_only=True)

    class Meta:
        model  = WaterOrder
        fields = [
            'id', 'customer_name',
            'order_type', 'order_type_display',
            'product', 'product_display',
            'quantity', 'unit_price', 'total',
            'order_date', 'created_at', 'updated_at',
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


# ─── Laundry ──────────────────────────────────────────────────────────────────

class LaundryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LaundryItem
        fields = ['id', 'label', 'weight', 'price_per_kg']
        read_only_fields = ['id']


class LaundryOrderSerializer(serializers.ModelSerializer):
    items = LaundryItemSerializer(many=True)

    class Meta:
        model  = LaundryOrder
        fields = [
            'id', 'customer_name', 'pickup_day',
            'payment_status', 'payment_method',
            'total_php', 'notes', 'items',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = LaundryOrder.objects.create(**validated_data)
        for item in items_data:
            LaundryItem.objects.create(order=order, **item)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update scalar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace items if provided
        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                LaundryItem.objects.create(order=instance, **item)

        return instance


# ─── Audit Log ────────────────────────────────────────────────────────────────

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AuditLog
        fields = [
            'id', 'user_email', 'user_name', 'user_role',
            'action', 'entity_type', 'entity_id',
            'description', 'before', 'after',
            'status', 'branch', 'timestamp',
        ]
        read_only_fields = fields
