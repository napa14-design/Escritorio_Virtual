import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Main application store with persistent state
const useStore = create(
  persist(
    (set, get) => ({
      // ===== SCENE STATE =====
      objects: [],
      selectedObject: null,
      hoveredObject: null,

      // ===== CAMERA/NAVIGATION STATE =====
      cameraMode: 'firstPerson', // firstPerson, thirdPerson, aerial, free
      playerPosition: [0, 1.6, 5],
      playerRotation: [0, 0, 0],
      isSitting: false,

      // ===== EDIT MODE STATE =====
      editMode: false,
      showGrid: true,
      snapToGrid: true,
      gridSize: 0.5,

      // ===== ENVIRONMENT STATE =====
      environment: {
        skyColor: '#87CEEB',
        floorColor: '#E0E0E0',
        floorPattern: 'solid', // solid, checkered, striped
        ambientLightIntensity: 0.5,
        ambientLightColor: '#ffffff',
        fogEnabled: false,
        fogDensity: 0.01,
        fogColor: '#ffffff',
      },

      // ===== LIGHTING STATE =====
      lights: [
        {
          id: 'main-light',
          type: 'directional',
          position: [10, 10, 10],
          intensity: 1,
          color: '#ffffff',
          castShadow: true,
        },
      ],

      // ===== UI STATE =====
      showHUD: true,
      showMinimap: true,
      showFPS: true,
      showTooltips: true,
      showTutorial: false,
      sidebarOpen: false,
      sidebarTab: 'objects', // objects, environment, settings

      // ===== SETTINGS STATE =====
      settings: {
        graphicsQuality: 'high', // low, medium, high, ultra
        renderDistance: 100,
        shadowQuality: 'high',
        antialiasing: true,
        enableReflections: true,
        enableParticles: true,
        movementSpeed: 5,
        runMultiplier: 2,
        mouseSensitivity: 0.002,
        darkMode: false,
      },

      // ===== LAYOUT STATE =====
      layouts: [],
      currentLayout: 'Default',

      // ===== HISTORY STATE (undo/redo) =====
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,

      // ===== MARKERS/PINS STATE =====
      markers: [],

      // ===== PERFORMANCE STATE =====
      fps: 60,
      objectCount: 0,

      // ===== ACTIONS =====

      // Object management
      addObject: (object) => {
        const newObject = {
          ...object,
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: object.position || [0, 0, 0],
          rotation: object.rotation || [0, 0, 0],
          scale: object.scale || [1, 1, 1],
          color: object.color || '#ffffff',
          material: object.material || 'standard',
          texture: object.texture || null,
          interactive: object.interactive !== false,
          metadata: object.metadata || {},
        };

        set((state) => {
          const objects = [...state.objects, newObject];
          get().addToHistory({ type: 'add', object: newObject });
          return { objects, objectCount: objects.length };
        });

        return newObject.id;
      },

      updateObject: (id, updates) => {
        set((state) => {
          const objectIndex = state.objects.findIndex((obj) => obj.id === id);
          if (objectIndex === -1) return state;

          const oldObject = state.objects[objectIndex];
          const newObjects = [...state.objects];
          newObjects[objectIndex] = { ...oldObject, ...updates };

          get().addToHistory({
            type: 'update',
            id,
            oldData: oldObject,
            newData: newObjects[objectIndex],
          });

          return { objects: newObjects };
        });
      },

      deleteObject: (id) => {
        set((state) => {
          const object = state.objects.find((obj) => obj.id === id);
          if (!object) return state;

          const objects = state.objects.filter((obj) => obj.id !== id);
          get().addToHistory({ type: 'delete', object });

          return {
            objects,
            objectCount: objects.length,
            selectedObject: state.selectedObject === id ? null : state.selectedObject,
          };
        });
      },

      duplicateObject: (id) => {
        const object = get().objects.find((obj) => obj.id === id);
        if (!object) return;

        const newObject = {
          ...object,
          position: [
            object.position[0] + 1,
            object.position[1],
            object.position[2] + 1,
          ],
        };

        return get().addObject(newObject);
      },

      selectObject: (id) => set({ selectedObject: id }),
      hoverObject: (id) => set({ hoveredObject: id }),

      // History management
      addToHistory: (action) => {
        set((state) => {
          const history = state.history.slice(0, state.historyIndex + 1);
          history.push(action);

          if (history.length > state.maxHistorySize) {
            history.shift();
          }

          return {
            history,
            historyIndex: history.length - 1,
          };
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex < 0) return;

        const action = state.history[state.historyIndex];

        // Revert the action
        switch (action.type) {
          case 'add':
            set((s) => ({
              objects: s.objects.filter((obj) => obj.id !== action.object.id),
              historyIndex: s.historyIndex - 1,
            }));
            break;
          case 'delete':
            set((s) => ({
              objects: [...s.objects, action.object],
              historyIndex: s.historyIndex - 1,
            }));
            break;
          case 'update':
            set((s) => ({
              objects: s.objects.map((obj) =>
                obj.id === action.id ? action.oldData : obj
              ),
              historyIndex: s.historyIndex - 1,
            }));
            break;
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;

        const action = state.history[state.historyIndex + 1];

        // Redo the action
        switch (action.type) {
          case 'add':
            set((s) => ({
              objects: [...s.objects, action.object],
              historyIndex: s.historyIndex + 1,
            }));
            break;
          case 'delete':
            set((s) => ({
              objects: s.objects.filter((obj) => obj.id !== action.object.id),
              historyIndex: s.historyIndex + 1,
            }));
            break;
          case 'update':
            set((s) => ({
              objects: s.objects.map((obj) =>
                obj.id === action.id ? action.newData : obj
              ),
              historyIndex: s.historyIndex + 1,
            }));
            break;
        }
      },

      // Environment management
      updateEnvironment: (updates) =>
        set((state) => ({
          environment: { ...state.environment, ...updates },
        })),

      addLight: (light) =>
        set((state) => ({
          lights: [
            ...state.lights,
            {
              ...light,
              id: `light-${Date.now()}`,
            },
          ],
        })),

      updateLight: (id, updates) =>
        set((state) => ({
          lights: state.lights.map((light) =>
            light.id === id ? { ...light, ...updates } : light
          ),
        })),

      deleteLight: (id) =>
        set((state) => ({
          lights: state.lights.filter((light) => light.id !== id),
        })),

      // UI management
      toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      setCameraMode: (mode) => set({ cameraMode: mode }),

      // Settings management
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      // Layout management
      saveLayout: (name) => {
        const state = get();
        const layout = {
          name: name || `Layout ${state.layouts.length + 1}`,
          timestamp: Date.now(),
          objects: state.objects,
          environment: state.environment,
          lights: state.lights,
        };

        set((s) => ({
          layouts: [...s.layouts, layout],
          currentLayout: layout.name,
        }));

        return layout;
      },

      loadLayout: (name) => {
        const layout = get().layouts.find((l) => l.name === name);
        if (!layout) return;

        set({
          objects: layout.objects,
          environment: layout.environment,
          lights: layout.lights,
          currentLayout: layout.name,
          objectCount: layout.objects.length,
        });
      },

      deleteLayout: (name) =>
        set((state) => ({
          layouts: state.layouts.filter((l) => l.name !== name),
        })),

      exportLayout: (name) => {
        const layout = get().layouts.find((l) => l.name === name);
        return layout ? JSON.stringify(layout, null, 2) : null;
      },

      importLayout: (jsonString) => {
        try {
          const layout = JSON.parse(jsonString);
          set((state) => ({
            layouts: [...state.layouts, layout],
          }));
          return true;
        } catch (e) {
          console.error('Failed to import layout:', e);
          return false;
        }
      },

      // Marker management
      addMarker: (marker) =>
        set((state) => ({
          markers: [
            ...state.markers,
            {
              ...marker,
              id: `marker-${Date.now()}`,
            },
          ],
        })),

      deleteMarker: (id) =>
        set((state) => ({
          markers: state.markers.filter((m) => m.id !== id),
        })),

      // Performance tracking
      updateFPS: (fps) => set({ fps }),

      // Player state
      updatePlayerPosition: (position) => set({ playerPosition: position }),
      updatePlayerRotation: (rotation) => set({ playerRotation: rotation }),
      setSitting: (sitting) => set({ isSitting: sitting }),

      // Reset
      resetScene: () =>
        set({
          objects: [],
          selectedObject: null,
          hoveredObject: null,
          history: [],
          historyIndex: -1,
          objectCount: 0,
        }),
    }),
    {
      name: 'virtual-office-storage',
      partialize: (state) => ({
        objects: state.objects,
        environment: state.environment,
        lights: state.lights,
        settings: state.settings,
        layouts: state.layouts,
        currentLayout: state.currentLayout,
      }),
    }
  )
);

export default useStore;
