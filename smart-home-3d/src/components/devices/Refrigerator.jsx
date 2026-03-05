import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box } from '@react-three/drei';

const Refrigerator = ({ deviceId, position, rotation }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* Fridge Body */}
      <Box args={[1.0, 2.2, 1.0]} position={[0, 1.1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.6} />
      </Box>
      {/* Upper Door Line */}
      <Box args={[1.02, 0.02, 1.02]} position={[0, 1.4, 0]}>
        <meshStandardMaterial color="#94a3b8" />
      </Box>
      {/* Control Panel / Indicator */}
      <Box args={[0.2, 0.3, 0.05]} position={[0.2, 1.6, 0.51]}>
        <meshStandardMaterial 
            color={isOn ? "#38bdf8" : "#334155"} 
            emissive={isOn ? "#7dd3fc" : "#000"} 
            emissiveIntensity={isOn ? 0.8 : 0}
        />
      </Box>
    </group>
  );
};

export default Refrigerator;
