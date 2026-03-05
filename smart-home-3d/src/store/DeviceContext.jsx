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

    console.log('[Mock API] POST /device-event payload:', payload);

    try {
      // In a real scenario, this would be a real fetch call:
      // await fetch('/device-event', { method: 'POST', body: JSON.stringify(payload) });
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network latency
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
