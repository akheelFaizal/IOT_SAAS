import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDevices } from '../../store/DeviceContext';
import { Box, Cylinder } from '@react-three/drei';

const Fan = ({ deviceId, position }) => {
  const { devices, toggleDevice } = useDevices();
  const device = devices.find((d) => d.device_id === deviceId);
  const isOn = device?.state;
  const bladesRef = useRef();

  const handleClick = (e) => {
    e.stopPropagation();
    toggleDevice(deviceId);
  };

  useFrame((state, delta) => {
    if (isOn && bladesRef.current) {
      bladesRef.current.rotation.y += delta * 15; // Rotate blades
    }
  });

  return (
    <group position={position} onClick={handleClick}>
      {/* Fan Base/Motor */}
      <Cylinder args={[0.2, 0.2, 0.3, 16]} position={[0, 2.8, 0]}>
        <meshStandardMaterial color="#475569" />
      </Cylinder>
      {/* Rod connecting to ceiling */}
      <Cylinder args={[0.05, 0.05, 0.5, 8]} position={[0, 3.1, 0]}>
        <meshStandardMaterial color="#e2e8f0" />
      </Cylinder>
      
      {/* Blades */}
      <group ref={bladesRef} position={[0, 2.7, 0]}>
        <Box args={[1.5, 0.02, 0.1]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#94a3b8" />
        </Box>
        <Box args={[0.1, 0.02, 1.5]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#94a3b8" />
        </Box>
      </group>
    </group>
  );
};

export default Fan;
