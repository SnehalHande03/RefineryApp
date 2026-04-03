from django.contrib import admin
from .models import MaintenanceAlert

@admin.register(MaintenanceAlert)
class MaintenanceAlertAdmin(admin.ModelAdmin):
    list_display = ['machine', 'alert_type', 'severity', 'status', 'triggered_at']
    list_filter = ['severity', 'status', 'alert_type']
    search_fields = ['machine__machine_id', 'title']
    readonly_fields = ['triggered_at', 'acknowledged_at', 'resolved_at']
