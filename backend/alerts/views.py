from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MaintenanceAlert
from .serializers import MaintenanceAlertSerializer


class MaintenanceAlertViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing maintenance alerts.
    
    GET /api/alerts/ - List all alerts (can filter by status, machine_id)
    POST /api/alerts/{id}/acknowledge/ - Mark alert as acknowledged
    POST /api/alerts/{id}/resolve/ - Mark alert as resolved
    """
    queryset = MaintenanceAlert.objects.all()
    serializer_class = MaintenanceAlertSerializer

    def get_queryset(self):
        """Filter alerts by status, machine_id if provided"""
        queryset = MaintenanceAlert.objects.select_related('machine').all()

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        machine_id = self.request.query_params.get('machine_id', None)
        if machine_id:
            queryset = queryset.filter(machine__machine_id=machine_id)

        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)

        return queryset

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """POST /api/alerts/{id}/acknowledge/"""
        alert = self.get_object()
        alert.status = 'ACKNOWLEDGED'
        alert.acknowledged_at = __import__('django.utils.timezone', fromlist=['now']).now()
        alert.save()
        return Response({'status': 'alert acknowledged'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """POST /api/alerts/{id}/resolve/"""
        alert = self.get_object()
        alert.status = 'RESOLVED'
        alert.resolved_at = __import__('django.utils.timezone', fromlist=['now']).now()
        alert.save()
        return Response({'status': 'alert resolved'}, status=status.HTTP_200_OK)
