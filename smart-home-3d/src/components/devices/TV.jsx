import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box } from '@react-three/drei';

const TV = ({ deviceId, position, rotation }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* TV Screen */}
      <Box args={[1.5, 0.9, 0.1]} castShadow>
        <meshStandardMaterial 
          color={isOn ? "#60a5fa" : "#1e293b"} 
          emissive={isOn ? "#3b82f6" : "#000"} 
          emissiveIntensity={isOn ? 0.8 : 0} 
        />
      </Box>
      {/* TV Bezel */}
      <Box args={[1.6, 1.0, 0.05]} position={[0, 0, -0.05]}>
        <meshStandardMaterial color="#0f172a" />
      </Box>
    </group>
  );
};

export default TV;
