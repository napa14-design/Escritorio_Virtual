import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { WorldObject, MaterialType } from '@/types'
import * as THREE from 'three'
import { useStore } from '@/store'

interface Object3DProps {
  object: WorldObject
  isSelected?: boolean
  isHovered?: boolean
  onSelect?: () => void
  onHover?: (hovered: boolean) => void
}

/**
 * Componente que renderiza um objeto 3D no mundo
 * Suporta múltiplos tipos de materiais e interatividade
 */
export const Object3D: React.FC<Object3DProps> = ({
  object,
  isSelected = false,
  isHovered = false,
  onSelect,
  onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [animationTime, setAnimationTime] = useState(0)
  const editorMode = useStore((state) => state.editor.mode)

  // Animação suave para objetos selecionados
  useFrame((_state, delta) => {
    if (isSelected && meshRef.current) {
      setAnimationTime((t) => t + delta)
      meshRef.current.position.y =
        object.position[1] + Math.sin(animationTime * 2) * 0.05
    } else if (meshRef.current) {
      meshRef.current.position.y = object.position[1]
    }
  })

  // Criar material baseado na configuração
  const createMaterial = () => {
    const { material } = object
    const color = new THREE.Color(material.color)

    switch (material.type) {
      case MaterialType.METALLIC:
        return (
          <meshStandardMaterial
            color={color}
            metalness={material.metalness ?? 0.9}
            roughness={material.roughness ?? 0.1}
            emissive={material.emissive ? new THREE.Color(material.emissive) : undefined}
            emissiveIntensity={material.emissiveIntensity}
          />
        )

      case MaterialType.GLASS:
        return (
          <meshPhysicalMaterial
            color={color}
            metalness={0}
            roughness={material.roughness ?? 0.1}
            transmission={0.9}
            thickness={0.5}
            opacity={material.opacity ?? 0.3}
            transparent={material.transparent ?? true}
          />
        )

      case MaterialType.GLOSSY:
        return (
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={material.roughness ?? 0.2}
            emissive={material.emissive ? new THREE.Color(material.emissive) : undefined}
            emissiveIntensity={material.emissiveIntensity}
          />
        )

      case MaterialType.FABRIC:
        return (
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={material.roughness ?? 0.9}
          />
        )

      case MaterialType.WOOD:
        return (
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={material.roughness ?? 0.7}
          />
        )

      case MaterialType.PLASTIC:
        return (
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={material.roughness ?? 0.5}
          />
        )

      case MaterialType.MATTE:
      default:
        return (
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={material.roughness ?? 0.95}
          />
        )
    }
  }

  // Cor de destaque para seleção/hover
  const outlineColor = isSelected
    ? '#00ff00'
    : isHovered
    ? '#ffff00'
    : undefined

  return (
    <group
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      visible={object.visible !== false}
    >
      <mesh
        ref={meshRef}
        castShadow={object.castShadow !== false}
        receiveShadow={object.receiveShadow !== false}
        onClick={(e) => {
          if (editorMode === 'build') {
            e.stopPropagation()
            onSelect?.()
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover?.(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHover?.(false)
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        {createMaterial()}
      </mesh>

      {/* Outline para objetos selecionados/hover */}
      {outlineColor && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={outlineColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Helper para modo editor - comentado temporariamente */}
      {/* {isSelected && editorMode === 'build' && (
        <boxHelper />
      )} */}
    </group>
  )
}
