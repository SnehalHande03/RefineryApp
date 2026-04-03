from django.conf import settings
from .models import MaintenanceAlert


def check_and_create_alerts(sensor_reading):
    """
    Auto-create alerts based on sensor reading and prediction.
    Called after prediction is made.
    
    Returns list of created alert data.
    """
    alerts = []
    thresholds = settings.ALERT_THRESHOLDS

    # Alert 1: Failure predicted
    if sensor_reading.failure_predicted:
        alert = MaintenanceAlert.objects.create(
            machine=sensor_reading.machine,
            sensor_reading=sensor_reading,
            alert_type='FAILURE_PREDICTED',
            severity='CRITICAL',
            status='OPEN',
            title='Machine Failure Predicted',
            description=f'ML model predicts failure risk with confidence {sensor_reading.failure_confidence:.1%}',
            recommended_action='Schedule immediate maintenance inspection. Check bearings, seals, and alignment.'
        )
        alerts.append({
            'id': alert.id,
            'type': alert.alert_type,
            'severity': alert.severity,
            'message': alert.title
        })

    # Alert 2: High temperature
    if sensor_reading.temperature >= thresholds.get('temperature_critical', 100):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='CRITICAL_TEMPERATURE',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'CRITICAL',
                'title': 'Critical Temperature Detected',
                'description': f'Temperature {sensor_reading.temperature}°C exceeds critical threshold {thresholds.get("temperature_critical")}°C',
                'recommended_action': 'Reduce load or shut down machine. Check cooling system and verify temperature sensor.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    elif sensor_reading.temperature >= thresholds.get('temperature_warning', 80):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='WARNING_TEMPERATURE',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'WARNING',
                'title': 'High Temperature Warning',
                'description': f'Temperature {sensor_reading.temperature}°C exceeds warning threshold {thresholds.get("temperature_warning")}°C',
                'recommended_action': 'Monitor temperature closely. Ensure cooling is functioning properly.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    # Alert 3: High pressure
    if sensor_reading.pressure >= thresholds.get('pressure_critical', 90):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='CRITICAL_PRESSURE',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'CRITICAL',
                'title': 'Critical Pressure Detected',
                'description': f'Pressure {sensor_reading.pressure} bar exceeds critical threshold {thresholds.get("pressure_critical")} bar',
                'recommended_action': 'Reduce flow rate or shut down immediately. Check pressure relief systems.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    elif sensor_reading.pressure >= thresholds.get('pressure_warning', 70):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='WARNING_PRESSURE',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'WARNING',
                'title': 'High Pressure Warning',
                'description': f'Pressure {sensor_reading.pressure} bar exceeds warning threshold {thresholds.get("pressure_warning")} bar',
                'recommended_action': 'Check for blockages. Inspect pressure regulators and relief valves.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    # Alert 4: High vibration
    if sensor_reading.vibration >= thresholds.get('vibration_critical', 11.0):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='CRITICAL_VIBRATION',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'CRITICAL',
                'title': 'Critical Vibration Detected - EMERGENCY',
                'description': f'Vibration {sensor_reading.vibration} mm/s exceeds critical threshold {thresholds.get("vibration_critical")} mm/s (ISO 20816)',
                'recommended_action': 'STOP MACHINE IMMEDIATELY. Severe bearing or alignment issues. Do not restart without inspection.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    elif sensor_reading.vibration >= thresholds.get('vibration_warning', 7.1):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='WARNING_VIBRATION',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'WARNING',
                'title': 'High Vibration Warning',
                'description': f'Vibration {sensor_reading.vibration} mm/s exceeds warning threshold {thresholds.get("vibration_warning")} mm/s (ISO 20816)',
                'recommended_action': 'Schedule immediate bearing inspection. Check lubrication and alignment.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    # Alert 5: High humidity
    if sensor_reading.humidity >= thresholds.get('humidity_warning', 80):
        alert, created = MaintenanceAlert.objects.get_or_create(
            machine=sensor_reading.machine,
            alert_type='WARNING_HUMIDITY',
            status='OPEN',
            defaults={
                'sensor_reading': sensor_reading,
                'severity': 'WARNING',
                'title': 'High Humidity Detected',
                'description': f'Humidity {sensor_reading.humidity}% exceeds warning threshold {thresholds.get("humidity_warning")}%',
                'recommended_action': 'Check for water ingress. Improve ventilation. Verify sensor accuracy.'
            }
        )
        if created:
            alerts.append({
                'id': alert.id,
                'type': alert.alert_type,
                'severity': alert.severity,
                'message': alert.title
            })

    return alerts
