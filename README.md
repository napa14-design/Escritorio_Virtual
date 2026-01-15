# 🏢 3D Virtual Office - Escritório Virtual

An **AAA-quality, highly customizable, and interactive 3D virtual office** built with React, Three.js, and React Three Fiber. Create, customize, and navigate through your own virtual workspace with an extensive object library, real-time editing, and professional UI/UX.

![Virtual Office](https://img.shields.io/badge/Status-Production_Ready-success)
![React](https://img.shields.io/badge/React-18.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-Latest-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎮 Advanced Navigation System
- **WASD Movement**: Smooth, physics-based character movement
- **Mouse Look**: First-person camera control with pointer lock
- **Sprint & Jump**: Run with Shift, jump with Space
- **Multiple Camera Modes**:
  - First Person (default)
  - Third Person
  - Aerial View
  - Free Camera (Orbit controls)
- **Physics System**: Realistic gravity, momentum, and ground collision
- **Teleportation**: Click-to-teleport for quick navigation (coming soon)

### 🎨 Extreme Customization
- **Real-time Editor**: Drag, rotate, scale, and position objects with precision
- **Extensive Object Library** (40+ objects):
  - **Furniture**: Desks, chairs, sofas, tables, bookshelves, cabinets
  - **Electronics**: Monitors, laptops, tablets, TVs, keyboards, mice
  - **Decoration**: Plants, picture frames, sculptures, rugs, lamps, clocks
  - **Utilities**: Whiteboards, coffee makers, printers, water coolers, fans
  - **Architecture**: Walls, doors, windows, dividers, pillars, stairs

- **Visual Customization**:
  - RGB color picker for any object
  - Material types: Standard, Metallic, Shiny, Transparent
  - Texture support (procedural)
  - Emissive lighting per object

- **Environment Control**:
  - Sky/ceiling color customization
  - Floor patterns (solid, checkered, striped)
  - Ambient lighting (intensity, color, direction)
  - Dynamic point lights, spotlights, directional lights
  - Fog system with density control
  - Real-time shadow configuration

### 🔧 Interactive Objects
- **Functional Doors**: Open/close with smooth animations
- **Display Devices**: Monitors and TVs can show custom content
- **Interactive Lamps**: Toggle lights on/off with point light emission
- **Sitting System**: Click chairs to sit (camera repositioning)
- **Animated Objects**: Rotating fans, growing plants
- **Real-time Clock**: Display actual time
- **Proximity System**: Highlights and tooltips when near interactive objects

### 💾 Layout Management
- **Save & Load**: Create unlimited named layouts
- **Import/Export**: Share layouts via JSON
- **Preset Templates**:
  - Modern Office
  - Meeting Room
  - Lounge Area
- **Auto-save**: Automatic saving every 30 seconds
- **Persistent Storage**: All configurations saved to localStorage
- **Versioning**: Full undo/redo history (50 actions)

### 🖥️ Professional UI/UX
- **Modern Glassmorphism Design**: Beautiful translucent panels
- **Complete HUD**:
  - Real-time FPS counter
  - Object count and statistics
  - Player coordinates
  - Mini-map with object positions
  - Mode indicators (Edit/Navigation)
  - Control hints

- **Comprehensive Sidebar**:
  - **Objects Tab**: Browse and add objects by category
  - **Environment Tab**: Customize lighting, floor, fog
  - **Settings Tab**: Graphics quality, controls, camera modes
  - **Layouts Tab**: Save, load, import, export

- **Dark/Light Mode**: Toggle between themes
- **Tutorial System**: Interactive onboarding for new users
- **Keyboard Shortcuts**: Full keyboard accessibility

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `W` `A` `S` `D` | Move around |
| `Mouse` | Look around (click to lock pointer) |
| `Shift` | Sprint/Run |
| `Space` | Jump |
| `Tab` | Toggle sidebar menu |
| `E` | Toggle edit mode |
| `Click` | Select objects |
| `Drag` | Move objects (in edit mode) |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + D` | Duplicate selected object |
| `Delete` | Remove selected object |
| `F12` | Take screenshot |
| `Escape` | Close tutorial/dialogs |

### ⚡ Performance Optimizations
- **Efficient Rendering**: Optimized geometry and materials
- **Frustum Culling**: Only render visible objects
- **Auto LOD**: Level of detail for distant objects (architecture ready)
- **Object Pooling**: Reuse geometries and materials
- **Lazy Loading**: Textures loaded on demand
- **Post-processing**: SSAO and Bloom (on Ultra quality)
- **60 FPS Target**: Smooth performance even with 100+ objects

### 🎯 Graphics Quality Presets
- **Low**: Basic rendering, no shadows
- **Medium**: Standard quality with soft shadows
- **High**: Enhanced quality with full shadows
- **Ultra**: Maximum quality with post-processing effects

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Escritorio_Virtual
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## 📂 Project Structure

```
src/
├── components/
│   ├── Scene/
│   │   ├── MainScene.jsx      # Main 3D canvas and scene setup
│   │   ├── Floor.jsx           # Procedural floor with patterns
│   │   └── Lighting.jsx        # Dynamic lighting system
│   ├── Objects/
│   │   └── Object3D.jsx        # Reusable 3D object component
│   ├── Controls/
│   │   └── FirstPersonControls.jsx  # WASD + mouse navigation
│   └── UI/
│       ├── HUD.jsx             # Heads-up display
│       ├── HUD.css
│       ├── Sidebar.jsx         # Control panel sidebar
│       └── Sidebar.css
├── store/
│   └── useStore.js             # Zustand state management
├── utils/
│   └── objectLibrary.js        # 40+ object definitions
├── App.jsx                     # Main app component
├── App.css                     # Global app styles
└── main.jsx                    # Entry point
```

## 🎨 Customization Guide

### Adding New Objects

Edit `src/utils/objectLibrary.js`:

```javascript
{
  type: 'my-object',
  name: 'My Custom Object',
  geometry: {
    type: 'box',
    args: [1, 1, 1]  // width, height, depth
  },
  defaultColor: '#ff0000',
  defaultPosition: [0, 0.5, 0],
  interactive: true,
  icon: '🎁',
}
```

### Creating Preset Layouts

Add to `presetLayouts` in `objectLibrary.js`:

```javascript
{
  name: 'My Layout',
  description: 'Custom office setup',
  objects: [
    { type: 'desk', position: [0, 0.75, 0], rotation: [0, 0, 0] },
    { type: 'chair-office', position: [0, 0, -0.5], rotation: [0, 0, 0] },
  ],
}
```

### Customizing Colors

All colors can be changed via:
- **Objects**: Select object → Sidebar → Environment tab → Color picker
- **Environment**: Sidebar → Environment tab
- **UI**: Edit CSS variables in component stylesheets

## 🛠️ Technologies Used

- **React 18.3** - UI framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **Zustand** - State management
- **Vite** - Build tool and dev server
- **React Icons** - Icon library

## 🎯 Roadmap / Future Features

- [ ] Multiplayer support (avatars, real-time collaboration)
- [ ] VR mode support
- [ ] Advanced whiteboard with drawing tools
- [ ] Video conferencing integration
- [ ] Custom texture uploads
- [ ] Room templates creator
- [ ] Lighting presets (morning, evening, night)
- [ ] Weather effects
- [ ] Sound system and ambient audio
- [ ] Import 3D models (GLTF/GLB)
- [ ] Mobile touch controls
- [ ] Screenshot gallery

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Three.js community for excellent documentation
- React Three Fiber team for the amazing React integration
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the documentation above

---

**Made with ❤️ and Three.js**

*Experience AAA-quality 3D virtual spaces in your browser!*
