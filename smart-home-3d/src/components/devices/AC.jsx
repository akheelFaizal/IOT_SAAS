import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box, Sphere } from '@react-three/drei';

const AC = ({ deviceId, position, rotation }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* Main AC Body */}
      <Box args={[1.2, 0.4, 0.3]} castShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </Box>
      {/* Vent line */}
      <Box args={[1.0, 0.05, 0.02]} position={[0, -0.1, 0.15]}>
         <meshStandardMaterial color="#cbd5e1" />
      </Box>
      {/* Indicator LED */}
      <Sphere args={[0.03, 16, 16]} position={[0.4, -0.1, 0.16]}>
         <meshStandardMaterial 
            color={isOn ? "#22c55e" : "#64748b"} 
            emissive={isOn ? "#4ade80" : "#000"} 
            emissiveIntensity={isOn ? 1 : 0} 
         />
      </Sphere>
    </group>
  );
};

export default AC;
