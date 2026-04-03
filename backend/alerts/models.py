from django.db import models
from machines.models import SensorReading, Machine


class MaintenanceAlert(models.Model):
    """Auto-generated alerts when machine failure is predicted or sensor value is abnormal"""
    
    SEVERITY_CHOICES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('RESOLVED', 'Resolved'),
    ]

    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='alerts')
    sensor_reading = models.ForeignKey(SensorReading, on_delete=models.CASCADE, null=True, blank=True)
    
    alert_type = models.CharField(max_length=50)  # 'FAILURE_PREDICTED', 'HIGH_TEMPERATURE', etc.
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='WARNING')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    triggered_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    recommended_action = models.TextField(blank=True)

    class Meta:
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['machine', '-triggered_at']),
            models.Index(fields=['status', '-triggered_at']),
        ]

    def __str__(self):
        return f"{self.machine.machine_id} - {self.alert_type} ({self.severity})"
