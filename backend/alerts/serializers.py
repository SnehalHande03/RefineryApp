from rest_framework import serializers
from .models import MaintenanceAlert


class MaintenanceAlertSerializer(serializers.ModelSerializer):
    machine_id = serializers.CharField(source='machine.machine_id', read_only=True)
    machine_name = serializers.CharField(source='machine.name', read_only=True)

    class Meta:
        model = MaintenanceAlert
        fields = [
            'id', 'machine_id', 'machine_name', 'alert_type', 'severity', 'status',
            'title', 'description', 'triggered_at', 'acknowledged_at', 'resolved_at',
            'recommended_action'
        ]
        read_only_fields = ['triggered_at', 'acknowledged_at', 'resolved_at']
