import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Grid, Environment, OrbitControls, TransformControls } from '@react-three/drei';
import { EffectComposer, SSAO, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import Object3D from '../Objects/Object3D';
import FirstPersonControls from '../Controls/FirstPersonControls';
import Floor from './Floor';
import Lighting from './Lighting';

const MainScene = () => {
  const objects = useStore((state) => state.objects);
  const environment = useStore((state) => state.environment);
  const lights = useStore((state) => state.lights);
  const selectedObject = useStore((state) => state.selectedObject);
  const editMode = useStore((state) => state.editMode);
  const cameraMode = useStore((state) => state.cameraMode);
  const settings = useStore((state) => state.settings);
  const showGrid = useStore((state) => state.showGrid);

  const selectObject = useStore((state) => state.selectObject);
  const hoverObject = useStore((state) => state.hoverObject);
  const updateObject = useStore((state) => state.updateObject);

  // Handle object transformation in edit mode
  const handleTransformChange = () => {
    if (!selectedObject) return;

    const selectedObj = objects.find((obj) => obj.id === selectedObject);
    if (!selectedObj) return;

    // Update will be handled by TransformControls
  };

  return (
    <div
      id="canvas-container"
      style={{
        width: '100%',
        height: '100vh',
        background: environment.skyColor,
      }}
    >
      <Canvas
        shadows={settings.shadowQuality !== 'off'}
        camera={{
          position: [0, 1.6, 5],
          fov: 75,
          near: 0.1,
          far: settings.renderDistance,
        }}
        gl={{
          antialias: settings.antialiasing,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Sky and Environment */}
          {environment.skyColor && (
            <color attach="background" args={[environment.skyColor]} />
          )}

          {environment.fogEnabled && (
            <fog
              attach="fog"
              args={[environment.fogColor, 1, settings.renderDistance * environment.fogDensity]}
            />
          )}

          {/* Lighting */}
          <Lighting lights={lights} environment={environment} />

          {/* Floor */}
          <Floor
            color={environment.floorColor}
            pattern={environment.floorPattern}
            size={100}
          />

          {/* Grid helper in edit mode */}
          {editMode && showGrid && (
            <Grid
              args={[100, 100]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#6e6e6e"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#9d4b4b"
              fadeDistance={50}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid
            />
          )}

          {/* All 3D Objects */}
          {objects.map((object) => (
            <Object3D
              key={object.id}
              object={object}
              onSelect={selectObject}
              onHover={hoverObject}
            />
          ))}

          {/* Transform Controls for selected object in edit mode */}
          {editMode && selectedObject && (
            <TransformControls
              object={
                objects.find((obj) => obj.id === selectedObject)?.ref?.current
              }
              mode="translate"
              onObjectChange={handleTransformChange}
            />
          )}

          {/* Camera Controls */}
          {editMode || cameraMode === 'free' ? (
            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={50}
            />
          ) : (
            <FirstPersonControls />
          )}

          {/* Post-processing effects */}
          {settings.graphicsQuality === 'ultra' && settings.enableReflections && (
            <EffectComposer>
              <SSAO
                intensity={30}
                radius={5}
                luminanceInfluence={0.4}
                color="black"
              />
              {settings.enableParticles && (
                <Bloom
                  intensity={0.5}
                  luminanceThreshold={0.9}
                  luminanceSmoothing={0.9}
                />
              )}
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default MainScene;
