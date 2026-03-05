import React from 'react';
import { Box } from '@react-three/drei';
import Light from './devices/Light';
import Fan from './devices/Fan';
import TV from './devices/TV';
import AC from './devices/AC';
import Refrigerator from './devices/Refrigerator';

const Wall = ({ position, args, color = "#e2e8f0" }) => (
  <Box position={position} args={args} receiveShadow castShadow>
    <meshStandardMaterial color={color} roughness={0.9} />
  </Box>
);

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
    <planeGeometry args={[10, 10]} />
    <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
  </mesh>
);

const House = () => {
  return (
    <group>
      <Floor />
      
      {/* Exterior Walls */}
      <Wall position={[0, 1.5, -5]} args={[10.2, 3, 0.2]} color="#94a3b8" /> {/* Back */}
      <Wall position={[0, 1.5, 5]} args={[10.2, 3, 0.2]} color="#94a3b8" />  {/* Front */}
      <Wall position={[-5, 1.5, 0]} args={[0.2, 3, 10]} color="#94a3b8" />   {/* Left */}
      <Wall position={[5, 1.5, 0]} args={[0.2, 3, 10]} color="#94a3b8" />    {/* Right */}

      {/* Interior Walls (dividing 10x10 into four 5x5 rooms) */}
      {/* Center divider X-axis (with doorway gaps) */}
      <Wall position={[-2.5, 1.5, 0]} args={[4, 3, 0.2]} /> {/* Left divider */}
      <Wall position={[3.5, 1.5, 0]} args={[3, 3, 0.2]} />  {/* Right divider */}

      {/* Center divider Z-axis */}
      <Wall position={[0, 1.5, -3]} args={[0.2, 3, 4]} /> {/* Back divider */}
      <Wall position={[0, 1.5, 3]} args={[0.2, 3, 4]} />  {/* Front divider */}
      
      {/* 
        Rooms definition:
        Living Room:  Bottom Left  [-2.5, 0, 2.5]
        Kitchen:      Bottom Right [2.5, 0, 2.5]
        Bedroom:      Top Left     [-2.5, 0, -2.5]
        Bathroom:     Top Right    [2.5, 0, -2.5]
      */}

      {/* Living Room */}
      <Light deviceId="light_living_room" position={[-2.5, 0, 2.5]} />
      <Fan deviceId="fan_living_room" position={[-2.5, 0, 2.5]} />
      <TV deviceId="tv_living_room" position={[-4.8, 1.2, 2.5]} rotation={[0, Math.PI / 2, 0]} />

      {/* Bedroom */}
      <Light deviceId="light_bedroom" position={[-2.5, 0, -2.5]} />
      <Fan deviceId="fan_bedroom" position={[-2.5, 0, -2.5]} />
      <AC deviceId="ac_bedroom" position={[-2.5, 2.5, -4.8]} rotation={[0, 0, 0]} />

      {/* Kitchen */}
      <Light deviceId="light_kitchen" position={[2.5, 0, 2.5]} />
      <Refrigerator deviceId="fridge_kitchen" position={[4.0, 0, 4.0]} rotation={[0, -Math.PI / 4, 0]} />
      
    </group>
  );
};

export default House;
