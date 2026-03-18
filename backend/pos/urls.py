from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'pos'

router = DefaultRouter()
router.register(r'water-orders', views.WaterOrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
