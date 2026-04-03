#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'refinery_project.settings')
django.setup()

from machines.models import Machine

# Clear existing machines
Machine.objects.all().delete()

# Create proper machines
machines_data = [
    {'machine_id': 'PUMP_1', 'name': 'Pump A'},
    {'machine_id': 'PUMP_2', 'name': 'Pump B'},
    {'machine_id': 'COMP_1', 'name': 'Compressor A'},
    {'machine_id': 'COMP_2', 'name': 'Compressor B'},
    {'machine_id': 'VALVE_1', 'name': 'Valve A'},
    {'machine_id': 'VALVE_2', 'name': 'Valve B'},
]

for data in machines_data:
    machine = Machine.objects.create(**data)
    print(f"Created: {machine.machine_id} - {machine.name}")

print(f"\nTotal machines: {Machine.objects.count()}")
