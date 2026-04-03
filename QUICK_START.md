# ⚡ Quick Start - 5 Minutes to Live System

Follow these steps in order:

## Step 1: Backend Setup (2 minutes)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# OR: source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional, for admin panel
```

## Step 2: Train ML Model (1 minute)

**⚠️ DO THIS BEFORE RUNNING SERVER**

```bash
cd ..  # Go back to RefineryApp root
python train_model.py
```

Expected output:
```
Model Metrics:
  Accuracy:  0.9444
  Precision: 0.9167
  Recall:    1.0000
  F1-Score:  0.9569
✓ Model successfully trained
```

## Step 3: Start Django Server (30 seconds)

```bash
cd backend
python manage.py runserver
```

Server runs at: **http://localhost:8000**

Test it works:
```bash
curl http://localhost:8000/api/machines/
```

## Step 4: Frontend Setup (1 minute)

In a NEW terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Done! 🎉

**Your system is now running!**

1. Open http://localhost:3000 in your browser
2. Go to the "Monitor" tab
3. Submit sensor data:
   - Machine ID: `PUMP_1`
   - Temperature: `95`
   - Pressure: `240`
   - Vibration: `0.60`
   - Flow Rate: `110`
   - Humidity: `50`
4. Click "Submit Reading"
5. See the prediction: **FAILURE RISK DETECTED** ✓

---

## What Just Happened?

1. ✅ You trained a Random Forest model on 288 sensor readings
2. ✅ Django backend running with 5 apps (machines, ml_models, alerts, reports)
3. ✅ React frontend with 4 tabs (Monitor, Alerts, Reports, API calls)
4. ✅ ML prediction: "This sensor data matches a failure pattern"
5. ✅ Auto-generated alert: "Machine Failure Predicted - CRITICAL"
6. ✅ Smart recommendations: Temperature high → check cooling, Pressure high → check regulators

---

## Next Steps

- **Explore the API:** http://localhost:8000/admin (use your superuser login)
- **View all endpoints:** http://localhost:8000/api/
- **Generate a report:** Tab → Report → Select PUMP_1 → Generate Report
- **Check alerts:** Tab → Alerts
- **Why explanation:** In Prediction Result → "Why? (Show Explanation)"

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "ML model not found" | Run `python train_model.py` |
| "ModuleNotFoundError: django" | Activate venv: `venv\Scripts\activate` |
| "Port 8000 in use" | `python manage.py runserver 8001` |
| "Port 3000 in use" | `npm start -- --port 3001` |
| CORS error from React | Check Django `CORS_ALLOWED_ORIGINS` in settings.py |

---

**Questions? Check README.md for full documentation.**
