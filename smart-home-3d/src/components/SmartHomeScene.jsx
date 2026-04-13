import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, KeyboardControls } from '@react-three/drei';
import House from './House';

const SmartHomeScene = ({ controls = true, autoRotate = false }) => {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
      ]}
    >
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
          <ambientLight intensity={0.2} />
          
          <House />
          
          <OrbitControls 
            makeDefault
            enabled={controls}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1} 
            maxDistance={25}
            minDistance={2}
          />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
};

export default SmartHomeScene;
