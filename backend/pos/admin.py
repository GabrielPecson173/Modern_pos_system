from django.contrib import admin
from .models import WaterOrder


@admin.register(WaterOrder)
class WaterOrderAdmin(admin.ModelAdmin):
    list_display  = [
        'customer_name', 'order_type', 'product',
        'quantity', 'unit_price', 'total',
        'order_date', 'created_at',
    ]
    list_filter   = ['order_type', 'product', 'order_date']
    search_fields = ['customer_name']
    readonly_fields = ['id', 'total', 'created_at', 'updated_at']
    ordering      = ['-created_at']
