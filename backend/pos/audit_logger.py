"""
audit_logger.py  ·  drop this in pos/audit_logger.py

Call log_action() from any view after a successful operation.
It never raises — a logging failure should never break a transaction.
"""

import logging
from pos.audit_model_ref import AuditLog   # adjust import path if needed

logger = logging.getLogger(__name__)


def log_action(
    *,
    request=None,          # pass the DRF request so we can pull user info automatically
    user_email: str = 'system',
    user_name:  str = 'System',
    user_role:  str = '',
    action:     str,
    entity_type: str,
    entity_id:  str  = '',
    description: str,
    before=None,
    after=None,
    status: str  = 'success',
    branch: str  = 'Aqua Crystal',
):
    """
    Create one immutable audit log entry.

    Usage — from a view:
        from pos.audit_logger import log_action

        log_action(
            request=request,
            action='create_order',
            entity_type='water_order',
            entity_id=str(order.id),
            description=f'{request.user.name} created water order #{order.id} for {order.customer_name} — ₱{order.total}',
            after={'customer': order.customer_name, 'total': str(order.total)},
        )
    """
    try:
        # Auto-fill user info from DRF request if not explicitly provided
        if request is not None and hasattr(request, 'user') and request.user is not None:
            u = request.user
            # Custom User model doesn't extend AbstractBaseUser so no is_authenticated attr
            is_auth = getattr(u, 'is_authenticated', False)
            if callable(is_auth):
                is_auth = is_auth()
            if is_auth or hasattr(u, 'email'):
                user_email = user_email if user_email != 'system' else getattr(u, 'email', str(u))
                user_name  = user_name  if user_name  != 'System' else getattr(u, 'name',  str(u))
                user_role  = user_role  or getattr(u, 'role', '')

        AuditLog.objects.create(
            user_email  = user_email,
            user_name   = user_name,
            user_role   = user_role,
            action      = action,
            entity_type = entity_type,
            entity_id   = str(entity_id),
            description = description,
            before      = before,
            after       = after,
            status      = status,
            branch      = branch,
        )
    except Exception as exc:
        # Never let logging break the main request
        logger.error("audit_logger failed: %s", exc, exc_info=True)
