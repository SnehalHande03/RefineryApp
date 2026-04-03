from rest_framework import serializers
from django.conf import settings
from .models import Machine, SensorReading
from .validators import validate_sensor_values


class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = ['id', 'machine_id', 'name', 'machine_type', 'location', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SensorReadingInputSerializer(serializers.Serializer):
    """Validates incoming sensor data from React frontend"""
    machine_id = serializers.CharField(max_length=50, required=True)
    temperature = serializers.FloatField(required=True)
    pressure = serializers.FloatField(required=True)
    vibration = serializers.FloatField(required=True)
    flow_rate = serializers.FloatField(required=True)
    humidity = serializers.FloatField(required=True)

    def validate(self, data):
        """Run comprehensive sensor validation"""
        errors = validate_sensor_values(data)
        if errors:
            raise serializers.ValidationError(errors)
        return data


class SensorReadingSerializer(serializers.ModelSerializer):
    machine_id = serializers.CharField(source='machine.machine_id', read_only=True)
    machine_name = serializers.CharField(source='machine.name', read_only=True)

    class Meta:
        model = SensorReading
        fields = [
            'id', 'machine_id', 'machine_name', 'timestamp',
            'temperature', 'pressure', 'vibration', 'flow_rate', 'humidity',
            'failure_predicted', 'failure_confidence', 'created_at'
        ]
        read_only_fields = ['failure_predicted', 'failure_confidence', 'timestamp', 'created_at']


class PredictionExplanationSerializer(serializers.Serializer):
    """Format for ML prediction explanation"""
    sensor_reading_id = serializers.IntegerField()
    machine_id = serializers.CharField()
    failure_predicted = serializers.BooleanField()
    failure_confidence = serializers.FloatField()
    
    # Top contributing sensors
    top_sensors = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),
        )
    )
    explanation_text = serializers.CharField()
    recommendations = serializers.ListField(child=serializers.CharField())
