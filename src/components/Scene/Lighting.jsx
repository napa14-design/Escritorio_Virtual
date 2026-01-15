import React from 'react';

const Lighting = ({ lights, environment }) => {
  return (
    <>
      {/* Ambient light */}
      <ambientLight
        intensity={environment.ambientLightIntensity}
        color={environment.ambientLightColor}
      />

      {/* Hemisphere light for better outdoor feel */}
      <hemisphereLight
        args={['#ffffff', '#606060', 0.6]}
        position={[0, 50, 0]}
      />

      {/* Dynamic lights */}
      {lights.map((light) => {
        switch (light.type) {
          case 'directional':
            return (
              <directionalLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={light.color}
                castShadow={light.castShadow}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
              />
            );

          case 'point':
            return (
              <pointLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={light.color}
                distance={light.distance || 10}
                decay={light.decay || 2}
                castShadow={light.castShadow}
              />
            );

          case 'spot':
            return (
              <spotLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={light.color}
                angle={light.angle || Math.PI / 4}
                penumbra={light.penumbra || 0.1}
                distance={light.distance || 20}
                decay={light.decay || 2}
                castShadow={light.castShadow}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default Lighting;
