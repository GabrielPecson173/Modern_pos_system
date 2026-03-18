import uuid
from django.db import models


class WaterOrder(models.Model):

    # ── Choices ───────────────────────────────────────────────────────────────

    class OrderType(models.TextChoices):
        WALK_IN = 'Walk-in', 'Walk-in'
        PHONE   = 'Phone',   'Phone'

    class Product(models.TextChoices):
        SLIM_500ML       = 'slim-500ml',       'Slim Bottle (500ml)'
        ROUND_1L         = 'round-1l',         'Round Bottle (1L)'
        FIVE_GAL_REFILL  = '5gal-refill',      '5-Gallon Refill'
        FIVE_GAL_DELIVER = '5gal-delivery',    '5-Gallon w/ Delivery'
        TEN_GAL_REFILL   = '10gal-refill',     '10-Gallon Refill'
        MINERAL_500ML    = 'mineral-500ml',    'Mineral Water 500ml'

    # ── Fields ────────────────────────────────────────────────────────────────

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    customer_name = models.CharField(max_length=150)
    order_type    = models.CharField(
        max_length=10,
        choices=OrderType.choices,
    )
    product = models.CharField(
        max_length=30,
        choices=Product.choices,
    )
    quantity   = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    total      = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    # Dates
    order_date = models.DateField(
        null=True,
        blank=True,
        help_text='Optional specific date for the order. Falls back to created_at date.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ── Auto-calculate total on save ──────────────────────────────────────────

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    # ── Meta ──────────────────────────────────────────────────────────────────

    class Meta:
        db_table  = 'water_orders'
        ordering  = ['-created_at']

    def __str__(self):
        return f'{self.customer_name} — {self.get_product_display()} x{self.quantity}'
