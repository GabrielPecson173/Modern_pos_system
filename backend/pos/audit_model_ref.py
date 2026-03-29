# pos/audit_model_ref.py
# Thin re-export so audit_logger.py can import AuditLog without circular imports.

from pos.models import AuditLog

__all__ = ['AuditLog']
