import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box, Cylinder } from '@react-three/drei';

const Washer = ({ deviceId, position, rotation = [0, 0, 0] }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* Washer Body */}
      <Box args={[0.8, 1.0, 0.8]} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </Box>
      {/* Front Door */}
      <Cylinder args={[0.25, 0.25, 0.05, 32]} position={[0, 0.5, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </Cylinder>
      {/* Glass */}
      <Cylinder args={[0.2, 0.2, 0.06, 32]} position={[0, 0.5, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={isOn ? "#bae6fd" : "#0f172a"} transparent opacity={0.8} emissive={isOn ? "#38bdf8" : "#000"} emissiveIntensity={isOn ? 0.5 : 0} />
      </Cylinder>
      {/* Control Panel */}
      <Box args={[0.8, 0.15, 0.1]} position={[0, 0.9, 0.36]}>
        <meshStandardMaterial color="#475569" />
      </Box>
      {/* Indicator Light */}
      <Box args={[0.05, 0.05, 0.02]} position={[0.3, 0.9, 0.42]}>
        <meshStandardMaterial color={isOn ? "#22c55e" : "#ef4444"} emissive={isOn ? "#4ade80" : "#000"} emissiveIntensity={isOn ? 1 : 0} />
      </Box>
    </group>
  );
};

export default Washer;
