import os
import joblib
import numpy as np
from django.conf import settings


class MLPredictor:
    """
    Loads trained Random Forest model and makes predictions on sensor readings.
    
    Usage:
        predictor = MLPredictor()
        result = predictor.predict(sensor_reading)
        # result = {'failure_predicted': True/False, 'failure_confidence': 0.8, 'recommendations': [...]}
        
        explanation = predictor.explain_prediction(sensor_reading)
        # explanation = {'top_sensors': [...], 'explanation_text': '...', 'recommendations': [...]}
    """

    def __init__(self, model_name='refinery_model.joblib'):
        self.model = None
        self.metadata = None
        self.feature_columns = ['temperature', 'pressure', 'vibration', 'flow_rate', 'humidity']
        self.model_path = os.path.join(settings.ML_MODELS_DIR, model_name)
        self.metadata_path = os.path.join(settings.ML_MODELS_DIR, 'model_metadata.joblib')

        self._load_model()

    def _load_model(self):
        """Load model from disk"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Trained model not found at {self.model_path}. "
                "Please train the model first using MLTrainer."
            )

        self.model = joblib.load(self.model_path)

        if os.path.exists(self.metadata_path):
            self.metadata = joblib.load(self.metadata_path)

    def predict(self, sensor_reading):
        """
        Predict failure for a sensor reading.
        
        Args:
            sensor_reading: django.models instance with temperature, pressure, etc.
        
        Returns:
            dict: {
                'failure_predicted': bool,
                'failure_confidence': float (0-1),
                'recommendations': list of string
            }
        """
        # Extract features from sensor reading
        features = np.array([[
            sensor_reading.temperature,
            sensor_reading.pressure,
            sensor_reading.vibration,
            sensor_reading.flow_rate,
            sensor_reading.humidity,
        ]])

        # Predict
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]

        # Calculate confidence with margin consideration
        # This makes confidence vary based on how far from decision boundary
        predicted_prob = max(probabilities)  # Probability of predicted class (0-1)
        other_prob = min(probabilities)      # Probability of other class
        
        # Margin between classes (0 = uncertain boundary, 1 = very confident)
        margin = predicted_prob - other_prob  # Range: 0 to 1
        
        # Weighted confidence considers both certainty and margin
        # This provides more dynamic confidence values
        confidence = predicted_prob * (0.7) + margin * (0.3)
        
        # Combine with sensor-based confidence for more varied results
        sensor_confidence = self._calculate_sensor_based_confidence(sensor_reading)
        confidence = (confidence * 0.6 + sensor_confidence * 0.4)  # 60% model, 40% sensor-based
        confidence = float(np.clip(confidence, 0, 1))  # Ensure 0-1 range

        # Generate recommendations based on sensor readings and prediction
        recommendations = self._generate_recommendations(sensor_reading, prediction)

        return {
            'failure_predicted': bool(prediction == 1),  # 1 = failure, 0 = normal
            'failure_confidence': confidence,
            'recommendations': recommendations,
        }

    def _calculate_sensor_based_confidence(self, sensor_reading):
        """
        Calculate confidence based on sensor deviation from normal ranges.
        This provides additional confidence metrics based on thresholds.
        """
        from django.conf import settings
        
        thresholds = settings.ALERT_THRESHOLDS
        confidence_factors = []
        
        # Temperature: ideal 70-85°C
        temp = sensor_reading.temperature
        if 70 <= temp <= 85:
            confidence_factors.append(0.95)  # Very confident in normal
        elif 60 <= temp <= 95:
            confidence_factors.append(0.75)  # Fairly confident
        elif 50 <= temp <= 100:
            confidence_factors.append(0.50)  # Moderately confident
        else:
            confidence_factors.append(0.30)  # Low confidence (far from normal)
        
        # Pressure: ideal 180-200 bar
        pres = sensor_reading.pressure
        if 180 <= pres <= 200:
            confidence_factors.append(0.95)
        elif 160 <= pres <= 220:
            confidence_factors.append(0.75)
        elif 140 <= pres <= 240:
            confidence_factors.append(0.50)
        else:
            confidence_factors.append(0.30)
        
        # Vibration: ideal <0.3 mm/s
        vib = sensor_reading.vibration
        if vib < 0.3:
            confidence_factors.append(0.95)
        elif vib < 1.0:
            confidence_factors.append(0.75)
        elif vib < 5.0:
            confidence_factors.append(0.50)
        else:
            confidence_factors.append(0.30)
        
        # Average sensor-based confidence
        return np.mean(confidence_factors)

    def explain_prediction(self, sensor_reading):
        """
        Explain why the model made a particular prediction.
        Shows which sensors contributed most to the decision.
        
        Returns:
            dict: {
                'top_sensors': [
                    {'sensor': 'temperature', 'value': 95, 'importance': 0.35, 'status': 'high'},
                    ...
                ],
                'explanation_text': 'Human-readable explanation',
                'recommendations': [...]
            }
        """
        # Get feature importance from model
        feature_importance = dict(zip(
            self.feature_columns,
            self.model.feature_importances_
        ))

        # Get sensor values for this reading
        sensor_values = {
            'temperature': sensor_reading.temperature,
            'pressure': sensor_reading.pressure,
            'vibration': sensor_reading.vibration,
            'flow_rate': sensor_reading.flow_rate,
            'humidity': sensor_reading.humidity,
        }

        # Sort by importance
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)

        # Build top sensors list
        top_sensors = []
        for sensor_name, importance in sorted_features[:3]:  # Top 3 sensors
            value = sensor_values[sensor_name]
            status = self._get_sensor_status(sensor_name, value)

            top_sensors.append({
                'sensor': sensor_name,
                'value': round(value, 2),
                'importance': round(importance, 4),
                'status': status,
            })

        # Generate explanation text
        prediction = sensor_reading.failure_predicted
        explanation_text = self._generate_explanation_text(sensor_reading, top_sensors, prediction)

        # Recommendations
        recommendations = self._generate_recommendations(sensor_reading, int(prediction))

        return {
            'top_sensors': top_sensors,
            'explanation_text': explanation_text,
            'recommendations': recommendations,
        }

    def _get_sensor_status(self, sensor_name, value):
        """Determine if sensor reading is low, normal, or high"""
        thresholds = settings.ALERT_THRESHOLDS

        if sensor_name == 'temperature':
            if value >= thresholds.get('temperature_critical', 100):
                return 'critical'
            elif value >= thresholds.get('temperature_warning', 80):
                return 'high'
            return 'normal'

        elif sensor_name == 'pressure':
            if value >= thresholds.get('pressure_critical', 90):
                return 'critical'
            elif value >= thresholds.get('pressure_warning', 70):
                return 'high'
            return 'normal'

        elif sensor_name == 'vibration':
            if value >= thresholds.get('vibration_critical', 11.0):
                return 'critical'
            elif value >= thresholds.get('vibration_warning', 7.1):
                return 'high'
            return 'normal'

        elif sensor_name == 'humidity':
            if value >= thresholds.get('humidity_warning', 80):
                return 'high'
            return 'normal'

        return 'normal'

    def _generate_explanation_text(self, sensor_reading, top_sensors, prediction):
        """Generate human-readable explanation"""
        status = "FAILURE RISK DETECTED" if prediction else "MACHINE OPERATING NORMALLY"

        sensor_str = ", ".join([
            f"{s['sensor']} ({s['value']}, importance: {s['importance']})"
            for s in top_sensors
        ])

        return (
            f"{status}: The machine shows signs of potential failure based on sensor analysis. "
            f"Top contributing factors: {sensor_str}"
        )

    def _generate_recommendations(self, sensor_reading, prediction):
        """Generate maintenance recommendations based on sensor values"""
        recommendations = []

        # Temperature-based recommendations
        if sensor_reading.temperature > 100:
            recommendations.append("🌡️ High temperature detected. Check cooling system and heat dissipation.")
        elif sensor_reading.temperature > 80:
            recommendations.append("⚠️ Temperature is elevated. Monitor closely and consider preventive cooldown.")

        # Pressure-based recommendations
        if sensor_reading.pressure > 90:
            recommendations.append("⚙️ Critical pressure. Reduce load and check pressure relief systems immediately.")
        elif sensor_reading.pressure > 70:
            recommendations.append("⚠️ Pressure is high. Inspect seals and pressure regulators.")

        # Vibration-based recommendations
        if sensor_reading.vibration > 11.0:
            recommendations.append("💥 Critical vibration. STOP MACHINE. Inspect bearings and alignment immediately.")
        elif sensor_reading.vibration > 7.1:
            recommendations.append("⚠️ Vibration exceeds normal levels. Check bearing condition and lubrication.")
        elif sensor_reading.vibration > 1.0:
            recommendations.append("Check vibration levels during next scheduled maintenance.")

        # Humidity-based recommendations
        if sensor_reading.humidity > 80:
            recommendations.append("💧 High humidity. Check for water ingress and improve ventilation.")

        # Combined failure prediction recommendation
        if prediction == 1:
            recommendations.insert(0, "🚨 PREDICTED FAILURE: Schedule immediate maintenance inspection.")

        # Default recommendation
        if not recommendations:
            recommendations.append("✓ Machine operating within normal parameters. Continue routine monitoring.")

        return recommendations
