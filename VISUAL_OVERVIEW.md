# 🎯 Project Structure at a Glance

## The System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND (Port 3000)                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Monitor    │  │    Alerts    │  │    Report    │           │
│  │   (Submit    │  │  (View list, │  │  (Generate   │           │
│  │   sensors &  │  │  acknowledge, │  │  7-day       │           │
│  │   see result)│  │  resolve)    │  │  summary)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│       ↓                  ↓                    ↓                   │
│   api.submitSensor   api.getAlerts      api.generateReport       │
│   api.getPredictionExp  api.acknowledge   etc...                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/CORS
        ┌───────────────────┴────────────────┐
        │                                    │
┌───────▼──────────────────────────────────────────────────────────┐
│           DJANGO REST API (Port 8000)                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Machines App                      Validation Serializers   │   │
│  │  - GET /machines/                                          │   │
│  │  - POST /machines/                                         │   │
│  │                                 ↓ Error checking           │   │
│  │ Sensor Readings App                                        │   │
│  │  - GET /sensor-readings/                                   │   │
│  │  - POST /sensor-readings/ ────────────────┐               │   │
│  │    └─ Auto-validate sensor ranges         │               │   │
│  │    └─ Call ML Predictor                   │               │   │
│  │    └─ Create alerts                       v               │   │
│  │    └─ Return prediction + alerts        Input Valid? ────▶│   │
│  │                                                            │   │
│  │ Predictions Endpoint                                       │   │
│  │  - GET /predictions/{id}/explain/                         │   │
│  │    Returns: top sensors, explanation, recommendations    │   │
│  │                                                            │   │
│  │ Alerts App                                                │   │
│  │  - GET /alerts/                                           │   │
│  │  - POST /alerts/{id}/acknowledge/                         │   │
│  │  - POST /alerts/{id}/resolve/                             │   │
│  │                                                            │   │
│  │ Reports App                                               │   │
│  │  - POST /reports/generate/                                │   │
│  │  - GET /reports/latest/                                   │   │
│  └───────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                    ML Integration Layer                           │
│                           │                                       │
│      ┌────────────────────┴──────────────────┐                   │
│      │                                       │                   │
│      ▼                                       ▼                   │
│  ┌──────────────┐                    ┌──────────────────┐       │
│  │ Predictor    │                    │ Feature          │       │
│  │              │                    │ Importance       │       │
│  │ Load model   │────────────────    │ Explanation      │       │
│  │ Predict      │ Feature Import.    │                  │       │
│  │ Confidence   │                    │ Top 3 sensors    │       │
│  └──────────────┘                    │ + Recommend.     │       │
│                                       └──────────────────┘       │
└────────┬─────────────────────────────────────────────────────────┘
         │ SQL
         ▼
    ┌──────────────────┐
    │  SQLite DB       │
    │                  │
    │  - Machines      │
    │  - Readings      │
    │  - Alerts        │
    │  - Reports       │
    └──────────────────┘
```

---

## Data Flow: Sensor Submission

```
User Input (React)
    │
    ├─ Machine ID: "PUMP_1"
    ├─ Temperature: 95
    ├─ Pressure: 240
    ├─ Vibration: 0.60
    ├─ Flow Rate: 110
    └─ Humidity: 50
    │
    ▼
POST /api/sensor-readings/
    │
    ▼
Django SensorReadingViewSet.create()
    │
    ├─ Validate input (SensorReadingInputSerializer)
    │   └─ Check ranges: 10-150°C, 0-100 bar, 0-50 mm/s, etc.
    │   └─ ✓ All valid
    │
    ├─ Get or create Machine (auto-create if new)
    │
    ├─ Create SensorReading object
    │   └─ timestamp auto-set by backend
    │
    ├─ Call MLPredictor.predict()
    │   ├─ Load random forest model
    │   ├─ Extract features → [95, 240, 0.60, 110, 50]
    │   ├─ model.predict_proba() → [0.15, 0.85]
    │   └─ Return: failure=True, confidence=0.85
    │
    ├─ Update SensorReading
    │   ├─ failure_predicted = True
    │   └─ failure_confidence = 0.85
    │
    ├─ check_and_create_alerts(sensor_reading)
    │   ├─ Temperature 95 > warning 80 → create WARNING alert
    │   ├─ Prediction failure → create CRITICAL alert
    │   └─ Return list of created alerts
    │
    └─ Return JSON Response
        ├─ sensor_reading data
        ├─ failure_predicted: true
        ├─ failure_confidence: 0.85
        ├─ alerts: [{id: 5, type: "FAILURE_PREDICTED", ...}]
        └─ recommendations: ["🚨 Schedule maintenance", ...]
            │
            ▼
        React displays results
        ├─ Big RED box: "⚠️ FAILURE RISK DETECTED"
        ├─ Confidence bar: 85%
        ├─ Button: "Why?" (click to see explanation)
        └─ Triggered alerts list
```

---

## Model Training Flow

```
python train_model.py
    │
    ├─ Load training_data.csv (288 rows)
    │
    ├─ Extract features & target
    │   ├─ Features: [temperature, pressure, vibration, flow_rate, humidity]
    │   └─ Target: [0, 0, 0, 1, ...] (0=normal, 1=failure)
    │
    ├─ Train/Test split (80/20)
    │
    ├─ Train RandomForestClassifier
    │   ├─ n_estimators=100 (100 decision trees)
    │   ├─ max_depth=15 (prevent overfitting)
    │   └─ class_weight='balanced' (handle imbalance)
    │
    ├─ Evaluate on test set
    │   ├─ Accuracy: 0.9444
    │   ├─ Precision: 0.9167
    │   ├─ Recall: 1.0000
    │   └─ F1-Score: 0.9569
    │
    ├─ Get feature importance
    │   ├─ temperature: 0.35 (35%)
    │   ├─ vibration: 0.28 (28%)
    │   ├─ pressure: 0.22 (22%)
    │   ├─ flow_rate: 0.10 (10%)
    │   └─ humidity: 0.05 (5%)
    │
    └─ Save to disk
        ├─ backend/ml_models/trained_models/refinery_model.joblib
        └─ backend/ml_models/trained_models/model_metadata.joblib
```

---

## Database Schema

```
Machine
├─ machine_id: "PUMP_1" (unique)
├─ name: "Main Feed Pump"
├─ machine_type: "PUMP" (enum: PUMP, COMPRESSOR, VALVE, PIPELINE, TURBINE)
├─ location: "Section A"
├─ is_active: true
└─ created_at, updated_at

    ↓ 1 to Many

SensorReading
├─ machine_id (FK)
├─ timestamp: "2026-01-10 14:23:45" (auto-set)
├─ temperature: 95 (float)
├─ pressure: 240 (float)
├─ vibration: 0.60 (float)
├─ flow_rate: 110 (float)
├─ humidity: 50 (float)
├─ failure_predicted: True (bool)
├─ failure_confidence: 0.85 (float 0-1)
└─ created_at

    ↓ 1 to Many

MaintenanceAlert
├─ machine_id (FK)
├─ sensor_reading_id (FK, nullable)
├─ alert_type: "FAILURE_PREDICTED" (string)
├─ severity: "CRITICAL" (CRITICAL, WARNING, INFO)
├─ status: "OPEN" (OPEN, ACKNOWLEDGED, RESOLVED)
├─ title: "Machine Failure Predicted"
├─ description: long text
├─ triggered_at: timestamp
├─ acknowledged_at: timestamp (nullable)
├─ resolved_at: timestamp (nullable)
└─ recommended_action: text

MaintenanceReport
├─ machine_id (FK)
├─ start_date: "2026-01-03" (date)
├─ end_date: "2026-01-10" (date)
├─ total_readings: 168 (int)
├─ failure_predictions: 42 (int)
├─ failure_rate: 25.0 (float %)
├─ avg_temperature: 87.5 (float)
├─ avg_pressure: 215.3 (float)
├─ avg_vibration: 0.45 (float)
├─ avg_flow_rate: 118.2 (float)
├─ avg_humidity: 47.5 (float)
├─ alerts_triggered: 18 (int)
├─ critical_alerts: 6 (int)
├─ recommendations: text (multi-line)
├─ maintenance_priority: "HIGH" (LOW, MEDIUM, HIGH, CRITICAL)
└─ created_at: timestamp
```

---

## API Endpoints (Summary)

```
MACHINES
├─ GET    /api/machines/              → List all
├─ POST   /api/machines/              → Create
├─ GET    /api/machines/{id}/         → Details
└─ PUT    /api/machines/{id}/         → Update

SENSOR READINGS
├─ POST   /api/sensor-readings/       → Submit + predict
├─ GET    /api/sensor-readings/       → List (paginated)
├─ GET    /api/sensor-readings/{id}/  → Details
└─ DELETE /api/sensor-readings/{id}/  → Delete

PREDICTIONS
└─ GET    /api/predictions/{id}/explain/    → Why was it predicted?
           Returns: top_sensors, explanation_text, recommendations

ALERTS
├─ GET    /api/alerts/                      → List (filter by status)
├─ POST   /api/alerts/{id}/acknowledge/     → Mark as seen
├─ POST   /api/alerts/{id}/resolve/         → Mark as fixed
└─ DELETE /api/alerts/{id}/                 → Delete

REPORTS
├─ POST   /api/reports/generate/            → Create 7-day report
├─ GET    /api/reports/                     → List all
├─ GET    /api/reports/{id}/                → Details
└─ GET    /api/reports/latest/?machine_id=  → Latest for machine

ADMIN
└─ GET    /admin/                           → Django admin interface
```

---

## Alert Types & Triggers

```
Alert Type                  Severity    Trigger Condition
─────────────────────────────────────────────────────────────
FAILURE_PREDICTED          CRITICAL    ML model predicts failure
                                       (confidence > 0.5)

CRITICAL_TEMPERATURE       CRITICAL    temperature >= 100°C

WARNING_TEMPERATURE        WARNING     80°C <= temperature < 100°C

CRITICAL_PRESSURE          CRITICAL    pressure >= 90 bar

WARNING_PRESSURE           WARNING     70 bar <= pressure < 90 bar

CRITICAL_VIBRATION         CRITICAL    vibration >= 11.0 mm/s
                                       (ISO 20816 danger zone)

WARNING_VIBRATION          WARNING     7.1 mm/s <= vibration < 11.0

WARNING_HUMIDITY           WARNING     humidity >= 80%
```

---

## Configuration (settings.py)

```python
# Sensor valid ranges
SENSOR_RANGES = {
    'temperature': {'min': 10, 'max': 150},      # °C
    'pressure': {'min': 0, 'max': 100},          # bar
    'vibration': {'min': 0, 'max': 50},          # mm/s
    'flow_rate': {'min': 0, 'max': 5000},        # L/min
    'humidity': {'min': 0, 'max': 100},          # %
}

# Alert thresholds
ALERT_THRESHOLDS = {
    'temperature_warning': 80,      # °C
    'temperature_critical': 100,    # °C
    'pressure_warning': 70,         # bar
    'pressure_critical': 90,        # bar
    'vibration_warning': 7.1,       # mm/s
    'vibration_critical': 11.0,     # mm/s
    'humidity_warning': 80,         # %
}

# Modify these to match your equipment!
```

---

## Setup Checklist

- [ ] Create virtual environment
- [ ] Install Python packages (pip install -r requirements.txt)
- [ ] Run train_model.py ← DO THIS FIRST!
- [ ] Run migrations (python manage.py migrate)
- [ ] Start Django (python manage.py runserver)
- [ ] Install node packages (npm install)
- [ ] Start React (npm start)
- [ ] Submit sample sensor data
- [ ] See prediction result
- [ ] Check alerts panel
- [ ] Generate maintenance report

---

## File Count Summary

```
Backend (Django)
  ├─ Models:       4 files × 1 model ea = 4
  ├─ Views:        5 files × 1 viewset ea ≈ 5
  ├─ Serializers:  1 file × 4 serializers = 4
  ├─ Services:     1 file × 1 service = 1
  ├─ Validators:   1 file × 1 function = 1
  └─ Settings:     1 file + manage.py + wsgi = 3
  Total: ~18 Python files

Frontend (React)
  ├─ Components:   4 .jsx files = 4
  ├─ Styles:       4 .css files = 4
  ├─ Services:     1 api.js = 1
  └─ Config:       package.json + index files = 2
  Total: ~11 files

Docs
  ├─ README.md
  ├─ QUICK_START.md
  ├─ ARCHITECTURE.md
  ├─ SUBMISSION_CHECKLIST.md
  └─ PROJECT_SUMMARY.md
  Total: 5 files

Data
  └─ training_data.csv

Grand Total: 35 files, 2,500+ LOC
```

---

## Ready? 🚀

```bash
# Jump to QUICK_START.md and follow the 5-step setup!
```

Good luck! 🎉
