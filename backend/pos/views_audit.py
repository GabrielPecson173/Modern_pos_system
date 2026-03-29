"""
pos/views_audit.py

GET /api/audit-logs/   → admin only, returns all logs newest-first
No POST / PUT / DELETE exposed — logs are append-only via log_action().
"""

from rest_framework.views     import APIView
from rest_framework.response  import Response
from rest_framework           import status
from pos.authentication       import CustomJWTAuthentication
from pos.models_audit         import AuditLog


class AuditLogListView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        # Only admin may view audit logs
        user = request.user
        if not hasattr(user, 'role') or user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        logs = AuditLog.objects.all().order_by('-timestamp')[:2000]  # cap at 2 000 rows

        data = [
            {
                'id':          log.id,
                'timestamp':   log.timestamp.isoformat(),
                'user_email':  log.user_email,
                'user_name':   log.user_name,
                'user_role':   log.user_role,
                'action':      log.action,
                'entity_type': log.entity_type,
                'entity_id':   log.entity_id,
                'description': log.description,
                'before':      log.before,
                'after':       log.after,
                'status':      log.status,
                'branch':      log.branch,
            }
            for log in logs
        ]
        return Response(data)
