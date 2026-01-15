// Comprehensive 3D object library for the virtual office

export const objectCategories = {
  furniture: 'Furniture',
  electronics: 'Electronics',
  decoration: 'Decoration',
  utilities: 'Utilities',
  architecture: 'Architecture',
};

export const objectLibrary = {
  // ===== FURNITURE =====
  furniture: [
    {
      type: 'desk',
      name: 'Modern Desk',
      geometry: { type: 'box', args: [2, 0.1, 1] },
      defaultColor: '#8B4513',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      icon: '🪑',
    },
    {
      type: 'desk-large',
      name: 'Executive Desk',
      geometry: { type: 'box', args: [2.5, 0.1, 1.2] },
      defaultColor: '#654321',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      icon: '🪑',
    },
    {
      type: 'chair-office',
      name: 'Office Chair',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.5, 0.1, 0.5], position: [0, 0.5, 0] }, // seat
        { type: 'box', args: [0.5, 0.6, 0.1], position: [0, 0.85, -0.2] }, // back
        { type: 'cylinder', args: [0.05, 0.05, 0.4], position: [0, 0.2, 0] }, // pole
      ]},
      defaultColor: '#1a1a1a',
      defaultPosition: [0, 0, 0],
      interactive: true,
      action: 'sit',
      icon: '💺',
    },
    {
      type: 'chair-simple',
      name: 'Simple Chair',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.45, 0.08, 0.45], position: [0, 0.45, 0] },
        { type: 'box', args: [0.45, 0.5, 0.08], position: [0, 0.7, -0.185] },
      ]},
      defaultColor: '#4a4a4a',
      defaultPosition: [0, 0, 0],
      interactive: true,
      action: 'sit',
      icon: '🪑',
    },
    {
      type: 'sofa',
      name: 'Sofa',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [2, 0.4, 0.8], position: [0, 0.4, 0] }, // seat
        { type: 'box', args: [2, 0.6, 0.2], position: [0, 0.7, -0.3] }, // back
        { type: 'box', args: [0.2, 0.4, 0.8], position: [-1, 0.4, 0] }, // left arm
        { type: 'box', args: [0.2, 0.4, 0.8], position: [1, 0.4, 0] }, // right arm
      ]},
      defaultColor: '#2c3e50',
      defaultPosition: [0, 0, 0],
      interactive: true,
      action: 'sit',
      icon: '🛋️',
    },
    {
      type: 'bookshelf',
      name: 'Bookshelf',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [1.5, 0.05, 0.4], position: [0, 0.5, 0] },
        { type: 'box', args: [1.5, 0.05, 0.4], position: [0, 1, 0] },
        { type: 'box', args: [1.5, 0.05, 0.4], position: [0, 1.5, 0] },
        { type: 'box', args: [1.5, 0.05, 0.4], position: [0, 2, 0] },
        { type: 'box', args: [0.05, 2, 0.4], position: [-0.725, 1, 0] },
        { type: 'box', args: [0.05, 2, 0.4], position: [0.725, 1, 0] },
      ]},
      defaultColor: '#8B4513',
      defaultPosition: [0, 0, 0],
      icon: '📚',
    },
    {
      type: 'cabinet',
      name: 'Cabinet',
      geometry: { type: 'box', args: [1, 1.5, 0.5] },
      defaultColor: '#696969',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      action: 'open',
      icon: '🗄️',
    },
    {
      type: 'table-coffee',
      name: 'Coffee Table',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [1.2, 0.08, 0.7], position: [0, 0.4, 0] },
        { type: 'cylinder', args: [0.05, 0.05, 0.4], position: [0.5, 0.2, 0.3] },
        { type: 'cylinder', args: [0.05, 0.05, 0.4], position: [-0.5, 0.2, 0.3] },
        { type: 'cylinder', args: [0.05, 0.05, 0.4], position: [0.5, 0.2, -0.3] },
        { type: 'cylinder', args: [0.05, 0.05, 0.4], position: [-0.5, 0.2, -0.3] },
      ]},
      defaultColor: '#D2691E',
      defaultPosition: [0, 0, 0],
      icon: '⬜',
    },
    {
      type: 'table-meeting',
      name: 'Meeting Table',
      geometry: { type: 'box', args: [3, 0.1, 1.5] },
      defaultColor: '#8B4513',
      defaultPosition: [0, 0.75, 0],
      icon: '🪑',
    },
  ],

  // ===== ELECTRONICS =====
  electronics: [
    {
      type: 'monitor',
      name: 'Monitor',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.8, 0.5, 0.05], position: [0, 1.05, 0] }, // screen
        { type: 'box', args: [0.3, 0.05, 0.2], position: [0, 0.75, 0] }, // stand
      ]},
      defaultColor: '#1a1a1a',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      action: 'display',
      displayable: true,
      icon: '🖥️',
    },
    {
      type: 'laptop',
      name: 'Laptop',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.35, 0.02, 0.25], position: [0, 0.76, 0] }, // base
        { type: 'box', args: [0.35, 0.22, 0.02], position: [0, 0.87, -0.125] }, // screen
      ]},
      defaultColor: '#2c3e50',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      action: 'display',
      displayable: true,
      icon: '💻',
    },
    {
      type: 'tablet',
      name: 'Tablet',
      geometry: { type: 'box', args: [0.2, 0.01, 0.28] },
      defaultColor: '#34495e',
      defaultPosition: [0, 0.76, 0],
      interactive: true,
      displayable: true,
      icon: '📱',
    },
    {
      type: 'tv',
      name: 'TV',
      geometry: { type: 'box', args: [2, 1.2, 0.1] },
      defaultColor: '#000000',
      defaultPosition: [0, 1.5, 0],
      interactive: true,
      action: 'display',
      displayable: true,
      icon: '📺',
    },
    {
      type: 'keyboard',
      name: 'Keyboard',
      geometry: { type: 'box', args: [0.45, 0.02, 0.15] },
      defaultColor: '#2c2c2c',
      defaultPosition: [0, 0.76, 0],
      icon: '⌨️',
    },
    {
      type: 'mouse',
      name: 'Mouse',
      geometry: { type: 'box', args: [0.06, 0.03, 0.1] },
      defaultColor: '#1a1a1a',
      defaultPosition: [0, 0.76, 0],
      icon: '🖱️',
    },
  ],

  // ===== DECORATION =====
  decoration: [
    {
      type: 'plant-small',
      name: 'Small Plant',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.15, 0.15, 0.2], position: [0, 0.1, 0] }, // pot
        { type: 'sphere', args: [0.2], position: [0, 0.35, 0] }, // foliage
      ]},
      defaultColor: '#228B22',
      defaultPosition: [0, 0, 0],
      animated: true,
      animationType: 'grow',
      icon: '🪴',
    },
    {
      type: 'plant-large',
      name: 'Large Plant',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.25, 0.25, 0.3], position: [0, 0.15, 0] },
        { type: 'sphere', args: [0.4], position: [0, 0.6, 0] },
        { type: 'sphere', args: [0.35], position: [0.2, 0.7, 0] },
        { type: 'sphere', args: [0.35], position: [-0.2, 0.7, 0] },
      ]},
      defaultColor: '#2E7D32',
      defaultPosition: [0, 0, 0],
      animated: true,
      animationType: 'grow',
      icon: '🌿',
    },
    {
      type: 'picture-frame',
      name: 'Picture Frame',
      geometry: { type: 'box', args: [0.8, 0.6, 0.05] },
      defaultColor: '#8B4513',
      defaultPosition: [0, 1.5, 0],
      interactive: true,
      displayable: true,
      icon: '🖼️',
    },
    {
      type: 'sculpture',
      name: 'Sculpture',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.3, 0.05, 0.3], position: [0, 0.025, 0] },
        { type: 'sphere', args: [0.2], position: [0, 0.3, 0] },
      ]},
      defaultColor: '#C0C0C0',
      defaultPosition: [0, 0.75, 0],
      icon: '🗿',
    },
    {
      type: 'rug',
      name: 'Rug',
      geometry: { type: 'box', args: [2, 0.02, 1.5] },
      defaultColor: '#8B0000',
      defaultPosition: [0, 0.01, 0],
      icon: '🧿',
    },
    {
      type: 'lamp-desk',
      name: 'Desk Lamp',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.08, 0.08, 0.02], position: [0, 0.01, 0] },
        { type: 'cylinder', args: [0.02, 0.02, 0.3], position: [0, 0.17, 0] },
        { type: 'cone', args: [0.15, 0.2], position: [0, 0.42, 0] },
      ]},
      defaultColor: '#FFD700',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      action: 'toggle-light',
      emitsLight: true,
      icon: '💡',
    },
    {
      type: 'lamp-floor',
      name: 'Floor Lamp',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.15, 0.15, 0.05], position: [0, 0.025, 0] },
        { type: 'cylinder', args: [0.03, 0.03, 1.5], position: [0, 0.8, 0] },
        { type: 'cone', args: [0.25, 0.3], position: [0, 1.7, 0] },
      ]},
      defaultColor: '#C0C0C0',
      defaultPosition: [0, 0, 0],
      interactive: true,
      action: 'toggle-light',
      emitsLight: true,
      icon: '🪔',
    },
    {
      type: 'clock',
      name: 'Wall Clock',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.3, 0.3, 0.05], position: [0, 0, 0] },
      ]},
      defaultColor: '#ffffff',
      defaultPosition: [0, 2, 0],
      interactive: true,
      showsTime: true,
      icon: '🕐',
    },
    {
      type: 'calendar',
      name: 'Calendar',
      geometry: { type: 'box', args: [0.4, 0.5, 0.02] },
      defaultColor: '#ffffff',
      defaultPosition: [0, 1.5, 0],
      interactive: true,
      icon: '📅',
    },
  ],

  // ===== UTILITIES =====
  utilities: [
    {
      type: 'whiteboard',
      name: 'Whiteboard',
      geometry: { type: 'box', args: [2, 1.2, 0.05] },
      defaultColor: '#ffffff',
      defaultPosition: [0, 1.2, 0],
      interactive: true,
      action: 'draw',
      drawable: true,
      icon: '⬜',
    },
    {
      type: 'coffee-maker',
      name: 'Coffee Maker',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.3, 0.4, 0.25], position: [0, 0.2, 0] },
        { type: 'cylinder', args: [0.08, 0.08, 0.15], position: [0, 0.475, 0] },
      ]},
      defaultColor: '#1a1a1a',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      icon: '☕',
    },
    {
      type: 'printer',
      name: 'Printer',
      geometry: { type: 'box', args: [0.5, 0.3, 0.4] },
      defaultColor: '#4a4a4a',
      defaultPosition: [0, 0.75, 0],
      interactive: true,
      icon: '🖨️',
    },
    {
      type: 'trash-can',
      name: 'Trash Can',
      geometry: { type: 'cylinder', args: [0.15, 0.15, 0.4] },
      defaultColor: '#696969',
      defaultPosition: [0, 0.2, 0],
      interactive: true,
      icon: '🗑️',
    },
    {
      type: 'water-cooler',
      name: 'Water Cooler',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [0.35, 0.8, 0.35], position: [0, 0.4, 0] },
        { type: 'cylinder', args: [0.25, 0.25, 0.5], position: [0, 1.1, 0] },
      ]},
      defaultColor: '#4169E1',
      defaultPosition: [0, 0, 0],
      interactive: true,
      icon: '💧',
    },
    {
      type: 'fan',
      name: 'Fan',
      geometry: { type: 'composite', parts: [
        { type: 'cylinder', args: [0.2, 0.2, 0.05], position: [0, 1.2, 0] },
        { type: 'cylinder', args: [0.05, 0.05, 1], position: [0, 0.5, 0] },
      ]},
      defaultColor: '#C0C0C0',
      defaultPosition: [0, 0, 0],
      interactive: true,
      animated: true,
      animationType: 'rotate',
      icon: '💨',
    },
  ],

  // ===== ARCHITECTURE =====
  architecture: [
    {
      type: 'wall',
      name: 'Wall',
      geometry: { type: 'box', args: [4, 3, 0.2] },
      defaultColor: '#D3D3D3',
      defaultPosition: [0, 1.5, 0],
      icon: '🧱',
    },
    {
      type: 'wall-half',
      name: 'Half Wall',
      geometry: { type: 'box', args: [4, 1.5, 0.2] },
      defaultColor: '#D3D3D3',
      defaultPosition: [0, 0.75, 0],
      icon: '🧱',
    },
    {
      type: 'door',
      name: 'Door',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [1, 2.2, 0.1], position: [0, 1.1, 0] }, // door
        { type: 'box', args: [1.2, 2.4, 0.15], position: [0, 1.2, 0] }, // frame
      ]},
      defaultColor: '#8B4513',
      defaultPosition: [0, 0, 0],
      interactive: true,
      action: 'open',
      animated: true,
      icon: '🚪',
    },
    {
      type: 'window',
      name: 'Window',
      geometry: { type: 'composite', parts: [
        { type: 'box', args: [1.5, 1.2, 0.05], position: [0, 1.8, 0] }, // glass
        { type: 'box', args: [1.6, 1.3, 0.1], position: [0, 1.8, 0] }, // frame
      ]},
      defaultColor: '#87CEEB',
      defaultPosition: [0, 1.8, 0],
      interactive: true,
      action: 'open',
      icon: '🪟',
    },
    {
      type: 'divider',
      name: 'Room Divider',
      geometry: { type: 'box', args: [2, 2, 0.05] },
      defaultColor: '#A9A9A9',
      defaultPosition: [0, 1, 0],
      icon: '▯',
    },
    {
      type: 'pillar',
      name: 'Pillar',
      geometry: { type: 'box', args: [0.4, 3, 0.4] },
      defaultColor: '#808080',
      defaultPosition: [0, 1.5, 0],
      icon: '⬜',
    },
    {
      type: 'stairs',
      name: 'Stairs',
      geometry: { type: 'composite', parts: Array.from({ length: 8 }, (_, i) => ({
        type: 'box',
        args: [2, 0.15, 0.3],
        position: [0, i * 0.15 + 0.075, i * 0.3],
      }))},
      defaultColor: '#696969',
      defaultPosition: [0, 0, 0],
      icon: '🪜',
    },
  ],
};

// Helper function to get all objects flattened
export const getAllObjects = () => {
  return Object.entries(objectLibrary).flatMap(([category, objects]) =>
    objects.map(obj => ({ ...obj, category }))
  );
};

// Helper function to search objects
export const searchObjects = (query) => {
  const allObjects = getAllObjects();
  const lowerQuery = query.toLowerCase();
  return allObjects.filter(obj =>
    obj.name.toLowerCase().includes(lowerQuery) ||
    obj.type.toLowerCase().includes(lowerQuery) ||
    obj.category.toLowerCase().includes(lowerQuery)
  );
};

// Preset layouts
export const presetLayouts = [
  {
    name: 'Modern Office',
    description: 'A contemporary open-plan office space',
    objects: [
      { type: 'desk', position: [2, 0.75, 0], rotation: [0, 0, 0] },
      { type: 'chair-office', position: [2, 0, -0.5], rotation: [0, 0, 0] },
      { type: 'monitor', position: [2, 0.75, 0.3], rotation: [0, 0, 0] },
      { type: 'desk', position: [-2, 0.75, 0], rotation: [0, Math.PI, 0] },
      { type: 'chair-office', position: [-2, 0, 0.5], rotation: [0, Math.PI, 0] },
      { type: 'plant-large', position: [4, 0, 4], rotation: [0, 0, 0] },
      { type: 'bookshelf', position: [-4, 0, 4], rotation: [0, Math.PI / 2, 0] },
    ],
  },
  {
    name: 'Meeting Room',
    description: 'Conference room setup with large table',
    objects: [
      { type: 'table-meeting', position: [0, 0.75, 0], rotation: [0, 0, 0] },
      { type: 'chair-simple', position: [0, 0, 1.2], rotation: [0, Math.PI, 0] },
      { type: 'chair-simple', position: [0, 0, -1.2], rotation: [0, 0, 0] },
      { type: 'chair-simple', position: [2, 0, 0], rotation: [0, -Math.PI / 2, 0] },
      { type: 'chair-simple', position: [-2, 0, 0], rotation: [0, Math.PI / 2, 0] },
      { type: 'whiteboard', position: [0, 1.2, -3], rotation: [0, 0, 0] },
      { type: 'tv', position: [0, 1.5, 3], rotation: [0, Math.PI, 0] },
    ],
  },
  {
    name: 'Lounge Area',
    description: 'Comfortable break room with seating',
    objects: [
      { type: 'sofa', position: [0, 0, 0], rotation: [0, 0, 0] },
      { type: 'table-coffee', position: [0, 0, 1.5], rotation: [0, 0, 0] },
      { type: 'plant-large', position: [3, 0, 0], rotation: [0, 0, 0] },
      { type: 'plant-large', position: [-3, 0, 0], rotation: [0, 0, 0] },
      { type: 'lamp-floor', position: [2, 0, -2], rotation: [0, 0, 0] },
      { type: 'coffee-maker', position: [-3, 0.75, 3], rotation: [0, 0, 0] },
      { type: 'tv', position: [0, 1.5, -3], rotation: [0, 0, 0] },
    ],
  },
];
