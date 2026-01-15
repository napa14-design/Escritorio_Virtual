import React, { useState } from 'react'
import { useStore } from '@/store'
import { Object3D } from '@/components/Objects/Object3D'

/**
 * Renderiza todos os objetos do mundo
 */
export const WorldObjects: React.FC = () => {
  const objects = useStore((state) => state.objects)
  const selectedObjects = useStore((state) => state.editor.selectedObjects)
  const selectObject = useStore((state) => state.selectObject)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <>
      {Array.from(objects.values()).map((object) => (
        <Object3D
          key={object.id}
          object={object}
          isSelected={selectedObjects.includes(object.id)}
          isHovered={hoveredId === object.id}
          onSelect={() => selectObject(object.id)}
          onHover={(hovered) => setHoveredId(hovered ? object.id : null)}
        />
      ))}
    </>
  )
}
