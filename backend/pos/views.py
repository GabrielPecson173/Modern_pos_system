from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import WaterOrder, LaundryOrder, AuditLog
from .serializers import WaterOrderSerializer, LaundryOrderSerializer, AuditLogSerializer


class WaterOrderViewSet(viewsets.ModelViewSet):
    queryset         = WaterOrder.objects.all()
    serializer_class = WaterOrderSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['customer_name']
    ordering_fields  = ['created_at', 'order_date', 'total', 'customer_name']
    ordering         = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(order_date=date) | qs.filter(
                order_date__isnull=True, created_at__date=date,
            )
        order_type = self.request.query_params.get('order_type')
        if order_type:
            qs = qs.filter(order_type=order_type)
        product = self.request.query_params.get('product')
        if product:
            qs = qs.filter(product=product)
        return qs

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        qs = self.get_queryset()
        result = qs.aggregate(total_revenue=Sum('total'))
        return Response({
            'total_orders':  qs.count(),
            'total_revenue': result['total_revenue'] or 0,
        })


class LaundryOrderViewSet(viewsets.ModelViewSet):
    queryset         = LaundryOrder.objects.prefetch_related('items').all()
    serializer_class = LaundryOrderSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['customer_name']
    ordering_fields  = ['created_at', 'pickup_day', 'payment_status', 'total_php']
    ordering         = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        pickup_day = self.request.query_params.get('pickup_day')
        if pickup_day:
            qs = qs.filter(pickup_day=pickup_day)
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        return qs


# ─── Audit Log ────────────────────────────────────────────────────────────────

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /api/audit-logs/        — list all logs (newest first)
    GET  /api/audit-logs/<id>/   — retrieve single log

    Query params:
      ?action=login
      ?entity_type=session
      ?status=failed
      ?user_email=admin@aquacrystal.com
      ?user_role=admin
      ?search=<searches description, user_name, user_email, action>
    """
    queryset         = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ['description', 'user_name', 'user_email', 'action', 'entity_type']
    ordering_fields  = ['timestamp', 'action', 'status', 'user_email']
    ordering         = ['-timestamp']

    def get_queryset(self):
        qs = super().get_queryset()
        for param in ['action', 'entity_type', 'status', 'user_email', 'user_role']:
            val = self.request.query_params.get(param)
            if val:
                qs = qs.filter(**{param: val})
        return qs
