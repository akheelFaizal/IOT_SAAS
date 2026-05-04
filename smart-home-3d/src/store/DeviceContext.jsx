import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const initialDevices = [
  // Living Room
  { device_id: 'light_living_room', device_name: 'Living Room Light', power_rating_watts: 60, state: false, room: 'living_room' },
  { device_id: 'tv_living_room', device_name: 'Living Room TV', power_rating_watts: 150, state: false, room: 'living_room' },
  { device_id: 'fan_living_room', device_name: 'Living Room Fan', power_rating_watts: 75, state: false, room: 'living_room' },
  // Bedroom
  { device_id: 'light_bedroom', device_name: 'Bedroom Light', power_rating_watts: 40, state: false, room: 'bedroom' },
  { device_id: 'ac_bedroom', device_name: 'Bedroom AC', power_rating_watts: 1500, state: false, room: 'bedroom' },
  { device_id: 'fan_bedroom', device_name: 'Bedroom Fan', power_rating_watts: 75, state: false, room: 'bedroom' },
  // Kitchen
  { device_id: 'light_kitchen', device_name: 'Kitchen Light', power_rating_watts: 40, state: false, room: 'kitchen' },
  { device_id: 'fridge_kitchen', device_name: 'Refrigerator', power_rating_watts: 200, state: true, room: 'kitchen' }, // default true typically, but can be false for demo
];

const DeviceContext = createContext(null);

export const DeviceProvider = ({ children }) => {
  const [devices, setDevices] = useState(initialDevices);
  const [initLoaded, setInitLoaded] = useState(false);
  const { token } = useAuth();

  // Poll for device updates (usage hours, real states, etc)
  React.useEffect(() => {
    const fetchStates = async () => {
      try {
        if (!token) return;
        const res = await fetch('http://localhost:3000/api/devices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const cloudDevices = await res.json();
          setDevices(prev => prev.map(localDev => {
            const remoteDev = cloudDevices.find(d => d.device_id === localDev.device_id);
            if (!remoteDev) return localDev;
            
            return { 
              ...localDev, 
              state: remoteDev.state === true || remoteDev.state === 'on',
              // Sync the dynamic metrics from backend
              usage_time_hours: remoteDev.usage_time_hours,
              energy_kwh: remoteDev.energy_kwh
            };
          }));
          if (!initLoaded) setInitLoaded(true);
        }
      } catch (err) {
        console.error("Failed to sync device states", err);
      }
    };

    // Initial fetch
    fetchStates();

    // Polling interval (5 seconds)
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, [initLoaded]);

  const toggleDevice = useCallback(async (device_id) => {
    // Find the current state synchronously to ensure the API payload is correct
    const currentDevice = devices.find(d => d.device_id === device_id);
    if (!currentDevice) return;
    
    const newState = !currentDevice.state;

    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        if (device.device_id === device_id) {
          return { ...device, state: newState };
        }
        return device;
      })
    );

    const payload = {
      device: device_id,
      state: newState ? 'on' : 'off',
      timestamp: Date.now(),
    };

    console.log('[API] POST /device-event payload:', payload);

    try {
      await fetch('http://localhost:3000/device-event', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload) 
      });
    } catch (error) {
      console.error('Failed to post device event', error);
    }
  }, [devices, token]);

  return (
    <DeviceContext.Provider value={{ devices, toggleDevice }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};
