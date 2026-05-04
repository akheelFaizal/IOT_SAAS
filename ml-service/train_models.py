import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, accuracy_score
import joblib
import os
import shap

def train_pipeline():
    data_path = 'data/household_power_consumption.csv'
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}")
        return

    print("Loading dataset...")
    # Handle '?' as NaN and set low_memory=False for better type inference
    df = pd.read_csv(data_path, na_values='?', low_memory=False)
    
    # List of numeric columns that might have '?' or mixed types
    numeric_cols = [
        'Global_active_power', 'Global_reactive_power', 'Voltage', 
        'Global_intensity', 'Sub_metering_1', 'Sub_metering_2', 
        'Sub_metering_3', 'Solar_Generation'
    ]
    
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # 1. Preprocessing
    # Ensure Timestamp is datetime
    df['Timestamp'] = pd.to_datetime(df['Timestamp'], format='%d-%m-%Y %H:%M:%S')
    df = df.sort_values('Timestamp')
    
    # Handle missing values
    df = df.ffill()
    
    # 2. Feature Engineering
    print("Performing feature engineering...")
    
    # Cyclical Encoding for Time
    df['hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
    
    # Derived Feature: Net Power
    df['net_power'] = df['Global_active_power'] - df['Solar_Generation']
    
    # Lag Features (1min, 5min, 60min)
    df['lag_1'] = df['Global_active_power'].shift(1)
    df['lag_5'] = df['Global_active_power'].shift(5)
    df['lag_60'] = df['Global_active_power'].shift(60)
    
    # Rolling Statistics (1 hour window)
    df['rolling_mean_60'] = df['Global_active_power'].rolling(window=60).mean()
    df['rolling_std_60'] = df['Global_active_power'].rolling(window=60).std()
    
    # Target for Classification: Slab Risk
    # Let's define Slab Risk as: If current power * 720 hours > 200 kWh
    # (Simplified proxy for monthly projection)
    df['slab_risk'] = (df['Global_active_power'] * 720 > 200).astype(int)
    
    # Drop rows with NaN from lags/rolling
    df = df.dropna()
    
    # Features selection
    features = [
        'Global_reactive_power', 'Voltage', 'Global_intensity', 
        'Sub_metering_1', 'Sub_metering_2', 'Sub_metering_3',
        'Occupancy', 'Solar_Generation', 'EV_Charging', 'Anomaly',
        'hour_sin', 'hour_cos', 'net_power', 
        'lag_1', 'lag_5', 'lag_60', 'rolling_mean_60', 'rolling_std_60'
    ]
    
    X = df[features]
    y_reg = df['Global_active_power']
    y_clf = df['slab_risk']
    
    # 3. Time-Series Split (Chronological)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_reg_train, y_reg_test = y_reg.iloc[:split_idx], y_reg.iloc[split_idx:]
    y_clf_train, y_clf_test = y_clf.iloc[:split_idx], y_clf.iloc[split_idx:]
    
    # Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Training Models
    print("Training Regression Model (LightGBM)...")
    reg_model = lgb.LGBMRegressor(n_estimators=500, learning_rate=0.05, random_state=42, verbose=-1)
    reg_model.fit(X_train_scaled, y_reg_train)
    
    reg_pred = reg_model.predict(X_test_scaled)
    print(f"Regression MAE: {mean_absolute_error(y_reg_test, reg_pred):.4f}")
    
    print("Training Classification Model (LightGBM)...")
    clf_model = lgb.LGBMClassifier(n_estimators=500, learning_rate=0.05, random_state=42, verbose=-1)
    clf_model.fit(X_train_scaled, y_clf_train)
    
    clf_pred = clf_model.predict(X_test_scaled)
    print(f"Classification Accuracy: {accuracy_score(y_clf_test, clf_pred):.4f}")
    
    # 5. Serialization
    print("Saving models and metadata...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(reg_model, 'models/consumption_model.pkl')
    joblib.dump(clf_model, 'models/slab_risk_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(features, 'models/feature_names.pkl')
    
    # SHAP Explainer for interpretability
    print("Generating SHAP explainer...")
    explainer = shap.TreeExplainer(reg_model)
    joblib.dump(explainer, 'models/shap_explainer.pkl')
    
    print("Pipeline completed successfully!")

if __name__ == '__main__':
    train_pipeline()
