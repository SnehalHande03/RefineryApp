from django.utils import timezone
from datetime import timedelta
from django.db.models import Avg, Count, Q
from machines.models import SensorReading
from alerts.models import MaintenanceAlert
from .models import MaintenanceReport


def generate_maintenance_report(machine, days_back=7):
    """
    Generate a comprehensive maintenance report for a machine.
    
    Args:
        machine: Machine instance
        days_back: Number of days to look back (default 7)
    
    Returns:
        MaintenanceReport instance with aggregated statistics and recommendations
    """
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days_back)

    # Get sensor readings for date range
    readings = SensorReading.objects.filter(
        machine=machine,
        timestamp__date__gte=start_date,
        timestamp__date__lte=end_date
    )

    # Get alerts for date range
    alerts = MaintenanceAlert.objects.filter(
        machine=machine,
        triggered_at__date__gte=start_date,
        triggered_at__date__lte=end_date
    )

    # Calculate statistics
    total_readings = readings.count()
    failure_readings = readings.filter(failure_predicted=True).count()
    failure_rate = (failure_readings / total_readings * 100) if total_readings > 0 else 0

    # Aggregate sensor data properly
    aggregation = readings.aggregate(
        avg_temperature=Avg('temperature'),
        avg_pressure=Avg('pressure'),
        avg_vibration=Avg('vibration'),
        avg_flow_rate=Avg('flow_rate'),
        avg_humidity=Avg('humidity')
    )

    avg_temperature = aggregation['avg_temperature'] or 0.0
    avg_pressure = aggregation['avg_pressure'] or 0.0
    avg_vibration = aggregation['avg_vibration'] or 0.0
    avg_flow_rate = aggregation['avg_flow_rate'] or 0.0
    avg_humidity = aggregation['avg_humidity'] or 0.0

    critical_alerts = alerts.filter(severity='CRITICAL').count()
    warning_alerts = alerts.filter(severity='WARNING').count()

    # Generate recommendations
    recommendations = _generate_report_recommendations(
        machine, readings, failure_rate, critical_alerts, warning_alerts
    )

    # Determine maintenance priority
    if critical_alerts > 0 or failure_rate > 30:
        priority = 'CRITICAL'
    elif failure_rate > 15 or warning_alerts > 5:
        priority = 'HIGH'
    elif failure_rate > 5 or warning_alerts > 2:
        priority = 'MEDIUM'
    else:
        priority = 'LOW'

    # Create or update report
    report, created = MaintenanceReport.objects.get_or_create(
        machine=machine,
        start_date=start_date,
        end_date=end_date,
        defaults={
            'total_readings': total_readings,
            'failure_predictions': failure_readings,
            'failure_rate': round(failure_rate, 2),
            'avg_temperature': round(avg_temperature, 2),
            'avg_pressure': round(avg_pressure, 2),
            'avg_vibration': round(avg_vibration, 4),
            'avg_flow_rate': round(avg_flow_rate, 2),
            'avg_humidity': round(avg_humidity, 2),
            'alerts_triggered': alerts.count(),
            'critical_alerts': critical_alerts,
            'recommendations': recommendations,
            'maintenance_priority': priority,
        }
    )

    # If a report already exists for this range, refresh values with latest data.
    if not created:
        report.total_readings = total_readings
        report.failure_predictions = failure_readings
        report.failure_rate = round(failure_rate, 2)
        report.avg_temperature = round(avg_temperature, 2)
        report.avg_pressure = round(avg_pressure, 2)
        report.avg_vibration = round(avg_vibration, 4)
        report.avg_flow_rate = round(avg_flow_rate, 2)
        report.avg_humidity = round(avg_humidity, 2)
        report.alerts_triggered = alerts.count()
        report.critical_alerts = critical_alerts
        report.recommendations = recommendations
        report.maintenance_priority = priority
        report.save()

    return report


def _generate_report_recommendations(machine, readings, failure_rate, critical_alerts, warning_alerts):
    """Generate intelligent maintenance recommendations based on data"""
    recommendations = []

    # Failure rate recommendations
    if failure_rate > 30:
        recommendations.append(
            f"🚨 URGENT: {failure_rate:.1f}% of readings predict failure. "
            f"Schedule immediate full inspection and maintenance."
        )
    elif failure_rate > 15:
        recommendations.append(
            f"⚠️ HIGH RISK: {failure_rate:.1f}% failure prediction rate. "
            f"Plan maintenance within 24-48 hours."
        )
    elif failure_rate > 5:
        recommendations.append(
            f"Monitor closely: {failure_rate:.1f}% failure prediction rate. "
            f"Schedule preventive maintenance within the week."
        )

    # Critical alerts
    if critical_alerts > 0:
        recommendations.append(
            f"✋ {critical_alerts} critical alert(s) triggered. "
            f"Address these issues immediately before operating the machine."
        )

    # Temperature recommendations
    avg_temp = readings.aggregate(
        avg=__import__('django.db.models', fromlist=['Avg']).Avg('temperature')
    )['avg'] or 0
    if avg_temp > 100:
        recommendations.append(
            f"Temperature concern: Average {avg_temp:.1f}°C (high). "
            f"Check cooling system, fins, and ventilation."
        )

    # Vibration recommendations (ISO 20816 levels)
    avg_vibration = readings.aggregate(
        avg=__import__('django.db.models', fromlist=['Avg']).Avg('vibration')
    )['avg'] or 0
    if avg_vibration > 7.1:
        recommendations.append(
            f"Vibration alert: Average {avg_vibration:.2f} mm/s exceeds ISO 20816 zone C. "
            f"Inspect bearings, lubrication, and alignment."
        )

    # Pressure recommendations
    avg_pressure = readings.aggregate(
        avg=__import__('django.db.models', fromlist=['Avg']).Avg('pressure')
    )['avg'] or 0
    if avg_pressure > 80:
        recommendations.append(
            f"Pressure concern: Average {avg_pressure:.1f} bar (elevated). "
            f"Check for blockages and ensure proper valve operation."
        )

    # Default recommendation
    if not recommendations:
        recommendations.append(
            "✓ Machine operating under normal parameters. "
            f"Continue routine monitoring. Last maintenance action may have been effective."
        )

    return "\n".join(recommendations)
