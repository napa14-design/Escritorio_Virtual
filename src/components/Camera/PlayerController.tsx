import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store'
import { CameraMode } from '@/types'

/**
 * Controlador de câmera e movimento do player
 * Suporta WASD, corrida, pulo e múltiplos modos de câmera
 */
export const PlayerController = () => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>()

  const player = useStore((state) => state.player)
  const cameraConfig = useStore((state) => state.camera)
  const updatePlayer = useStore((state) => state.updatePlayer)
  const settings = useStore((state) => state.settings)
  const editorMode = useStore((state) => state.editor.mode)

  // Estados de movimento
  const [moveForward, setMoveForward] = useState(false)
  const [moveBackward, setMoveBackward] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [canJump, setCanJump] = useState(true)

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  // Configuração de controles de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(true)
          break
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(true)
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(true)
          break
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(true)
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          setIsRunning(true)
          break
        case 'Space':
          if (canJump) {
            velocity.current.y = player.jumpForce
            setCanJump(false)
            updatePlayer({ isJumping: true })
          }
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(false)
          break
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(false)
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(false)
          break
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(false)
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          setIsRunning(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [canJump, player.jumpForce, updatePlayer])

  // Loop de física e movimento
  useFrame((_state, delta) => {
    if (editorMode === 'photo' || player.isSitting) return

    const speedMultiplier = isRunning ? player.runSpeedMultiplier : 1
    const speed = player.speed * speedMultiplier * delta

    // Calcular direção de movimento
    direction.current.set(0, 0, 0)

    if (moveForward) direction.current.z -= 1
    if (moveBackward) direction.current.z += 1
    if (moveLeft) direction.current.x -= 1
    if (moveRight) direction.current.x += 1

    direction.current.normalize()

    // Aplicar movimento relativo à câmera (modo primeira pessoa)
    if (cameraConfig.mode === CameraMode.FIRST_PERSON) {
      const forward = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .setY(0)
        .normalize()

      const right = new THREE.Vector3(1, 0, 0)
        .applyQuaternion(camera.quaternion)
        .setY(0)
        .normalize()

      velocity.current.x = (
        direction.current.z * forward.x +
        direction.current.x * right.x
      ) * speed

      velocity.current.z = (
        direction.current.z * forward.z +
        direction.current.x * right.z
      ) * speed
    }

    // Física de gravidade
    const gravity = -25 * delta
    velocity.current.y += gravity

    // Atualizar posição
    const newPosition = new THREE.Vector3(
      camera.position.x + velocity.current.x,
      camera.position.y + velocity.current.y,
      camera.position.z + velocity.current.z
    )

    // Colisão com o chão
    if (newPosition.y <= player.height) {
      newPosition.y = player.height
      velocity.current.y = 0
      setCanJump(true)
      updatePlayer({ isJumping: false })
    }

    // Limites do mundo
    const worldLimit = 50
    newPosition.x = THREE.MathUtils.clamp(newPosition.x, -worldLimit, worldLimit)
    newPosition.z = THREE.MathUtils.clamp(newPosition.z, -worldLimit, worldLimit)

    camera.position.copy(newPosition)

    // Atualizar estado do player
    const isMoving = moveForward || moveBackward || moveLeft || moveRight
    updatePlayer({
      position: [newPosition.x, newPosition.y, newPosition.z],
      velocity: [velocity.current.x, velocity.current.y, velocity.current.z],
      isMoving,
      isRunning: isMoving && isRunning,
    })

    // Câmera terceira pessoa
    if (cameraConfig.mode === CameraMode.THIRD_PERSON) {
      const offset = new THREE.Vector3(0, 2, 5)
      offset.applyQuaternion(camera.quaternion)
      camera.position.add(offset)
    }
  })

  // Renderizar controles apropriados para o modo
  if (cameraConfig.mode === CameraMode.FIRST_PERSON && editorMode === 'navigate') {
    return (
      <PointerLockControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        pointerSpeed={settings.controls.mouseSensitivity}
      />
    )
  }

  return null
}
