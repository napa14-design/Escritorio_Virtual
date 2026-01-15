// ============================================
// TIPOS BÁSICOS
// ============================================

export type Vec3 = [number, number, number]
export type Vec2 = [number, number]
export type ColorValue = string | number

// ============================================
// CATEGORIAS DE OBJETOS
// ============================================

export enum ObjectCategory {
  FURNITURE = 'furniture',
  ELECTRONICS = 'electronics',
  DECORATION = 'decoration',
  UTILITIES = 'utilities',
  ARCHITECTURE = 'architecture',
  LIGHTING = 'lighting',
}

export enum FurnitureType {
  DESK = 'desk',
  CHAIR = 'chair',
  SOFA = 'sofa',
  TABLE = 'table',
  SHELF = 'shelf',
  CABINET = 'cabinet',
  BED = 'bed',
}

export enum ElectronicsType {
  MONITOR = 'monitor',
  LAPTOP = 'laptop',
  TABLET = 'tablet',
  TV = 'tv',
  PHONE = 'phone',
  PRINTER = 'printer',
}

export enum DecorationType {
  PLANT = 'plant',
  PAINTING = 'painting',
  SCULPTURE = 'sculpture',
  RUG = 'rug',
  LAMP = 'lamp',
  VASE = 'vase',
  BOOK = 'book',
}

export enum UtilitiesType {
  WHITEBOARD = 'whiteboard',
  COFFEE_MAKER = 'coffee_maker',
  WATER_COOLER = 'water_cooler',
  CLOCK = 'clock',
  CALENDAR = 'calendar',
  POST_IT = 'post_it',
}

export enum ArchitectureType {
  WALL = 'wall',
  DOOR = 'door',
  WINDOW = 'window',
  DIVIDER = 'divider',
  COLUMN = 'column',
}

// ============================================
// MATERIAIS E TEXTURAS
// ============================================

export enum MaterialType {
  MATTE = 'matte',
  GLOSSY = 'glossy',
  METALLIC = 'metallic',
  GLASS = 'glass',
  FABRIC = 'fabric',
  WOOD = 'wood',
  PLASTIC = 'plastic',
}

export enum TextureType {
  NONE = 'none',
  WOOD_OAK = 'wood_oak',
  WOOD_WALNUT = 'wood_walnut',
  METAL_BRUSHED = 'metal_brushed',
  METAL_POLISHED = 'metal_polished',
  GLASS_CLEAR = 'glass_clear',
  GLASS_FROSTED = 'glass_frosted',
  FABRIC_COTTON = 'fabric_cotton',
  FABRIC_LEATHER = 'fabric_leather',
  CONCRETE = 'concrete',
  MARBLE = 'marble',
}

export interface MaterialConfig {
  type: MaterialType
  color: ColorValue
  texture?: TextureType
  metalness?: number
  roughness?: number
  emissive?: ColorValue
  emissiveIntensity?: number
  opacity?: number
  transparent?: boolean
}

// ============================================
// OBJETO 3D NO MUNDO
// ============================================

export interface WorldObject {
  id: string
  type: string
  category: ObjectCategory
  position: Vec3
  rotation: Vec3
  scale: Vec3
  material: MaterialConfig
  metadata?: Record<string, any>
  interactive?: boolean
  interactionRadius?: number
  locked?: boolean
  visible?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
}

// ============================================
// OBJETOS INTERATIVOS
// ============================================

export interface InteractiveObject extends WorldObject {
  interactive: true
  state: Record<string, any>
  actions: InteractionAction[]
}

export interface InteractionAction {
  id: string
  label: string
  icon?: string
  requiresProximity?: boolean
  execute: (object: InteractiveObject) => void
}

// ============================================
// ILUMINAÇÃO
// ============================================

export enum LightType {
  AMBIENT = 'ambient',
  DIRECTIONAL = 'directional',
  POINT = 'point',
  SPOT = 'spot',
  HEMISPHERE = 'hemisphere',
}

export interface LightConfig {
  id: string
  type: LightType
  color: ColorValue
  intensity: number
  position?: Vec3
  target?: Vec3
  distance?: number
  decay?: number
  angle?: number
  penumbra?: number
  castShadow?: boolean
}

// ============================================
// AMBIENTE
// ============================================

export enum FloorPattern {
  SOLID = 'solid',
  CHECKERBOARD = 'checkerboard',
  STRIPED = 'striped',
  GRID = 'grid',
}

export interface EnvironmentConfig {
  skyColor: ColorValue
  floorColor: ColorValue
  floorPattern: FloorPattern
  fogEnabled: boolean
  fogColor?: ColorValue
  fogDensity?: number
  fogNear?: number
  fogFar?: number
}

// ============================================
// SISTEMA DE SALAS
// ============================================

export enum RoomType {
  RECEPTION = 'reception',
  OPEN_SPACE = 'open_space',
  MEETING_SMALL = 'meeting_small',
  MEETING_MEDIUM = 'meeting_medium',
  MEETING_LARGE = 'meeting_large',
  LOUNGE = 'lounge',
  CAFETERIA = 'cafeteria',
  OUTDOOR = 'outdoor',
  PRIVATE_OFFICE = 'private_office',
  CORRIDOR = 'corridor',
  CUSTOM = 'custom',
}

export interface Room {
  id: string
  name: string
  type: RoomType
  position: Vec3
  dimensions: Vec3
  objects: string[] // IDs dos objetos
  walls?: WorldObject[]
  floor?: WorldObject
  ceiling?: WorldObject
}

// ============================================
// CÂMERA E CONTROLES
// ============================================

export enum CameraMode {
  FIRST_PERSON = 'first_person',
  THIRD_PERSON = 'third_person',
  AERIAL = 'aerial',
  FREE = 'free',
}

export interface CameraConfig {
  mode: CameraMode
  fov: number
  near: number
  far: number
  position: Vec3
  target: Vec3
}

export interface PlayerState {
  position: Vec3
  rotation: Vec3
  velocity: Vec3
  isMoving: boolean
  isRunning: boolean
  isJumping: boolean
  isSitting: boolean
  height: number
  speed: number
  runSpeedMultiplier: number
  jumpForce: number
}

// ============================================
// MODO EDITOR
// ============================================

export enum EditorMode {
  NAVIGATE = 'navigate',
  BUILD = 'build',
  PHOTO = 'photo',
}

export enum EditorTool {
  SELECT = 'select',
  MOVE = 'move',
  ROTATE = 'rotate',
  SCALE = 'scale',
  PAINT = 'paint',
  DELETE = 'delete',
}

export interface EditorState {
  mode: EditorMode
  tool: EditorTool
  selectedObjects: string[]
  clipboard: WorldObject[]
  history: HistoryEntry[]
  historyIndex: number
  gridSnap: boolean
  gridSize: number
  showGrid: boolean
  showHelpers: boolean
}

export interface HistoryEntry {
  type: 'add' | 'remove' | 'modify' | 'batch'
  timestamp: number
  objects: WorldObject[]
  previousState?: WorldObject[]
}

// ============================================
// MARCADORES E ANOTAÇÕES
// ============================================

export enum MarkerType {
  TASK = 'task',
  MEETING = 'meeting',
  IMPORTANT = 'important',
  NOTE = 'note',
  INFO = 'info',
}

export interface Marker {
  id: string
  type: MarkerType
  position: Vec3
  color: ColorValue
  text: string
  icon?: string
  createdAt: number
}

// ============================================
// LAYOUTS SALVOS
// ============================================

export interface Layout {
  id: string
  name: string
  description?: string
  thumbnail?: string
  objects: WorldObject[]
  rooms: Room[]
  environment: EnvironmentConfig
  lights: LightConfig[]
  markers: Marker[]
  camera?: CameraConfig
  createdAt: number
  updatedAt: number
}

// ============================================
// CONFIGURAÇÕES
// ============================================

export enum GraphicsQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

export interface GraphicsSettings {
  quality: GraphicsQuality
  renderDistance: number
  antialiasing: boolean
  shadows: boolean
  shadowQuality: 'low' | 'medium' | 'high'
  reflections: boolean
  particles: boolean
  postProcessing: boolean
}

export interface UISettings {
  showMinimap: boolean
  showHUD: boolean
  showFPS: boolean
  showCoordinates: boolean
  showTooltips: boolean
  theme: 'light' | 'dark'
  uiScale: number
}

export interface Settings {
  graphics: GraphicsSettings
  ui: UISettings
  controls: {
    mouseSensitivity: number
    invertY: boolean
    smoothCamera: boolean
  }
  audio: {
    master: number
    ambient: number
    effects: number
    ui: number
  }
  autoSave: boolean
  autoSaveInterval: number
}

// ============================================
// ESTADO GLOBAL DA APLICAÇÃO
// ============================================

export interface AppState {
  // Objetos e mundo
  objects: Map<string, WorldObject>
  rooms: Room[]
  environment: EnvironmentConfig
  lights: LightConfig[]
  markers: Marker[]

  // Player e câmera
  player: PlayerState
  camera: CameraConfig

  // Editor
  editor: EditorState

  // Layouts
  currentLayout: Layout | null
  savedLayouts: Layout[]

  // UI
  settings: Settings
  showTutorial: boolean
  showSettings: boolean
  showObjectLibrary: boolean
  showRoomCreator: boolean

  // Performance
  fps: number
  objectCount: number

  // Sistema
  initialized: boolean
  loading: boolean
  error: string | null
}

// ============================================
// BIBLIOTECA DE OBJETOS
// ============================================

export interface ObjectDefinition {
  id: string
  name: string
  category: ObjectCategory
  type: string
  description?: string
  icon?: string
  defaultSize: Vec3
  defaultMaterial: MaterialConfig
  interactive?: boolean
  tags?: string[]
  variations?: ObjectVariation[]
}

export interface ObjectVariation {
  id: string
  name: string
  modifications: Partial<WorldObject>
}

// ============================================
// EVENTOS
// ============================================

export interface GameEvent {
  type: string
  payload?: any
  timestamp: number
}

export enum EventType {
  OBJECT_ADDED = 'object_added',
  OBJECT_REMOVED = 'object_removed',
  OBJECT_MODIFIED = 'object_modified',
  OBJECT_SELECTED = 'object_selected',
  OBJECT_INTERACTED = 'object_interacted',
  CAMERA_MODE_CHANGED = 'camera_mode_changed',
  EDITOR_MODE_CHANGED = 'editor_mode_changed',
  LAYOUT_LOADED = 'layout_loaded',
  LAYOUT_SAVED = 'layout_saved',
}
