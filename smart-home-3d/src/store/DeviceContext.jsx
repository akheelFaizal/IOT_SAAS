import React, { createContext, useContext, useState, useCallback } from 'react';

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

  const toggleDevice = useCallback(async (device_id) => {
    let toggledState = false;

    setDevices((prevDevices) =>
      prevDevices.map((device) => {
        if (device.device_id === device_id) {
          toggledState = !device.state;
          return { ...device, state: toggledState };
        }
        return device;
      })
    );

    // Mock API Call
    const payload = {
      device: device_id,
      state: toggledState ? 'on' : 'off',
      timestamp: Date.now(),
    };

    console.log('[API] POST /device-event payload:', payload);

    try {
      await fetch('http://localhost:3000/device-event', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });
    } catch (error) {
      console.error('Failed to post device event', error);
    }
  }, []);

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
