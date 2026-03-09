import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_models():
    if not os.path.exists('data/smart_home_energy.csv'):
        print("Dataset not found. Please run generate_dataset.py first.")
        return
        
    df = pd.read_csv('data/smart_home_energy.csv')
    
    # Feature Engineering / Preprocessing
    # Encode categorical variables
    encoders = {}
    categorical_cols = ['device_type', 'time_of_day', 'day_of_week', 'room']
    
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    features = ['device_type', 'power_rating', 'hours_used', 'time_of_day', 'day_of_week', 'room', 'temperature']
    X = df[features]
    
    y_reg = df['energy_kwh']
    y_class = df['probability_of_crossing_200_units']
    
    X_train, X_test, y_reg_train, y_reg_test, y_class_train, y_class_test = train_test_split(
        X, y_reg, y_class, test_size=0.2, random_state=42
    )
    
    print("Training Regression Model (Random Forest)...")
    reg_model = RandomForestRegressor(n_estimators=100, random_state=42)
    reg_model.fit(X_train, y_reg_train)
    reg_score = reg_model.score(X_test, y_reg_test)
    print(f"Regression R^2 Score: {reg_score:.4f}")
    
    print("Training Classification Model (Random Forest)...")
    clf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    clf_model.fit(X_train, y_class_train)
    clf_score = clf_model.score(X_test, y_class_test)
    print(f"Classification Accuracy: {clf_score:.4f}")
    
    # Save models and encoders
    os.makedirs('models', exist_ok=True)
    joblib.dump(reg_model, 'models/energy_kwh_regressor.pkl')
    joblib.dump(clf_model, 'models/slab_risk_classifier.pkl')
    joblib.dump(encoders, 'models/encoders.pkl')
    print("Models saved successfully to models/")

if __name__ == '__main__':
    train_models()
