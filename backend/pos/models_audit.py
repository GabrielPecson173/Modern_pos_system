from django.db import models


class AuditLog(models.Model):
    """
    Immutable audit trail. Never update or delete rows — append only.
    """

    # ── Who ───────────────────────────────────────────────────────────────────
    user_email = models.CharField(max_length=255, default='system')
    user_name  = models.CharField(max_length=255, default='System')
    user_role  = models.CharField(max_length=50,  default='')

    # ── What ──────────────────────────────────────────────────────────────────
    action      = models.CharField(max_length=50)   # e.g. create_order, login
    entity_type = models.CharField(max_length=50)   # e.g. water_order, laundry_order, user
    entity_id   = models.CharField(max_length=100, blank=True, default='')

    # Human-readable one-liner — the "what happened" sentence shown in UI
    description = models.TextField()

    # Before / after values stored as JSON strings for display
    before = models.JSONField(null=True, blank=True)
    after  = models.JSONField(null=True, blank=True)

    # ── Status ────────────────────────────────────────────────────────────────
    status = models.CharField(
        max_length=10,
        choices=[('success', 'Success'), ('failed', 'Failed')],
        default='success',
    )

    # ── Where ─────────────────────────────────────────────────────────────────
    branch = models.CharField(max_length=100, default='Aqua Crystal')

    # ── When ──────────────────────────────────────────────────────────────────
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        # Prevent any ORM-level update or delete
        # (enforced further in the view layer)

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {self.user_email} — {self.action}"

    # Make the model append-only at the ORM level
    def save(self, *args, **kwargs):
        if self.pk:
            raise PermissionError("Audit logs are immutable and cannot be edited.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise PermissionError("Audit logs cannot be deleted.")
