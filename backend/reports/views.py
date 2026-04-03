from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from machines.models import Machine, SensorReading
from alerts.models import MaintenanceAlert
from .models import MaintenanceReport
from .serializers import MaintenanceReportSerializer
from .services import generate_maintenance_report


class MaintenanceReportViewSet(viewsets.ModelViewSet):
    """
    API endpoints for maintenance reports.
    
    GET /api/reports/ - List all reports
    POST /api/reports/generate/ - Generate report for machine and date range
    GET /api/reports/{id}/ - Get report details
    """
    queryset = MaintenanceReport.objects.all()
    serializer_class = MaintenanceReportSerializer

    def get_queryset(self):
        """Filter reports by machine_id if provided"""
        queryset = MaintenanceReport.objects.select_related('machine').all()
        machine_id = self.request.query_params.get('machine_id', None)
        if machine_id:
            queryset = queryset.filter(machine__machine_id=machine_id)
        return queryset

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        POST /api/reports/generate/
        
        Request body:
        {
            'machine_id': 'PUMP_1',
            'days_back': 7  (optional, default=7)
        }
        
        Generates and returns a maintenance report for the specified machine.
        """
        machine_id = request.data.get('machine_id')
        days_back = int(request.data.get('days_back', 7))

        if not machine_id:
            return Response(
                {'error': 'machine_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            machine = Machine.objects.get(machine_id=machine_id)
        except Machine.DoesNotExist:
            return Response(
                {'error': f'Machine {machine_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate report
        try:
            report = generate_maintenance_report(machine, days_back)
            serializer = MaintenanceReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """GET /api/reports/latest/?machine_id=PUMP_1"""
        machine_id = request.query_params.get('machine_id')
        if not machine_id:
            return Response(
                {'error': 'machine_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            report = MaintenanceReport.objects.filter(
                machine__machine_id=machine_id
            ).latest('report_date')
            serializer = MaintenanceReportSerializer(report)
            return Response(serializer.data)
        except MaintenanceReport.DoesNotExist:
            return Response(
                {'error': 'No reports found'},
                status=status.HTTP_404_NOT_FOUND
            )
