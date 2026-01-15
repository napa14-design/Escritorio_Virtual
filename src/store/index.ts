import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import {
  AppState,
  WorldObject,
  Room,
  Layout,
  Marker,
  LightConfig,
  EnvironmentConfig,
  EditorMode,
  EditorTool,
  CameraMode,
  GraphicsQuality,
  FloorPattern,
  Vec3,
} from '@/types'
import { generateId } from '@/utils/helpers'

// ============================================
// ESTADO INICIAL
// ============================================

const defaultEnvironment: EnvironmentConfig = {
  skyColor: '#87ceeb',
  floorColor: '#cccccc',
  floorPattern: FloorPattern.SOLID,
  fogEnabled: false,
  fogColor: '#ffffff',
  fogDensity: 0.01,
  fogNear: 10,
  fogFar: 100,
}

const defaultLights: LightConfig[] = [
  {
    id: 'ambient-main',
    type: 'ambient' as any,
    color: '#ffffff',
    intensity: 0.5,
  },
  {
    id: 'directional-main',
    type: 'directional' as any,
    color: '#ffffff',
    intensity: 1,
    position: [10, 20, 10],
    target: [0, 0, 0],
    castShadow: true,
  },
]

// ============================================
// STORE PRINCIPAL
// ============================================

interface StoreActions {
  // Objetos
  addObject: (object: WorldObject) => void
  removeObject: (id: string) => void
  updateObject: (id: string, updates: Partial<WorldObject>) => void
  duplicateObject: (id: string) => void
  clearObjects: () => void

  // Seleção
  selectObject: (id: string, addToSelection?: boolean) => void
  deselectObject: (id: string) => void
  clearSelection: () => void
  selectAll: () => void

  // Editor
  setEditorMode: (mode: EditorMode) => void
  setEditorTool: (tool: EditorTool) => void
  toggleGrid: () => void
  toggleHelpers: () => void
  setGridSize: (size: number) => void
  toggleGridSnap: () => void

  // Histórico (Undo/Redo)
  undo: () => void
  redo: () => void
  addToHistory: (entry: any) => void

  // Clipboard
  copy: () => void
  paste: () => void
  cut: () => void

  // Câmera
  setCameraMode: (mode: CameraMode) => void
  updateCamera: (updates: Partial<AppState['camera']>) => void

  // Player
  updatePlayer: (updates: Partial<AppState['player']>) => void
  teleportPlayer: (position: Vec3) => void

  // Ambiente
  updateEnvironment: (updates: Partial<EnvironmentConfig>) => void

  // Iluminação
  addLight: (light: LightConfig) => void
  removeLight: (id: string) => void
  updateLight: (id: string, updates: Partial<LightConfig>) => void

  // Salas
  addRoom: (room: Room) => void
  removeRoom: (id: string) => void
  updateRoom: (id: string, updates: Partial<Room>) => void

  // Marcadores
  addMarker: (marker: Marker) => void
  removeMarker: (id: string) => void
  updateMarker: (id: string, updates: Partial<Marker>) => void

  // Layouts
  saveLayout: (name: string, description?: string) => void
  loadLayout: (id: string) => void
  deleteLayout: (id: string) => void
  exportLayout: () => string
  importLayout: (json: string) => void

  // Settings
  updateSettings: (updates: any) => void
  setGraphicsQuality: (quality: GraphicsQuality) => void
  toggleTheme: () => void

  // UI
  toggleObjectLibrary: () => void
  toggleSettings: () => void
  toggleRoomCreator: () => void
  toggleTutorial: () => void

  // Sistema
  setFPS: (fps: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useStore = create<AppState & StoreActions>()(
  persist(
    immer((set, get) => ({
      // ============================================
      // ESTADO INICIAL
      // ============================================
      objects: new Map(),
      rooms: [],
      environment: defaultEnvironment,
      lights: defaultLights,
      markers: [],

      player: {
        position: [0, 1.7, 5],
        rotation: [0, 0, 0],
        velocity: [0, 0, 0],
        isMoving: false,
        isRunning: false,
        isJumping: false,
        isSitting: false,
        height: 1.7,
        speed: 5,
        runSpeedMultiplier: 2,
        jumpForce: 8,
      },

      camera: {
        mode: CameraMode.FIRST_PERSON,
        fov: 75,
        near: 0.1,
        far: 1000,
        position: [0, 1.7, 5],
        target: [0, 1.7, 0],
      },

      editor: {
        mode: EditorMode.NAVIGATE,
        tool: EditorTool.SELECT,
        selectedObjects: [],
        clipboard: [],
        history: [],
        historyIndex: -1,
        gridSnap: false,
        gridSize: 1,
        showGrid: true,
        showHelpers: false,
      },

      currentLayout: null,
      savedLayouts: [],

      settings: {
        graphics: {
          quality: GraphicsQuality.HIGH,
          renderDistance: 100,
          antialiasing: true,
          shadows: true,
          shadowQuality: 'medium',
          reflections: true,
          particles: true,
          postProcessing: true,
        },
        ui: {
          showMinimap: true,
          showHUD: true,
          showFPS: true,
          showCoordinates: true,
          showTooltips: true,
          theme: 'dark',
          uiScale: 1,
        },
        controls: {
          mouseSensitivity: 0.002,
          invertY: false,
          smoothCamera: true,
        },
        audio: {
          master: 0.7,
          ambient: 0.5,
          effects: 0.8,
          ui: 0.6,
        },
        autoSave: true,
        autoSaveInterval: 30000,
      },

      showTutorial: false,
      showSettings: false,
      showObjectLibrary: false,
      showRoomCreator: false,

      fps: 60,
      objectCount: 0,
      initialized: false,
      loading: false,
      error: null,

      // ============================================
      // AÇÕES - OBJETOS
      // ============================================

      addObject: (object) =>
        set((state) => {
          state.objects.set(object.id, object)
          state.objectCount = state.objects.size
        }),

      removeObject: (id) =>
        set((state) => {
          state.objects.delete(id)
          state.editor.selectedObjects = state.editor.selectedObjects.filter(
            (objId) => objId !== id
          )
          state.objectCount = state.objects.size
        }),

      updateObject: (id, updates) =>
        set((state) => {
          const obj = state.objects.get(id)
          if (obj) {
            state.objects.set(id, { ...obj, ...updates })
          }
        }),

      duplicateObject: (id) =>
        set((state) => {
          const obj = state.objects.get(id)
          if (obj) {
            const newObj = {
              ...obj,
              id: generateId(),
              position: [
                obj.position[0] + 1,
                obj.position[1],
                obj.position[2] + 1,
              ] as Vec3,
            }
            state.objects.set(newObj.id, newObj)
            state.objectCount = state.objects.size
          }
        }),

      clearObjects: () =>
        set((state) => {
          state.objects.clear()
          state.editor.selectedObjects = []
          state.objectCount = 0
        }),

      // ============================================
      // AÇÕES - SELEÇÃO
      // ============================================

      selectObject: (id, addToSelection = false) =>
        set((state) => {
          if (addToSelection) {
            if (!state.editor.selectedObjects.includes(id)) {
              state.editor.selectedObjects.push(id)
            }
          } else {
            state.editor.selectedObjects = [id]
          }
        }),

      deselectObject: (id) =>
        set((state) => {
          state.editor.selectedObjects = state.editor.selectedObjects.filter(
            (objId) => objId !== id
          )
        }),

      clearSelection: () =>
        set((state) => {
          state.editor.selectedObjects = []
        }),

      selectAll: () =>
        set((state) => {
          state.editor.selectedObjects = Array.from(state.objects.keys())
        }),

      // ============================================
      // AÇÕES - EDITOR
      // ============================================

      setEditorMode: (mode) =>
        set((state) => {
          state.editor.mode = mode
          if (mode !== EditorMode.BUILD) {
            state.editor.selectedObjects = []
          }
        }),

      setEditorTool: (tool) =>
        set((state) => {
          state.editor.tool = tool
        }),

      toggleGrid: () =>
        set((state) => {
          state.editor.showGrid = !state.editor.showGrid
        }),

      toggleHelpers: () =>
        set((state) => {
          state.editor.showHelpers = !state.editor.showHelpers
        }),

      setGridSize: (size) =>
        set((state) => {
          state.editor.gridSize = size
        }),

      toggleGridSnap: () =>
        set((state) => {
          state.editor.gridSnap = !state.editor.gridSnap
        }),

      // ============================================
      // AÇÕES - HISTÓRICO
      // ============================================

      addToHistory: (entry) =>
        set((state) => {
          // Remove entradas futuras se estamos no meio do histórico
          if (state.editor.historyIndex < state.editor.history.length - 1) {
            state.editor.history = state.editor.history.slice(
              0,
              state.editor.historyIndex + 1
            )
          }
          state.editor.history.push(entry)
          state.editor.historyIndex = state.editor.history.length - 1

          // Limita o histórico a 50 entradas
          if (state.editor.history.length > 50) {
            state.editor.history.shift()
            state.editor.historyIndex--
          }
        }),

      undo: () =>
        set((state) => {
          if (state.editor.historyIndex >= 0) {
            // const entry = state.editor.history[state.editor.historyIndex]
            // TODO: Implementar lógica de undo baseada no tipo de entry
            state.editor.historyIndex--
          }
        }),

      redo: () =>
        set((state) => {
          if (state.editor.historyIndex < state.editor.history.length - 1) {
            state.editor.historyIndex++
            // const entry = state.editor.history[state.editor.historyIndex]
            // TODO: Implementar lógica de redo baseada no tipo de entry
          }
        }),

      // ============================================
      // AÇÕES - CLIPBOARD
      // ============================================

      copy: () =>
        set((state) => {
          const selected = state.editor.selectedObjects
            .map((id) => state.objects.get(id))
            .filter(Boolean) as WorldObject[]
          state.editor.clipboard = selected
        }),

      paste: () =>
        set((state) => {
          state.editor.clipboard.forEach((obj) => {
            const newObj = {
              ...obj,
              id: generateId(),
              position: [
                obj.position[0] + 2,
                obj.position[1],
                obj.position[2],
              ] as Vec3,
            }
            state.objects.set(newObj.id, newObj)
          })
          state.objectCount = state.objects.size
        }),

      cut: () =>
        set((state) => {
          const selected = state.editor.selectedObjects
            .map((id) => state.objects.get(id))
            .filter(Boolean) as WorldObject[]
          state.editor.clipboard = selected
          selected.forEach((obj) => {
            state.objects.delete(obj.id)
          })
          state.editor.selectedObjects = []
          state.objectCount = state.objects.size
        }),

      // ============================================
      // AÇÕES - CÂMERA
      // ============================================

      setCameraMode: (mode) =>
        set((state) => {
          state.camera.mode = mode
        }),

      updateCamera: (updates) =>
        set((state) => {
          Object.assign(state.camera, updates)
        }),

      // ============================================
      // AÇÕES - PLAYER
      // ============================================

      updatePlayer: (updates) =>
        set((state) => {
          Object.assign(state.player, updates)
        }),

      teleportPlayer: (position) =>
        set((state) => {
          state.player.position = position
          state.player.velocity = [0, 0, 0]
        }),

      // ============================================
      // AÇÕES - AMBIENTE
      // ============================================

      updateEnvironment: (updates) =>
        set((state) => {
          Object.assign(state.environment, updates)
        }),

      // ============================================
      // AÇÕES - ILUMINAÇÃO
      // ============================================

      addLight: (light) =>
        set((state) => {
          state.lights.push(light)
        }),

      removeLight: (id) =>
        set((state) => {
          state.lights = state.lights.filter((light) => light.id !== id)
        }),

      updateLight: (id, updates) =>
        set((state) => {
          const index = state.lights.findIndex((light) => light.id === id)
          if (index !== -1) {
            state.lights[index] = { ...state.lights[index], ...updates }
          }
        }),

      // ============================================
      // AÇÕES - SALAS
      // ============================================

      addRoom: (room) =>
        set((state) => {
          state.rooms.push(room)
        }),

      removeRoom: (id) =>
        set((state) => {
          state.rooms = state.rooms.filter((room) => room.id !== id)
        }),

      updateRoom: (id, updates) =>
        set((state) => {
          const index = state.rooms.findIndex((room) => room.id === id)
          if (index !== -1) {
            state.rooms[index] = { ...state.rooms[index], ...updates }
          }
        }),

      // ============================================
      // AÇÕES - MARCADORES
      // ============================================

      addMarker: (marker) =>
        set((state) => {
          state.markers.push(marker)
        }),

      removeMarker: (id) =>
        set((state) => {
          state.markers = state.markers.filter((marker) => marker.id !== id)
        }),

      updateMarker: (id, updates) =>
        set((state) => {
          const index = state.markers.findIndex((marker) => marker.id === id)
          if (index !== -1) {
            state.markers[index] = { ...state.markers[index], ...updates }
          }
        }),

      // ============================================
      // AÇÕES - LAYOUTS
      // ============================================

      saveLayout: (name, description) =>
        set((state) => {
          const layout: Layout = {
            id: generateId(),
            name,
            description,
            objects: Array.from(state.objects.values()),
            rooms: state.rooms,
            environment: state.environment,
            lights: state.lights,
            markers: state.markers,
            camera: state.camera,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          state.savedLayouts.push(layout)
          state.currentLayout = layout
        }),

      loadLayout: (id) =>
        set((state) => {
          const layout = state.savedLayouts.find((l) => l.id === id)
          if (layout) {
            state.objects.clear()
            layout.objects.forEach((obj) => {
              state.objects.set(obj.id, obj)
            })
            state.rooms = layout.rooms
            state.environment = layout.environment
            state.lights = layout.lights
            state.markers = layout.markers
            if (layout.camera) {
              state.camera = layout.camera
            }
            state.currentLayout = layout
            state.objectCount = state.objects.size
          }
        }),

      deleteLayout: (id) =>
        set((state) => {
          state.savedLayouts = state.savedLayouts.filter((l) => l.id !== id)
          if (state.currentLayout?.id === id) {
            state.currentLayout = null
          }
        }),

      exportLayout: () => {
        const state = get()
        const layout: Layout = {
          id: generateId(),
          name: 'Exported Layout',
          objects: Array.from(state.objects.values()),
          rooms: state.rooms,
          environment: state.environment,
          lights: state.lights,
          markers: state.markers,
          camera: state.camera,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        return JSON.stringify(layout, null, 2)
      },

      importLayout: (json) =>
        set((state) => {
          try {
            const layout: Layout = JSON.parse(json)
            layout.id = generateId()
            layout.createdAt = Date.now()
            layout.updatedAt = Date.now()
            state.savedLayouts.push(layout)
          } catch (error) {
            state.error = 'Erro ao importar layout: JSON inválido'
          }
        }),

      // ============================================
      // AÇÕES - CONFIGURAÇÕES
      // ============================================

      updateSettings: (updates) =>
        set((state) => {
          Object.assign(state.settings, updates)
        }),

      setGraphicsQuality: (quality) =>
        set((state) => {
          state.settings.graphics.quality = quality

          // Ajustar outras configurações baseado na qualidade
          switch (quality) {
            case GraphicsQuality.LOW:
              state.settings.graphics.shadows = false
              state.settings.graphics.reflections = false
              state.settings.graphics.particles = false
              state.settings.graphics.postProcessing = false
              break
            case GraphicsQuality.MEDIUM:
              state.settings.graphics.shadows = true
              state.settings.graphics.shadowQuality = 'low'
              state.settings.graphics.reflections = false
              state.settings.graphics.particles = true
              break
            case GraphicsQuality.HIGH:
              state.settings.graphics.shadows = true
              state.settings.graphics.shadowQuality = 'medium'
              state.settings.graphics.reflections = true
              state.settings.graphics.particles = true
              state.settings.graphics.postProcessing = true
              break
            case GraphicsQuality.ULTRA:
              state.settings.graphics.shadows = true
              state.settings.graphics.shadowQuality = 'high'
              state.settings.graphics.reflections = true
              state.settings.graphics.particles = true
              state.settings.graphics.postProcessing = true
              break
          }
        }),

      toggleTheme: () =>
        set((state) => {
          state.settings.ui.theme =
            state.settings.ui.theme === 'light' ? 'dark' : 'light'
        }),

      // ============================================
      // AÇÕES - UI
      // ============================================

      toggleObjectLibrary: () =>
        set((state) => {
          state.showObjectLibrary = !state.showObjectLibrary
        }),

      toggleSettings: () =>
        set((state) => {
          state.showSettings = !state.showSettings
        }),

      toggleRoomCreator: () =>
        set((state) => {
          state.showRoomCreator = !state.showRoomCreator
        }),

      toggleTutorial: () =>
        set((state) => {
          state.showTutorial = !state.showTutorial
        }),

      // ============================================
      // AÇÕES - SISTEMA
      // ============================================

      setFPS: (fps) =>
        set((state) => {
          state.fps = fps
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
        }),

      reset: () =>
        set((state) => {
          state.objects.clear()
          state.rooms = []
          state.environment = defaultEnvironment
          state.lights = defaultLights
          state.markers = []
          state.editor.selectedObjects = []
          state.editor.history = []
          state.editor.historyIndex = -1
          state.objectCount = 0
        }),
    })),
    {
      name: 'escritorio-virtual-storage',
      partialize: (state) => ({
        savedLayouts: state.savedLayouts,
        settings: state.settings,
      }),
    }
  )
)
