import React from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box } from '@react-three/drei';

const SolarInverter = ({ deviceId, position, rotation = [0, 0, 0] }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} rotation={rotation} onClick={handleClick}>
      {/* Inverter Box */}
      <Box args={[0.6, 0.8, 0.2]} position={[0, 1.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} metalness={0.8} />
      </Box>
      {/* Heat Sinks */}
      <Box args={[0.5, 0.7, 0.05]} position={[0, 1.5, -0.1]}>
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </Box>
      {/* Display */}
      <Box args={[0.2, 0.1, 0.02]} position={[0, 1.65, 0.11]}>
        <meshStandardMaterial color={isOn ? "#fbbf24" : "#0f172a"} emissive={isOn ? "#fde047" : "#000"} emissiveIntensity={isOn ? 0.6 : 0} />
      </Box>
      {/* Power lines going down */}
      <Box args={[0.05, 0.4, 0.05]} position={[-0.15, 1.0, 0.0]}>
        <meshStandardMaterial color="#334155" />
      </Box>
      <Box args={[0.05, 0.4, 0.05]} position={[0.15, 1.0, 0.0]}>
        <meshStandardMaterial color="#334155" />
      </Box>
    </group>
  );
};

export default SolarInverter;
