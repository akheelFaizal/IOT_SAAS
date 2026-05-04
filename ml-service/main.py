from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from typing import List, Dict

app = FastAPI(title="SmartSaaS ML Service")

# Global variables for models
models = {}

@app.on_event("startup")
def load_models():
    model_paths = {
        'reg_model': 'models/consumption_model.pkl',
        'clf_model': 'models/slab_risk_model.pkl',
        'scaler': 'models/scaler.pkl',
        'features': 'models/feature_names.pkl',
        'shap_explainer': 'models/shap_explainer.pkl'
    }
    
    for key, path in model_paths.items():
        if os.path.exists(path):
            models[key] = joblib.load(path)
            print(f"Loaded {key}")
        else:
            print(f"Warning: {path} not found.")

class TelemetryData(BaseModel):
    Global_reactive_power: float
    Voltage: float
    Global_intensity: float
    Sub_metering_1: float
    Sub_metering_2: float
    Sub_metering_3: float
    Occupancy: int
    Solar_Generation: float
    EV_Charging: int
    Anomaly: int
    Hour: int
    history: List[float]  # Recent 60 mins of Global_active_power for lags

@app.post("/predict-consumption")
async def predict_consumption(data: TelemetryData):
    if 'reg_model' not in models or 'scaler' not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # 1. Feature Engineering (Match training logic)
    hour_sin = np.sin(2 * np.pi * data.Hour / 24)
    hour_cos = np.cos(2 * np.pi * data.Hour / 24)
    
    # Assuming history[-1] is the last active power value
    last_power = data.history[-1] if data.history else 0
    net_power = last_power - data.Solar_Generation
    
    # Lags from history
    lag_1 = data.history[-1] if len(data.history) >= 1 else 0
    lag_5 = data.history[-5] if len(data.history) >= 5 else lag_1
    lag_60 = data.history[0] if len(data.history) >= 60 else lag_5
    
    # Rolling stats from history
    rolling_mean = np.mean(data.history) if data.history else 0
    rolling_std = np.std(data.history) if data.history else 0
    
    input_dict = {
        'Global_reactive_power': data.Global_reactive_power,
        'Voltage': data.Voltage,
        'Global_intensity': data.Global_intensity,
        'Sub_metering_1': data.Sub_metering_1,
        'Sub_metering_2': data.Sub_metering_2,
        'Sub_metering_3': data.Sub_metering_3,
        'Occupancy': data.Occupancy,
        'Solar_Generation': data.Solar_Generation,
        'EV_Charging': data.EV_Charging,
        'Anomaly': data.Anomaly,
        'hour_sin': hour_sin,
        'hour_cos': hour_cos,
        'net_power': net_power,
        'lag_1': lag_1,
        'lag_5': lag_5,
        'lag_60': lag_60,
        'rolling_mean_60': rolling_mean,
        'rolling_std_60': rolling_std
    }
    
    input_df = pd.DataFrame([input_dict])
    
    # Ensure column order matches training
    input_df = input_df[models['features']]
    
    # Scale
    input_scaled = models['scaler'].transform(input_df)
    
    # 2. Inference
    prediction = models['reg_model'].predict(input_scaled)[0]
    slab_risk_prob = models['clf_model'].predict_proba(input_scaled)[0][1]
    
    # 3. Interpretability (SHAP)
    explanations = {}
    if 'shap_explainer' in models:
        shap_values = models['shap_explainer'].shap_values(input_scaled)
        # Handle LightGBM multi-output or single output SHAP format
        vals = shap_values[0] if isinstance(shap_values, list) else shap_values
        for i, feat in enumerate(models['features']):
            explanations[feat] = float(vals[0][i])
            
    return {
        "predicted_consumption_kwh": float(prediction),
        "slab_risk_probability": float(slab_risk_prob),
        "explanations": explanations
    }

@app.post("/optimize-usage")
async def optimize_usage(prediction_data: Dict):
    # Logic to generate human readable recommendations
    risk = prediction_data.get("slab_risk_probability", 0)
    explanations = prediction_data.get("explanations", {})
    
    recommendations = []
    
    if risk > 0.7:
        recommendations.append("High alert: You are likely to cross the 200-unit slab this month.")
        
        # Look at SHAP values to see what's causing it
        if explanations.get('EV_Charging', 0) > 0.1:
            recommendations.append("Tip: EV Charging is significantly driving your risk. Consider charging after 11 PM.")
        if explanations.get('net_power', 0) > 0.2:
            recommendations.append("Observation: Your current appliance draw is much higher than your solar generation.")
        if explanations.get('Occupancy', 0) < 0 and explanations.get('rolling_mean_60', 0) > 1.0:
            recommendations.append("Safety Check: High energy usage detected while the home appears unoccupied.")
            
    if not recommendations:
        recommendations.append("Your energy usage is currently optimized for the lowest slab rate.")
        
    return {"recommendations": recommendations}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
