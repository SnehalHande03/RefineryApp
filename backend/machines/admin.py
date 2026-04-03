from django.contrib import admin
from .models import Machine, SensorReading

@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ['machine_id', 'name', 'machine_type', 'is_active', 'created_at']
    list_filter = ['machine_type', 'is_active']
    search_fields = ['machine_id', 'name']


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ['machine', 'timestamp', 'temperature', 'pressure', 'failure_predicted', 'failure_confidence']
    list_filter = ['failure_predicted', 'machine', 'timestamp']
    search_fields = ['machine__machine_id']
    readonly_fields = ['timestamp', 'failure_predicted', 'failure_confidence']
