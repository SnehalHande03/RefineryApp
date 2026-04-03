from django.contrib import admin
from .models import MaintenanceReport

@admin.register(MaintenanceReport)
class MaintenanceReportAdmin(admin.ModelAdmin):
    list_display = ['machine', 'start_date', 'end_date', 'failure_rate', 'maintenance_priority']
    list_filter = ['maintenance_priority', 'start_date']
    search_fields = ['machine__machine_id']
    readonly_fields = ['created_at']
