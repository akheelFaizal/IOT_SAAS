from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="Smart Home ML Prediction Service")

# Load models and encoders if available
models_dir = 'models'
try:
    regressor = joblib.load(f'{models_dir}/energy_kwh_regressor.pkl')
    classifier = joblib.load(f'{models_dir}/slab_risk_classifier.pkl')
    encoders = joblib.load(f'{models_dir}/encoders.pkl')
    models_loaded = True
except Exception as e:
    print(f"Warning: Models not loaded. Generating synthetic datasets and models first is required for accurate predictions. Error: {e}")
    models_loaded = False

class DeviceInput(BaseModel):
    device: str
    hours: float
    power: float
    room: str = "living_room" # default

class PredictionRequest(BaseModel):
    devices: List[DeviceInput]
    temperature: float = 28.0
    day_of_week: str = "weekday"
    time_of_day: str = "evening"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML Prediction Service is running", "models_loaded": models_loaded}

@app.post("/predict-consumption")
def predict_consumption(req: PredictionRequest):
    if not models_loaded:
        # Fallback dummy logic if models aren't ready
        return {
            "device_predictions": [],
            "predicted_daily_units": 7.0,
            "predicted_monthly_units": 210.0,
            "slab_risk": "high",
            "probability_of_crossing_200_units": 0.85,
            "recommendations": ["Reduce AC by 2 hours", "Turn off devices when not in use"]
        }
    
    device_predictions = []
    total_daily_units = 0
    max_prob_crossing_per_device = 0
    recommendations = []
    
    for dev in req.devices:
        try:
            # Map values
            device_type_enc = encoders['device_type'].transform([dev.device])[0] if dev.device in encoders['device_type'].classes_ else -1
            room_enc = encoders['room'].transform([dev.room])[0] if dev.room in encoders['room'].classes_ else -1
            dow_enc = encoders['day_of_week'].transform([req.day_of_week])[0] if req.day_of_week in encoders['day_of_week'].classes_ else -1
            tod_enc = encoders['time_of_day'].transform([req.time_of_day])[0] if req.time_of_day in encoders['time_of_day'].classes_ else -1
            
            # Simple fallback if categories don't match exactly
            if device_type_enc == -1: device_type_enc = 0
            if room_enc == -1: room_enc = 0
            if dow_enc == -1: dow_enc = 0
            if tod_enc == -1: tod_enc = 0

            features = pd.DataFrame([{
                'device_type': device_type_enc,
                'power_rating': dev.power,
                'hours_used': dev.hours,
                'time_of_day': tod_enc,
                'day_of_week': dow_enc,
                'room': room_enc,
                'temperature': req.temperature
            }])
            
            pred_kwh = regressor.predict(features)[0] # Device-level daily kwh
            prob_crossing = classifier.predict_proba(features)[0][1] # Probability of class 1 based on this device's profile
            
            # Device level output
            device_predictions.append({
                "device": dev.device,
                "room": dev.room,
                "energy_kwh": round(pred_kwh, 2)
            })
            
            total_daily_units += pred_kwh
            if prob_crossing > max_prob_crossing_per_device:
                max_prob_crossing_per_device = prob_crossing
                
            # Generate recommendations based on rule engine over the predictions
            if pred_kwh > 2.0: # Arbitrary high usage condition
                recommendations.append(f"Reduce {dev.device} usage in the {dev.room} (currently predicting {pred_kwh:.2f} kWh/day) to lower costs.")
            elif dev.device == 'AC' and req.temperature < 24:
                recommendations.append(f"Increase AC temperature in the {dev.room} by 2 degrees for 10% saving.")
                
        except Exception as e:
            print(f"Error processing device {dev.device}: {e}")
            pass
            
    total_monthly_units = total_daily_units * 30
    
    # Global recommendations
    if max_prob_crossing_per_device > 0.7 or total_monthly_units > 200:
        slab_risk = "high"
        if not recommendations:
            recommendations.append("High risk of crossing 200 unit slab. Consider optimizing overall usage.")
    elif max_prob_crossing_per_device > 0.3 or total_monthly_units > 150:
        slab_risk = "medium"
    else:
        slab_risk = "low"
        if not recommendations:
           recommendations.append("Usage is optimal. Keep it up!")
           
    return {
        "device_predictions": device_predictions,
        "predicted_daily_units": round(total_daily_units, 2),
        "predicted_monthly_units": round(total_monthly_units, 2),
        "slab_risk": slab_risk,
        "probability_of_crossing_200_units": round(max_prob_crossing_per_device, 2),
        "recommendations": list(set(recommendations)) # Deduplicate
    }

@app.post("/optimize-usage")
def optimize_usage(req: PredictionRequest):
    # Reuse predict_consumption logic to get recommendations
    res = predict_consumption(req)
    return {
        "devices_analyzed": len(req.devices),
        "risk_level": res.get("slab_risk"),
        "suggestions": res.get("recommendations", [])
    }
