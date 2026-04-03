from rest_framework import serializers
from .models import MaintenanceReport


class MaintenanceReportSerializer(serializers.ModelSerializer):
    machine_id = serializers.CharField(source='machine.machine_id', read_only=True)
    machine_name = serializers.CharField(source='machine.name', read_only=True)

    class Meta:
        model = MaintenanceReport
        fields = [
            'id', 'machine_id', 'machine_name', 'report_date', 'start_date', 'end_date',
            'total_readings', 'failure_predictions', 'failure_rate',
            'avg_temperature', 'avg_pressure', 'avg_vibration', 'avg_flow_rate', 'avg_humidity',
            'alerts_triggered', 'critical_alerts',
            'recommendations', 'maintenance_priority', 'created_at'
        ]
        read_only_fields = ['created_at', 'report_date']
