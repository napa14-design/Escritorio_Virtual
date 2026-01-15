import React from 'react'
import { useStore } from '@/store'
import { FloorPattern } from '@/types'
import * as THREE from 'three'

/**
 * Componente que renderiza o ambiente (chão, céu, neblina)
 */
export const Environment: React.FC = () => {
  const environment = useStore((state) => state.environment)

  // Criar textura do chão baseado no padrão
  const createFloorMaterial = () => {
    const color = new THREE.Color(environment.floorColor)

    switch (environment.floorPattern) {
      case FloorPattern.CHECKERBOARD:
        // TODO: Implementar textura xadrez
        return (
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        )

      case FloorPattern.STRIPED:
        // TODO: Implementar textura listrada
        return (
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        )

      case FloorPattern.GRID:
        // TODO: Implementar textura grid
        return (
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        )

      case FloorPattern.SOLID:
      default:
        return (
          <meshStandardMaterial
            color={color}
            roughness={0.8}
            metalness={0.1}
          />
        )
    }
  }

  return (
    <>
      {/* Cor de fundo */}
      <color attach="background" args={[environment.skyColor]} />

      {/* Neblina */}
      {environment.fogEnabled && (
        <fog
          attach="fog"
          args={[
            environment.fogColor || '#ffffff',
            environment.fogNear || 10,
            environment.fogFar || 100,
          ]}
        />
      )}

      {/* Chão */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        {createFloorMaterial()}
      </mesh>

      {/* Grid de referência (opcional) */}
      {/* <gridHelper args={[100, 100, '#888888', '#444444']} /> */}
    </>
  )
}
