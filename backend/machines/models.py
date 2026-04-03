from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Machine(models.Model):
    """Represents a refinery machine (pump, compressor, valve, etc.)"""
    MACHINE_TYPES = [
        ('PUMP', 'Pump'),
        ('COMPRESSOR', 'Compressor'),
        ('VALVE', 'Valve'),
        ('PIPELINE', 'Pipeline'),
        ('TURBINE', 'Turbine'),
    ]

    machine_id = models.CharField(max_length=50, unique=True, help_text="Unique machine identifier (e.g., PUMP_1)")
    name = models.CharField(max_length=100)
    machine_type = models.CharField(max_length=20, choices=MACHINE_TYPES)
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['machine_id']

    def __str__(self):
        return f"{self.machine_id} ({self.name})"


class SensorReading(models.Model):
    """Records sensor readings from a machine"""
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='sensor_readings')
    timestamp = models.DateTimeField(auto_now_add=True, help_text="Auto-set by backend")
    
    # Sensor values
    temperature = models.FloatField(validators=[MinValueValidator(10), MaxValueValidator(150)])  # °C
    pressure = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])      # bar
    vibration = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(50)])      # mm/s
    flow_rate = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5000)])    # L/min
    humidity = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])      # %
    
    # Prediction result
    failure_predicted = models.BooleanField(default=False)  # 0=normal, 1=failure risk
    failure_confidence = models.FloatField(default=0.0, help_text="Confidence (0-1)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['machine', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.machine.machine_id} - {self.timestamp}"
