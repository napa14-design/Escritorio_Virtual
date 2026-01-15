import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

// Component to render individual 3D objects
const Object3D = ({ object, onSelect, onHover }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lightOn, setLightOn] = useState(true);

  const selectedObject = useStore((state) => state.selectedObject);
  const hoveredObject = useStore((state) => state.hoveredObject);
  const editMode = useStore((state) => state.editMode);
  const showTooltips = useStore((state) => state.showTooltips);

  const isSelected = selectedObject === object.id;
  const isHoveredGlobal = hoveredObject === object.id;

  // Animation logic
  useFrame((state) => {
    if (!groupRef.current) return;

    // Rotate fan
    if (object.animated && object.animationType === 'rotate') {
      groupRef.current.rotation.y += 0.05;
    }

    // Pulse animation for growing plants
    if (object.animated && object.animationType === 'grow') {
      const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
      groupRef.current.scale.set(scale, scale, scale);
    }

    // Highlight selected/hovered objects
    if (isSelected || isHoveredGlobal) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      if (meshRef.current && meshRef.current.material) {
        meshRef.current.material.emissiveIntensity = pulse * 0.3;
      }
    }
  });

  // Handle interaction
  const handleClick = (e) => {
    e.stopPropagation();

    if (editMode) {
      onSelect(object.id);
      return;
    }

    // Handle object-specific interactions
    if (object.interactive) {
      switch (object.action) {
        case 'open':
          setIsOpen(!isOpen);
          break;
        case 'toggle-light':
          setLightOn(!lightOn);
          break;
        case 'sit':
          useStore.getState().setSitting(true);
          break;
        default:
          onSelect(object.id);
      }
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    onHover(object.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setIsHovered(false);
    onHover(null);
    document.body.style.cursor = 'auto';
  };

  // Render geometry based on object definition
  const renderGeometry = (geometryDef, index = 0) => {
    const color = object.color || object.defaultColor || '#ffffff';
    const material = {
      color,
      emissive: isSelected || isHoveredGlobal ? color : '#000000',
      emissiveIntensity: isSelected || isHoveredGlobal ? 0.2 : 0,
      metalness: object.material === 'metallic' ? 0.8 : 0.1,
      roughness: object.material === 'shiny' ? 0.2 : 0.8,
      transparent: object.material === 'transparent',
      opacity: object.material === 'transparent' ? 0.5 : 1,
    };

    if (geometryDef.type === 'box') {
      return (
        <mesh
          key={index}
          ref={index === 0 ? meshRef : null}
          position={geometryDef.position || [0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={geometryDef.args} />
          <meshStandardMaterial {...material} />
        </mesh>
      );
    }

    if (geometryDef.type === 'sphere') {
      return (
        <mesh
          key={index}
          ref={index === 0 ? meshRef : null}
          position={geometryDef.position || [0, 0, 0]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={geometryDef.args} />
          <meshStandardMaterial {...material} />
        </mesh>
      );
    }

    if (geometryDef.type === 'cylinder') {
      return (
        <mesh
          key={index}
          ref={index === 0 ? meshRef : null}
          position={geometryDef.position || [0, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={geometryDef.args} />
          <meshStandardMaterial {...material} />
        </mesh>
      );
    }

    if (geometryDef.type === 'cone') {
      return (
        <mesh
          key={index}
          ref={index === 0 ? meshRef : null}
          position={geometryDef.position || [0, 0, 0]}
          castShadow
          receiveShadow
        >
          <coneGeometry args={geometryDef.args} />
          <meshStandardMaterial {...material} />
        </mesh>
      );
    }

    if (geometryDef.type === 'composite') {
      return geometryDef.parts.map((part, idx) => renderGeometry(part, idx));
    }

    return null;
  };

  const position = object.position || [0, 0, 0];
  const rotation = object.rotation || [0, 0, 0];
  const scale = object.scale || [1, 1, 1];

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {renderGeometry(object.geometry)}

      {/* Light emission for lamp objects */}
      {object.emitsLight && lightOn && (
        <pointLight
          position={[0, 0.5, 0]}
          intensity={1}
          distance={5}
          color={object.color || '#ffffff'}
          castShadow
        />
      )}

      {/* Tooltip */}
      {showTooltips && (isHovered || isHoveredGlobal) && (
        <Html
          position={[0, 1, 0]}
          center
          distanceFactor={10}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold' }}>{object.name || object.type}</div>
            {object.interactive && object.action && (
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Click to {object.action.replace('-', ' ')}
              </div>
            )}
            {editMode && (
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Click to select • Drag to move
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Selection outline */}
      {isSelected && editMode && (
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshBasicMaterial
            color="#00ff00"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

export default Object3D;
