"""
URL configuration for refinery_project project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.views import APIView
from machines.views import MachineViewSet, SensorReadingViewSet, PredictionDetailView
from alerts.views import MaintenanceAlertViewSet
from reports.views import MaintenanceReportViewSet


# Root API Info View
class APIRootView(APIView):
    """API Root - Shows available endpoints"""
    def get(self, request):
        return Response({
            'message': 'Refinery Predictive Maintenance API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'admin_panel': '/admin/',
                'api_root': '/api/',
                'machines': '/api/machines/',
                'sensor_readings': '/api/sensor-readings/',
                'alerts': '/api/alerts/',
                'reports': '/api/reports/',
                'prediction_explain': '/api/predictions/<sensor_id>/explain/',
            },
            'quick_start': 'POST /api/sensor-readings/ with {machine_id, temperature, pressure, vibration, flow_rate, humidity}'
        })


# Create router and register viewsets
router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'sensor-readings', SensorReadingViewSet, basename='sensor-reading')
router.register(r'alerts', MaintenanceAlertViewSet, basename='alert')
router.register(r'reports', MaintenanceReportViewSet, basename='report')


urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),  # Root path
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/predictions/<int:sensor_reading_id>/explain/', PredictionDetailView.as_view(), name='prediction-explain'),
]
