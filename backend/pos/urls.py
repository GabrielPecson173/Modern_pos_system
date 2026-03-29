from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_auth import LoginView, LogoutView

app_name = 'pos'

router = DefaultRouter()
router.register(r'water-orders',  views.WaterOrderViewSet)
router.register(r'laundry-orders', views.LaundryOrderViewSet)
router.register(r'audit-logs',    views.AuditLogViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/',  LoginView.as_view()),
    path('api/auth/logout/', LogoutView.as_view()),
    path('api/', include(router.urls)),
]
