from django.db import models
from machines.models import Machine
from django.utils import timezone
from datetime import timedelta
import json


class MaintenanceReport(models.Model):
    """Aggregated maintenance report for a machine over a date range"""
    
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='reports')
    
    report_date = models.DateField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Statistics
    total_readings = models.IntegerField(default=0)
    failure_predictions = models.IntegerField(default=0)
    failure_rate = models.FloatField(default=0.0, help_text="Percentage of readings predicting failure")
    
    avg_temperature = models.FloatField(default=0.0)
    avg_pressure = models.FloatField(default=0.0)
    avg_vibration = models.FloatField(default=0.0)
    avg_flow_rate = models.FloatField(default=0.0)
    avg_humidity = models.FloatField(default=0.0)
    
    alerts_triggered = models.IntegerField(default=0)
    critical_alerts = models.IntegerField(default=0)
    
    # Recommendations - stored as JSON list
    recommendations = models.JSONField(default=list, blank=True)
    maintenance_priority = models.CharField(
        max_length=20,
        choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('CRITICAL', 'Critical')],
        default='LOW'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-report_date']
        indexes = [
            models.Index(fields=['machine', '-report_date']),
        ]

    def __str__(self):
        return f"{self.machine.machine_id} Report ({self.start_date} to {self.end_date})"
