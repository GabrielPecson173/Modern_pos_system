from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import WaterOrder
from .serializers import WaterOrderSerializer


class WaterOrderViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for water orders.

    GET    /api/water-orders/          — list all (supports ?date=, ?order_type=, ?product=)
    POST   /api/water-orders/          — create new order
    GET    /api/water-orders/<id>/     — retrieve single order
    PATCH  /api/water-orders/<id>/     — partial update
    DELETE /api/water-orders/<id>/     — delete

    GET    /api/water-orders/summary/  — daily totals summary
    """

    queryset           = WaterOrder.objects.all()
    serializer_class   = WaterOrderSerializer
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['customer_name']
    ordering_fields    = ['created_at', 'order_date', 'total', 'customer_name']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()

        # Filter by specific date (order_date or created_at date)
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(order_date=date) | qs.filter(
                order_date__isnull=True,
                created_at__date=date,
            )

        # Filter by order type
        order_type = self.request.query_params.get('order_type')
        if order_type:
            qs = qs.filter(order_type=order_type)

        # Filter by product
        product = self.request.query_params.get('product')
        if product:
            qs = qs.filter(product=product)

        return qs

    # ── Extra action: daily summary ───────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Returns total revenue and order count.
        Optionally scoped to ?date=YYYY-MM-DD.
        """
        qs = self.get_queryset()
        result = qs.aggregate(
            total_revenue=Sum('total'),
        )
        return Response({
            'total_orders':  qs.count(),
            'total_revenue': result['total_revenue'] or 0,
        })
