import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Stats } from '@react-three/drei'
import { useStore } from '@/store'
import { PlayerController } from '@/components/Camera/PlayerController'
import { Environment } from './Environment'
import { Lighting } from './Lighting'
import { WorldObjects } from './WorldObjects'
import { CameraMode, EditorMode } from '@/types'

/**
 * Cena principal do escritório virtual 3D
 */
export const MainScene: React.FC = () => {
  const settings = useStore((state) => state.settings)
  const cameraConfig = useStore((state) => state.camera)
  const editorMode = useStore((state) => state.editor.mode)
  const showGrid = useStore((state) => state.editor.showGrid)

  // Configurações de renderização baseadas na qualidade
  const shadowsEnabled = settings.graphics.shadows
  const antialias = settings.graphics.antialiasing

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows={shadowsEnabled}
        camera={{
          fov: cameraConfig.fov,
          near: cameraConfig.near,
          far: cameraConfig.far,
          position: cameraConfig.position,
        }}
        gl={{
          antialias,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Ambiente */}
          <Environment />

          {/* Iluminação */}
          <Lighting />

          {/* Objetos do mundo */}
          <WorldObjects />

          {/* Grid de editor */}
          {showGrid && editorMode === EditorMode.BUILD && (
            <Grid
              args={[100, 100]}
              cellSize={1}
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

          {/* Controles de câmera */}
          {cameraConfig.mode === CameraMode.FIRST_PERSON && (
            <PlayerController />
          )}

          {(cameraConfig.mode === CameraMode.FREE ||
            cameraConfig.mode === CameraMode.AERIAL ||
            editorMode === EditorMode.BUILD) && (
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={2}
              maxDistance={100}
              maxPolarAngle={Math.PI / 2}
            />
          )}

          {/* FPS Counter */}
          {settings.ui.showFPS && <Stats />}
        </Suspense>
      </Canvas>
    </div>
  )
}
