import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../../store/useStore';

const FirstPersonControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  const settings = useStore((state) => state.settings);
  const editMode = useStore((state) => state.editMode);
  const isSitting = useStore((state) => state.isSitting);
  const updatePlayerPosition = useStore((state) => state.updatePlayerPosition);

  // Movement state
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isJumping = useRef(false);
  const canJump = useRef(true);

  // Physics constants
  const GRAVITY = -25;
  const JUMP_VELOCITY = 8;
  const GROUND_HEIGHT = 1.6;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (editMode || isSitting) return;

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        case 'Space':
          if (canJump.current && !isJumping.current) {
            velocity.current.y = JUMP_VELOCITY;
            isJumping.current = true;
            canJump.current = false;
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [editMode, isSitting]);

  useFrame((state, delta) => {
    if (editMode || isSitting || !controlsRef.current) return;

    const speed = settings.movementSpeed * (moveState.current.run ? settings.runMultiplier : 1);

    // Calculate movement direction
    direction.current.set(0, 0, 0);

    if (moveState.current.forward) direction.current.z -= 1;
    if (moveState.current.backward) direction.current.z += 1;
    if (moveState.current.left) direction.current.x -= 1;
    if (moveState.current.right) direction.current.x += 1;

    direction.current.normalize();

    // Apply movement
    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z = direction.current.z * speed;
    } else {
      velocity.current.z = 0;
    }

    if (moveState.current.left || moveState.current.right) {
      velocity.current.x = direction.current.x * speed;
    } else {
      velocity.current.x = 0;
    }

    // Apply gravity
    velocity.current.y += GRAVITY * delta;

    // Get camera direction for movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, camera.up);

    // Apply velocity to camera position
    const movement = new THREE.Vector3();
    movement.addScaledVector(cameraDirection, -velocity.current.z * delta);
    movement.addScaledVector(cameraRight, velocity.current.x * delta);
    movement.y = velocity.current.y * delta;

    camera.position.add(movement);

    // Ground collision
    if (camera.position.y <= GROUND_HEIGHT) {
      camera.position.y = GROUND_HEIGHT;
      velocity.current.y = 0;
      isJumping.current = false;
      canJump.current = true;
    }

    // Update store with new position
    updatePlayerPosition([camera.position.x, camera.position.y, camera.position.z]);
  });

  // Don't show controls in edit mode
  if (editMode) return null;

  return (
    <PointerLockControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      makeDefault
      selector="#canvas-container"
    />
  );
};

export default FirstPersonControls;
