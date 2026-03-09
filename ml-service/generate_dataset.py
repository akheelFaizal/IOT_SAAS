import pandas as pd
import numpy as np
import random
import os

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    random.seed(42)
    
    device_types = ['AC', 'Lighting', 'Refrigerator', 'Fan', 'TV']
    rooms = ['living_room', 'bedroom', 'kitchen', 'bathroom']
    
    data = []
    
    for _ in range(num_samples):
        device = random.choice(device_types)
        room = random.choice(rooms)
        
        # Base power rating (Watts)
        if device == 'AC':
            power_rating = random.uniform(1000, 2000)
            hours_used = random.uniform(0, 12)
        elif device == 'Refrigerator':
            power_rating = random.uniform(150, 400)
            hours_used = 24  # Usually always on
        elif device == 'TV':
            power_rating = random.uniform(80, 200)
            hours_used = random.uniform(0, 8)
        elif device == 'Lighting':
            power_rating = random.uniform(10, 50)
            hours_used = random.uniform(2, 12)
        else: # Fan
            power_rating = random.uniform(50, 100)
            hours_used = random.uniform(0, 16)
            
        time_of_day = random.choice(['morning', 'afternoon', 'evening', 'night'])
        day_of_week = random.choice(['weekday', 'weekend'])
        temperature = random.uniform(20, 35) # Celcius
        
        # Target 1: device level energy_kwh for this specific usage session/day
        energy_kwh = (power_rating * hours_used) / 1000.0
        
        # Add some randomness
        energy_kwh *= np.random.normal(1.0, 0.1)
        if energy_kwh < 0:
            energy_kwh = 0
        # Estimate monthly household calculation (just for the slab risk classification)
        base_household_monthly = random.uniform(100, 150)
        
        if device == 'AC' and hours_used > 5:
            base_household_monthly += random.uniform(100, 200)
            
        if temperature > 30:
            base_household_monthly += 30 # AC works harder
            
        if day_of_week == 'weekend':
            base_household_monthly += 10
            
        monthly_units = base_household_monthly + (energy_kwh * 30)
        
        # Target 2: Will it cross? (classification)
        probability_of_crossing_200_units = 1 if monthly_units > 200 else 0
        
        data.append({
            'device_type': device,
            'power_rating': power_rating,
            'hours_used': hours_used,
            'time_of_day': time_of_day,
            'day_of_week': day_of_week,
            'room': room,
            'temperature': temperature,
            'energy_kwh': energy_kwh,
            'probability_of_crossing_200_units': probability_of_crossing_200_units
        })
        
    df = pd.DataFrame(data)
    
    # Create data directory if not exists
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/smart_home_energy.csv', index=False)
    print(f"Generated {num_samples} samples and saved to data/smart_home_energy.csv")

if __name__ == '__main__':
    generate_synthetic_data()
