import React, { useMemo } from 'react';
import * as THREE from 'three';

const Floor = ({ color, pattern, size = 100 }) => {
  // Generate floor texture based on pattern
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    switch (pattern) {
      case 'checkered': {
        const squareSize = 64;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? color : '#ffffff';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
          }
        }
        break;
      }

      case 'striped': {
        const stripeWidth = 64;
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = i % 2 === 0 ? color : '#ffffff';
          ctx.fillRect(0, i * stripeWidth, 512, stripeWidth);
        }
        break;
      }

      case 'solid':
      default:
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 512, 512);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(size / 4, size / 4);

    return texture;
  }, [color, pattern, size]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        map={floorTexture}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Floor;
