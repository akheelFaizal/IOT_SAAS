import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box } from '@react-three/drei';

const EVCharger = ({ deviceId, position, rotation = [0, 0, 0] }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* Main Wall Box */}
      <Box args={[0.4, 0.6, 0.15]} position={[0, 1.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </Box>
      {/* Screen / Display */}
      <Box args={[0.25, 0.15, 0.02]} position={[0, 1.3, 0.08]}>
        <meshStandardMaterial color={isOn ? "#10b981" : "#0f172a"} emissive={isOn ? "#34d399" : "#000"} emissiveIntensity={isOn ? 0.8 : 0} />
      </Box>
      {/* Cable Connector dock */}
      <Box args={[0.1, 0.15, 0.1]} position={[0, 1.0, 0.08]}>
        <meshStandardMaterial color="#0f172a" />
      </Box>
      {/* Indicator Ring */}
      <Box args={[0.3, 0.02, 0.02]} position={[0, 1.15, 0.08]}>
        <meshStandardMaterial color={isOn ? "#3b82f6" : "#64748b"} emissive={isOn ? "#60a5fa" : "#000"} emissiveIntensity={isOn ? 1 : 0} />
      </Box>
    </group>
  );
};

export default EVCharger;
