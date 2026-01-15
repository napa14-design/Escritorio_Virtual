import { Vec3 } from '@/types'
import * as THREE from 'three'

// ============================================
// GERAÇÃO DE IDS
// ============================================

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// CONVERSÕES
// ============================================

export const vec3ToThree = (vec: Vec3): THREE.Vector3 => {
  return new THREE.Vector3(vec[0], vec[1], vec[2])
}

export const threeToVec3 = (vec: THREE.Vector3): Vec3 => {
  return [vec.x, vec.y, vec.z]
}

export const colorToHex = (color: string | number): string => {
  if (typeof color === 'number') {
    return `#${color.toString(16).padStart(6, '0')}`
  }
  return color
}

export const hexToNumber = (hex: string): number => {
  return parseInt(hex.replace('#', ''), 16)
}

// ============================================
// MATEMÁTICA
// ============================================

export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

export const distance = (a: Vec3, b: Vec3): number => {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dz = b[2] - a[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const snapVec3ToGrid = (vec: Vec3, gridSize: number): Vec3 => {
  return [
    snapToGrid(vec[0], gridSize),
    snapToGrid(vec[1], gridSize),
    snapToGrid(vec[2], gridSize),
  ]
}

// ============================================
// COLISÕES
// ============================================

export const checkAABBCollision = (
  posA: Vec3,
  sizeA: Vec3,
  posB: Vec3,
  sizeB: Vec3
): boolean => {
  return (
    Math.abs(posA[0] - posB[0]) < (sizeA[0] + sizeB[0]) / 2 &&
    Math.abs(posA[1] - posB[1]) < (sizeA[1] + sizeB[1]) / 2 &&
    Math.abs(posA[2] - posB[2]) < (sizeA[2] + sizeB[2]) / 2
  )
}

export const checkSphereCollision = (
  posA: Vec3,
  radiusA: number,
  posB: Vec3,
  radiusB: number
): boolean => {
  return distance(posA, posB) < radiusA + radiusB
}

// ============================================
// FORMATAÇÃO
// ============================================

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals)
}

export const formatVec3 = (vec: Vec3, decimals: number = 2): string => {
  return `(${formatNumber(vec[0], decimals)}, ${formatNumber(
    vec[1],
    decimals
  )}, ${formatNumber(vec[2], decimals)})`
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// ============================================
// TEMPO
// ============================================

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('pt-BR')
}

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// ============================================
// STRINGS
// ============================================

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================
// ARRAYS
// ============================================

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set()
  return array.filter((item) => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

// ============================================
// DEBOUNCE E THROTTLE
// ============================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait) as unknown as number
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================
// LOCAL STORAGE
// ============================================

export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return defaultValue
  }
}

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error)
  }
}

// ============================================
// DOWNLOAD
// ============================================

export const downloadJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// ============================================
// RAYCASTING
// ============================================

export const raycastFromCamera = (
  camera: THREE.Camera,
  mouse: { x: number; y: number },
  objects: THREE.Object3D[]
): THREE.Intersection[] => {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera)
  return raycaster.intersectObjects(objects, true)
}

// ============================================
// RANDOM
// ============================================

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomBetween(min, max + 1))
}

export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const randomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

// ============================================
// PERFORMANCE
// ============================================

export class FPSCounter {
  private frames: number = 0
  private lastTime: number = performance.now()
  private fps: number = 60

  update(): number {
    this.frames++
    const currentTime = performance.now()
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime))
      this.frames = 0
      this.lastTime = currentTime
    }
    return this.fps
  }

  getFPS(): number {
    return this.fps
  }
}

// ============================================
// VALIDAÇÃO
// ============================================

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export const isValidColor = (color: string): boolean => {
  const s = new Option().style
  s.color = color
  return s.color !== ''
}

// ============================================
// EVENTOS CUSTOMIZADOS
// ============================================

export class EventEmitter {
  private events: Map<string, Function[]> = new Map()

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args))
    }
  }

  clear(): void {
    this.events.clear()
  }
}
