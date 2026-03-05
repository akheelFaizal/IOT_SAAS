import React, { useRef } from 'react';
import { useDevices } from '../../store/DeviceContext';
import { Box } from '@react-three/drei';

const Light = ({ deviceId, position }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  return (
    <group position={position} onClick={handleClick}>
      {/* Light fixture */}
      <Box args={[0.5, 0.1, 0.5]} position={[0, 2.9, 0]}>
        <meshStandardMaterial color={isOn ? "#fbbf24" : "#475569"} emissive={isOn ? "#fde047" : "#000"} emissiveIntensity={isOn ? 1 : 0} />
      </Box>
      
      {/* Actual PointLight used for visual illumination */}
      {isOn && (
        <pointLight position={[0, 2.5, 0]} intensity={2.5} distance={10} color="#fef08a" castShadow />
      )}
    </group>
  );
};

export default Light;
