# Refinery Predictive Maintenance System

## Overview

A complete machine learning monitoring system for refinery equipment (pumps, compressors, valves). Uses **Random Forest** to predict machine failures before they happen, with automatic alerting and maintenance recommendations.

**Tech Stack:**
- **Backend:** Django + Django REST Framework
- **Frontend:** React
- **ML Model:** Random Forest Classifier (Random Forest chosen over Linear Regression & Decision Trees for superior non-linear pattern recognition)
- **Database:** SQLite (development), PostgreSQL (production-ready)

---

## Quick Start

### Backend Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **Train the ML model** (required before running server):
   ```bash
   python train_model.py
   ```
   Expected output:
   ```
   Model Metrics:
     Accuracy:  0.9444
     Precision: 0.9167
     Recall:    1.0000
     F1-Score:  0.9569
   ```

4. Initialize Django database:
   ```bash
   cd backend
   python manage.py migrate
   cd ..
   ```

5. Create superuser (for admin panel):
   ```bash
   cd backend
   python manage.py createsuperuser
   cd ..
   ```

6. Start Django server:
   ```bash
   cd backend
   python manage.py runserver
   ```
   Server runs at `http://localhost:8000`

### Frontend Setup

1. Create React app:
   ```bash
   cd frontend
   npx create-react-app . --template minimal
   ```

2. Copy provided React components (see `frontend_components/` directory)

3. Install dependencies:
   ```bash
   npm install
   npm install axios recharts
   ```

4. Start React development server:
   ```bash
   npm start
   ```
   Frontend runs at `http://localhost:3000`

---

## Architecture

### Backend API Endpoints

```
POST   /api/sensor-readings/            → Submit sensors + get prediction
GET    /api/sensor-readings/            → View historical readings
GET    /api/machines/                   → List all machines
POST   /api/machines/                   → Register new machine
GET    /api/alerts/                     → View active alerts
POST   /api/alerts/{id}/acknowledge/    → Mark alert as seen
GET    /api/predictions/{id}/explain/   → Understand why prediction was made
POST   /api/reports/generate/           → Generate maintenance report
GET    /api/reports/latest/             → Get latest report for machine
```

### Database Models

```
Machine
  ├─ machine_id (unique): "PUMP_1", "COMP_1", etc.
  ├─ name, machine_type, location
  └─ is_active

SensorReading (1:Many with Machine)
  ├─ timestamp (auto-set by backend)
  ├─ temperature, pressure, vibration, flow_rate, humidity
  ├─ failure_predicted (0/1)
  └─ failure_confidence (0.0-1.0)

MaintenanceAlert (auto-created)
  ├─ alert_type: "FAILURE_PREDICTED", "HIGH_TEMPERATURE", etc.
  ├─ severity: "INFO", "WARNING", "CRITICAL"
  ├─ status: "OPEN", "ACKNOWLEDGED", "RESOLVED"
  └─ recommended_action

MaintenanceReport (aggregated)
  ├─ machine, start_date, end_date
  ├─ failure_rate, avg_temperature, avg_vibration, etc.
  └─ recommendations, maintenance_priority
```

---

## How It Works

### 1. **Submit Sensor Reading**
React form sends: `{machine_id, temperature, pressure, vibration, flow_rate, humidity}`

Backend automatically:
- Validates sensor ranges
- Creates/updates machine record
- Makes ML prediction
- Auto-generates alert if failure predicted or sensor abnormal
- Returns prediction + triggered alerts + recommendations

### 2. **ML Prediction**
Random Forest model:
- Analyzes 5 sensor inputs
- Outputs: failure prediction (0/1) + confidence score (0-1)
- Feature importance shows which sensors contributed most

### 3. **Alerts**
Auto-triggered when:
- Failure predicted with high confidence
- Temperature exceeds thresholds
- Vibration exceeds ISO 20816 limits
- Pressure too high
- Humidity too high

### 4. **Explanation**
When user clicks "Why?", the system:
- Shows top 3 contributing sensors
- Displays feature importance scores
- Provides human-readable explanation
- Suggests specific maintenance actions

### 5. **Reports**
Auto-aggregates last 7 days:
- Failure rate percentage
- Average sensor readings
- Alert counts
- Smart maintenance priority (LOW/MEDIUM/HIGH/CRITICAL)
- Actionable recommendations
 
---

## Project Structure

```
RefineryApp/
├── backend/
│   ├── refinery_project/          # Django settings
│   │   ├── settings.py            # CORS, DB, sensor ranges, alert thresholds
│   │   ├── urls.py                # API routes
│   │   └── wsgi.py
│   ├── machines/                  # Core machine monitoring
│   │   ├── models.py              # Machine, SensorReading
│   │   ├── views.py               # REST endpoints
│   │   ├── serializers.py         # Input validation
│   │   ├── validators.py          # Sensor range validation
│   │   └── admin.py               # Django admin
│   ├── ml_models/                 # ML training & prediction
│   │   ├── trainer.py             # Train model (run train_model.py)
│   │   ├── predictor.py           # Load and predict, explain
│   │   └── trained_models/        # Saved models (auto-created)
│   ├── alerts/                    # Auto-alert system
│   │   ├── models.py              # MaintenanceAlert
│   │   ├── views.py               # Alert CRUD & acknowledge/resolve
│   │   ├── services.py            # Alert trigger logic
│   │   └── admin.py
│   ├── reports/                   # Report generation
│   │   ├── models.py              # MaintenanceReport
│   │   ├── views.py               # Report endpoints
│   │   ├── services.py            # Aggregation logic
│   │   └── admin.py
│   ├── manage.py                  # Django CLI
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js             # Centralized API calls
│   │   ├── components/
│   │   │   ├── MachineMonitor.jsx # Dashboard & machine list
│   │   │   ├── SensorForm.jsx      # Input form
│   │   │   ├── PredictionResult.jsx# Show prediction result
│   │   │   ├── AlertPanel.jsx      # Display active alerts
│   │   │   └── MaintenanceReport.jsx   # Report viewer
│   │   ├── App.jsx                # Main app & routing
│   │   └── index.js
│   ├── package.json
│   └── public/
│
├── training_data.csv              # 288 historical sensor readings (train the model)
├── train_model.py                 # Run this first!
└── README.md
```

---

## Configuration

### Sensor Ranges (in `settings.py`)
```python
SENSOR_RANGES = {
    'temperature': {'min': 10, 'max': 150},      # °C
    'pressure': {'min': 0, 'max': 100},          # bar
    'vibration': {'min': 0, 'max': 50},          # mm/s
    'flow_rate': {'min': 0, 'max': 5000},        # L/min
    'humidity': {'min': 0, 'max': 100},          # %
}
```

### Alert Thresholds (in `settings.py`)
```python
ALERT_THRESHOLDS = {
    'temperature_warning': 80,      # °C - creates WARNING alert
    'temperature_critical': 100,    # °C - creates CRITICAL alert
    'pressure_warning': 70,         # bar
    'pressure_critical': 90,        # bar
    'vibration_warning': 7.1,       # mm/s (ISO 20816)
    'vibration_critical': 11.0,     # mm/s
    'humidity_warning': 80,         # %
}
```

Adjust these based on your equipment specifications.

---

## Example API Workflow

### 1. Create Machine
```bash
POST http://localhost:8000/api/machines/
{
    "machine_id": "PUMP_1",
    "name": "Main Feed Pump",
    "machine_type": "PUMP",
    "location": "Section A"
}
```

### 2. Submit Sensor Reading & Get Prediction
```bash
POST http://localhost:8000/api/sensor-readings/
{
    "machine_id": "PUMP_1",
    "temperature": 95,
    "pressure": 240,
    "vibration": 0.60,
    "flow_rate": 110,
    "humidity": 50
}

Response:
{
    "id": 1,
    "machine_id": "PUMP_1",
    "timestamp": "2026-01-10T14:23:45Z",
    "temperature": 95,
    "pressure": 240,
    "vibration": 0.60,
    "flow_rate": 110,
    "humidity": 50,
    "failure_predicted": true,        ← ALARM!
    "failure_confidence": 0.85,
    "alerts": [
        {
            "id": 5, 
            "type": "FAILURE_PREDICTED",
            "severity": "CRITICAL",
            "message": "Machine Failure Predicted"
        }
    ],
    "recommendations": [
        "🚨 PREDICTED FAILURE: Schedule immediate maintenance inspection.",
        "⚙️ Pressure is high. Check pressure relief systems.",
        "⚠️ Vibration exceeds normal levels. Check bearing condition."
    ]
}
```

### 3. Understand Why (Get Explanation)
```bash
GET http://localhost:8000/api/predictions/1/explain/

Response:
{
    "sensor_reading_id": 1,
    "machine_id": "PUMP_1",
    "failure_predicted": true,
    "failure_confidence": 0.85,
    "top_sensors": [
        {
            "sensor": "temperature",
            "value": 95.0,
            "importance": 0.35,
            "status": "high"
        },
        {
            "sensor": "vibration",
            "value": 0.60,
            "importance": 0.28,
            "status": "high"
        },
        {
            "sensor": "pressure",
            "value": 240.0,
            "importance": 0.22,
            "status": "high"
        }
    ],
    "explanation_text": "FAILURE RISK DETECTED: ...",
    "recommendations": [...]
}
```

### 4. Generate Maintenance Report
```bash
POST http://localhost:8000/api/reports/generate/
{
    "machine_id": "PUMP_1",
    "days_back": 7
}

Response:
{
    "id": 1,
    "machine_id": "PUMP_1",
    "start_date": "2026-01-03",
    "end_date": "2026-01-10",
    "total_readings": 168,
    "failure_predictions": 42,
    "failure_rate": 25.0,
    "avg_temperature": 87.5,
    "avg_pressure": 215.3,
    "avg_vibration": 0.45,
    "alerts_triggered": 18,
    "critical_alerts": 6,
    "maintenance_priority": "HIGH",
    "recommendations": "HIGH RISK: 25% failure prediction rate. Plan maintenance within 48 hours. ..."
}
```

### 5. View & Acknowledge Alerts
```bash
GET http://localhost:8000/api/alerts/?status=OPEN

POST http://localhost:8000/api/alerts/5/acknowledge/
```

---

## Testing the System

### Test with API (no frontend needed)

```bash
# 1. Train model
python train_model.py

# 2. Start backend
cd backend
python manage.py migrate
python manage.py runserver

# 3. In another terminal, test prediction
curl -X POST http://localhost:8000/api/sensor-readings/ \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id": "PUMP_1",
    "temperature": 95,
    "pressure": 240,
    "vibration": 0.60,
    "flow_rate": 110,
    "humidity": 50
  }'

# 4. Check if failure was predicted
# Should return: failure_predicted: true, failure_confidence: 0.85+
```

---

## Troubleshooting

**"ML model not found" Error:**
→ Run `python train_model.py` first

**Sensor validation error:**
→ Check that sensor values are within configured ranges in `settings.py`

**Alerts not creating:**
→ Check `alerts/services.py` - verify thresholds match your sensor values

**React can't reach API:**
→ Ensure Django CORS_ALLOWED_ORIGINS includes `http://localhost:3000`

---

## Next Steps (Future Enhancements)

- [ ] Real-time dashboard with WebSockets
- [ ] Equipment photos & documentation in alerts
- [ ] Mobile app (React Native)
- [ ] PDF maintenance reports
- [ ] Predictive maintenance schedules
- [ ] Model retraining pipeline
- [ ] Multi-site dashboard
- [ ] Email notifications on critical alerts
- [ ] Integration with SCADA systems

---

## Support

For issues or questions, review the code comments or check specific app README files.

Good luck with your refinery monitoring system! 🚀
