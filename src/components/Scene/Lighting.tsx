import React from 'react'
import { useStore } from '@/store'
import { LightConfig } from '@/types'
import * as THREE from 'three'

/**
 * Componente que renderiza todas as luzes da cena
 */
export const Lighting: React.FC = () => {
  const lights = useStore((state) => state.lights)
  const settings = useStore((state) => state.settings)

  return (
    <>
      {lights.map((light) => (
        <LightComponent key={light.id} light={light} castShadow={settings.graphics.shadows} />
      ))}
    </>
  )
}

interface LightComponentProps {
  light: LightConfig
  castShadow: boolean
}

const LightComponent: React.FC<LightComponentProps> = ({ light, castShadow }) => {
  const color = new THREE.Color(light.color)

  switch (light.type) {
    case 'ambient':
      return <ambientLight color={color} intensity={light.intensity} />

    case 'directional':
      return (
        <directionalLight
          color={color}
          intensity={light.intensity}
          position={light.position || [0, 10, 0]}
          castShadow={castShadow && light.castShadow}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
      )

    case 'point':
      return (
        <pointLight
          color={color}
          intensity={light.intensity}
          position={light.position || [0, 5, 0]}
          distance={light.distance || 10}
          decay={light.decay || 2}
          castShadow={castShadow && light.castShadow}
        />
      )

    case 'spot':
      return (
        <spotLight
          color={color}
          intensity={light.intensity}
          position={light.position || [0, 10, 0]}
          angle={light.angle || Math.PI / 6}
          penumbra={light.penumbra || 0.2}
          distance={light.distance || 20}
          decay={light.decay || 2}
          castShadow={castShadow && light.castShadow}
        />
      )

    case 'hemisphere':
      return (
        <hemisphereLight
          color={color}
          groundColor="#444444"
          intensity={light.intensity}
          position={light.position || [0, 20, 0]}
        />
      )

    default:
      return null
  }
}
