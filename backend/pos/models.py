import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password


# ─── User ─────────────────────────────────────────────────────────────────────

class User(models.Model):

    class Role(models.TextChoices):
        ADMIN            = 'admin',            'Admin'
        WATER_EMPLOYEE   = 'water_employee',   'Water Employee'
        LAUNDRY_EMPLOYEE = 'laundry_employee', 'Laundry Employee'

    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name     = models.CharField(max_length=150)
    email    = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role     = models.CharField(max_length=20, choices=Role.choices, default=Role.WATER_EMPLOYEE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Required by CustomJWTAuthentication
    is_active = True

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.name} ({self.role})'

    def set_password(self, raw_password):
        """Hash and store the password."""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Return True if raw_password matches the stored hash."""
        return django_check_password(raw_password, self.password)


# ─── Water ────────────────────────────────────────────────────────────────────

class WaterOrder(models.Model):

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

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=150)
    order_type    = models.CharField(max_length=10, choices=OrderType.choices)
    product       = models.CharField(max_length=30, choices=Product.choices)
    quantity      = models.PositiveIntegerField()
    unit_price    = models.DecimalField(max_digits=8, decimal_places=2)
    total         = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    order_date    = models.DateField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'water_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.customer_name} — {self.get_product_display()} x{self.quantity}'


# ─── Laundry ──────────────────────────────────────────────────────────────────

class LaundryOrder(models.Model):

    class PickupDay(models.TextChoices):
        MONDAY    = 'Monday',    'Monday'
        TUESDAY   = 'Tuesday',   'Tuesday'
        WEDNESDAY = 'Wednesday', 'Wednesday'
        THURSDAY  = 'Thursday',  'Thursday'
        FRIDAY    = 'Friday',    'Friday'
        SATURDAY  = 'Saturday',  'Saturday'
        SUNDAY    = 'Sunday',    'Sunday'

    class PaymentStatus(models.TextChoices):
        PAID   = 'Paid',   'Paid'
        UNPAID = 'Unpaid', 'Unpaid'

    class PaymentMethod(models.TextChoices):
        CASH  = 'Cash',  'Cash'
        GCASH = 'GCash', 'GCash'

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name  = models.CharField(max_length=150)
    pickup_day     = models.CharField(max_length=10, choices=PickupDay.choices)
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    total_php      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes          = models.TextField(blank=True, default='')
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laundry_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.customer_name} — {self.pickup_day} ({self.payment_status})'


class LaundryItem(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order        = models.ForeignKey(LaundryOrder, on_delete=models.CASCADE, related_name='items')
    label        = models.CharField(max_length=100)
    weight       = models.DecimalField(max_digits=6, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        db_table = 'laundry_items'

    def __str__(self):
        return f'{self.label} {self.weight}kg @ ₱{self.price_per_kg}/kg'


# ─── Audit Log ────────────────────────────────────────────────────────────────

class AuditLog(models.Model):

    class Status(models.TextChoices):
        SUCCESS = 'success', 'Success'
        FAILED  = 'failed',  'Failed'
        WARNING = 'warning', 'Warning'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_email  = models.CharField(max_length=255, default='system')
    user_name   = models.CharField(max_length=255, default='System')
    user_role   = models.CharField(max_length=100, blank=True)
    action      = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=100)
    entity_id   = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    before      = models.JSONField(null=True, blank=True)
    after       = models.JSONField(null=True, blank=True)
    status      = models.CharField(max_length=50, choices=Status.choices, default=Status.SUCCESS)
    branch      = models.CharField(max_length=255, default='Aqua Crystal')
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'[{self.timestamp:%Y-%m-%d %H:%M}] {self.action} by {self.user_email} — {self.status}'
