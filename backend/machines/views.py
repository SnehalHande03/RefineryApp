from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Machine, SensorReading
from .serializers import (
    MachineSerializer, 
    SensorReadingSerializer, 
    SensorReadingInputSerializer,
    PredictionExplanationSerializer
)

from ml_models.predictor import MLPredictor


class MachineViewSet(viewsets.ModelViewSet):
    """
    API endpoints for managing machines.
    GET /api/machines/ - List all machines
    POST /api/machines/ - Create new machine
    GET /api/machines/{id}/ - Get machine details
    """
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer

    def get_queryset(self):
        # Filter by machine_id if provided
        queryset = Machine.objects.all()
        machine_id = self.request.query_params.get('machine_id', None)
        if machine_id:
            queryset = queryset.filter(machine_id=machine_id)
        return queryset


class SensorReadingViewSet(viewsets.ModelViewSet):
    """
    API endpoints for sensor readings and predictions.
    
    POST /api/sensor-readings/
        Input: { machine_id, temperature, pressure, vibration, flow_rate, humidity }
        Response: { ...reading data, failure_predicted, failure_confidence, alerts, recommendations }
    
    GET /api/sensor-readings/
        List all sensor readings with pagination
    """
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer

    def create(self, request, *args, **kwargs):
        """
        POST /api/sensor-readings/
        
        Accepts sensor data, validates, predicts failure, creates alert if needed.
        Returns prediction result and any triggered alerts.
        """
        # Validate input
        input_serializer = SensorReadingInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(
                {'errors': input_serializer.errors, 'status': 'validation_failed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_data = input_serializer.validated_data
        machine_id = validated_data.pop('machine_id')

        # Get or create machine
        try:
            machine = Machine.objects.get(machine_id=machine_id)
        except Machine.DoesNotExist:
            # Auto-create machine if doesn't exist
            machine_type = 'PUMP' if 'PUMP' in machine_id else 'COMPRESSOR'
            machine = Machine.objects.create(
                machine_id=machine_id,
                name=machine_id,
                machine_type=machine_type,
                is_active=True
            )

        # Create sensor reading (timestamp auto-set by Django)
        sensor_reading = SensorReading.objects.create(
            machine=machine,
            **validated_data
        )

        # Get ML prediction
        predictor = MLPredictor()
        try:
            prediction = predictor.predict(sensor_reading)
            sensor_reading.failure_predicted = prediction['failure_predicted']
            sensor_reading.failure_confidence = prediction['failure_confidence']
            sensor_reading.save()
        except Exception as e:
            # If model isn't trained yet, fail gracefully
            return Response(
                {'error': f'ML model error: {str(e)}'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Check for alerts (triggers in alerts app)
        from alerts.services import check_and_create_alerts
        alerts = check_and_create_alerts(sensor_reading)

        # Build response
        response_data = SensorReadingSerializer(sensor_reading).data
        response_data['alerts'] = alerts
        response_data['recommendations'] = prediction.get('recommendations', [])

        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        """Filter by machine_id if provided"""
        queryset = SensorReading.objects.select_related('machine').all()
        machine_id = self.request.query_params.get('machine_id', None)
        if machine_id:
            queryset = queryset.filter(machine__machine_id=machine_id)
        return queryset


class PredictionDetailView(APIView):
    """
    GET /api/predictions/{sensor_reading_id}/explain/
    
    Returns detailed explanation of why a prediction was made.
    Includes:
    - Top 3 contributing sensors (by importance)
    - Human-readable explanation
    - Maintenance recommendations
    """

    def get(self, request, sensor_reading_id):
        sensor_reading = get_object_or_404(SensorReading, id=sensor_reading_id)

        from ml_models.predictor import MLPredictor
        predictor = MLPredictor()

        try:
            explanation = predictor.explain_prediction(sensor_reading)
        except Exception as e:
            return Response(
                {'error': f'Could not explain prediction: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        response_data = {
            'sensor_reading_id': sensor_reading.id,
            'machine_id': sensor_reading.machine.machine_id,
            'timestamp': sensor_reading.timestamp,
            'failure_predicted': sensor_reading.failure_predicted,
            'failure_confidence': sensor_reading.failure_confidence,
            'top_sensors': explanation['top_sensors'],
            'explanation_text': explanation['explanation_text'],
            'recommendations': explanation['recommendations'],
            'sensor_values': {
                'temperature': sensor_reading.temperature,
                'pressure': sensor_reading.pressure,
                'vibration': sensor_reading.vibration,
                'flow_rate': sensor_reading.flow_rate,
                'humidity': sensor_reading.humidity,
            }
        }

        return Response(response_data)
