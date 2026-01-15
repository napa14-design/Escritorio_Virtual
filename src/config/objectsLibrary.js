/**
 * Biblioteca de objetos isométricos 2D
 * Cada objeto define sua aparência, tamanho e propriedades
 */

export const OBJECT_CATEGORIES = {
  FURNITURE: 'Furniture',
  ELECTRONICS: 'Electronics',
  DECORATION: 'Decoration',
  PLANTS: 'Plants',
  WALLS: 'Walls',
};

/**
 * Template para gerar sprites proceduralmente
 * (vamos criar sprites simples com Phaser Graphics)
 */

export const OBJECTS_LIBRARY = {
  // ===== FURNITURE =====
  furniture: [
    {
      id: 'desk-basic',
      name: 'Basic Desk',
      category: 'furniture',
      width: 2,  // tiles
      height: 1, // tiles
      walkable: false,
      color: 0x8B4513,
      icon: '🪑',
      description: 'A simple office desk',
    },
    {
      id: 'desk-executive',
      name: 'Executive Desk',
      category: 'furniture',
      width: 3,
      height: 2,
      walkable: false,
      color: 0x654321,
      icon: '🪑',
      description: 'Large executive desk',
    },
    {
      id: 'chair-office',
      name: 'Office Chair',
      category: 'furniture',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x1a1a1a,
      icon: '💺',
      sittable: true,
      description: 'Comfortable office chair',
    },
    {
      id: 'chair-simple',
      name: 'Simple Chair',
      category: 'furniture',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x4a4a4a,
      icon: '🪑',
      sittable: true,
      description: 'Basic meeting chair',
    },
    {
      id: 'sofa-2seat',
      name: '2-Seat Sofa',
      category: 'furniture',
      width: 2,
      height: 1,
      walkable: false,
      color: 0x2c3e50,
      icon: '🛋️',
      sittable: true,
      description: 'Comfortable 2-seat sofa',
    },
    {
      id: 'sofa-3seat',
      name: '3-Seat Sofa',
      category: 'furniture',
      width: 3,
      height: 1,
      walkable: false,
      color: 0x34495e,
      icon: '🛋️',
      sittable: true,
      description: 'Large 3-seat sofa',
    },
    {
      id: 'table-coffee',
      name: 'Coffee Table',
      category: 'furniture',
      width: 2,
      height: 1,
      walkable: false,
      color: 0xD2691E,
      icon: '⬜',
      description: 'Small coffee table',
    },
    {
      id: 'table-meeting',
      name: 'Meeting Table',
      category: 'furniture',
      width: 4,
      height: 2,
      walkable: false,
      color: 0x8B4513,
      icon: '🪑',
      description: 'Large meeting table',
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf',
      category: 'furniture',
      width: 2,
      height: 1,
      walkable: false,
      color: 0x8B4513,
      icon: '📚',
      description: 'Wooden bookshelf',
    },
    {
      id: 'cabinet',
      name: 'Filing Cabinet',
      category: 'furniture',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x696969,
      icon: '🗄️',
      description: 'Metal filing cabinet',
    },
  ],

  // ===== ELECTRONICS =====
  electronics: [
    {
      id: 'monitor',
      name: 'Monitor',
      category: 'electronics',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x1a1a1a,
      icon: '🖥️',
      interactive: true,
      description: 'Computer monitor',
    },
    {
      id: 'laptop',
      name: 'Laptop',
      category: 'electronics',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x2c3e50,
      icon: '💻',
      interactive: true,
      description: 'Portable laptop',
    },
    {
      id: 'printer',
      name: 'Printer',
      category: 'electronics',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x4a4a4a,
      icon: '🖨️',
      interactive: true,
      description: 'Office printer',
    },
    {
      id: 'tv-wall',
      name: 'Wall TV',
      category: 'electronics',
      width: 2,
      height: 1,
      walkable: false,
      color: 0x000000,
      icon: '📺',
      interactive: true,
      description: 'Large wall-mounted TV',
    },
    {
      id: 'coffee-machine',
      name: 'Coffee Machine',
      category: 'electronics',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x1a1a1a,
      icon: '☕',
      interactive: true,
      description: 'Coffee maker',
    },
    {
      id: 'water-cooler',
      name: 'Water Cooler',
      category: 'electronics',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x4169E1,
      icon: '💧',
      interactive: true,
      description: 'Water dispenser',
    },
  ],

  // ===== DECORATION =====
  decoration: [
    {
      id: 'plant-small',
      name: 'Small Plant',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x228B22,
      icon: '🪴',
      description: 'Small potted plant',
    },
    {
      id: 'plant-medium',
      name: 'Medium Plant',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x2E7D32,
      icon: '🌿',
      description: 'Medium decorative plant',
    },
    {
      id: 'plant-large',
      name: 'Large Plant',
      category: 'decoration',
      width: 2,
      height: 2,
      walkable: false,
      color: 0x1B5E20,
      icon: '🌳',
      description: 'Large indoor tree',
    },
    {
      id: 'rug-small',
      name: 'Small Rug',
      category: 'decoration',
      width: 2,
      height: 2,
      walkable: true,
      color: 0x8B0000,
      icon: '🧿',
      description: 'Decorative rug',
      layer: 'floor',
    },
    {
      id: 'rug-large',
      name: 'Large Rug',
      category: 'decoration',
      width: 4,
      height: 3,
      walkable: true,
      color: 0xA52A2A,
      icon: '🧿',
      description: 'Large area rug',
      layer: 'floor',
    },
    {
      id: 'picture-frame',
      name: 'Picture Frame',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x8B4513,
      icon: '🖼️',
      description: 'Wall picture frame',
      wallMounted: true,
    },
    {
      id: 'clock-wall',
      name: 'Wall Clock',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xFFFFFF,
      icon: '🕐',
      description: 'Wall clock',
      wallMounted: true,
      animated: true,
    },
    {
      id: 'lamp-desk',
      name: 'Desk Lamp',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xFFD700,
      icon: '💡',
      interactive: true,
      emitsLight: true,
      description: 'Desk lamp',
    },
    {
      id: 'lamp-floor',
      name: 'Floor Lamp',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xC0C0C0,
      icon: '🪔',
      interactive: true,
      emitsLight: true,
      description: 'Standing floor lamp',
    },
    {
      id: 'trash-bin',
      name: 'Trash Bin',
      category: 'decoration',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x696969,
      icon: '🗑️',
      description: 'Waste basket',
    },
  ],

  // ===== WALLS & ARCHITECTURE =====
  walls: [
    {
      id: 'wall-straight',
      name: 'Straight Wall',
      category: 'walls',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xD3D3D3,
      icon: '🧱',
      description: 'Standard wall segment',
    },
    {
      id: 'wall-corner',
      name: 'Corner Wall',
      category: 'walls',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xC0C0C0,
      icon: '🧱',
      description: 'Corner wall piece',
    },
    {
      id: 'door-single',
      name: 'Single Door',
      category: 'walls',
      width: 1,
      height: 1,
      walkable: true,
      color: 0x8B4513,
      icon: '🚪',
      interactive: true,
      openable: true,
      description: 'Standard door',
    },
    {
      id: 'door-double',
      name: 'Double Door',
      category: 'walls',
      width: 2,
      height: 1,
      walkable: true,
      color: 0x654321,
      icon: '🚪',
      interactive: true,
      openable: true,
      description: 'Wide double door',
    },
    {
      id: 'window',
      name: 'Window',
      category: 'walls',
      width: 1,
      height: 1,
      walkable: false,
      color: 0x87CEEB,
      icon: '🪟',
      transparent: true,
      description: 'Window',
    },
    {
      id: 'divider',
      name: 'Room Divider',
      category: 'walls',
      width: 1,
      height: 1,
      walkable: false,
      color: 0xA9A9A9,
      icon: '▯',
      description: 'Portable room divider',
    },
  ],
};

/**
 * Retorna todos os objetos de uma categoria
 */
export const getObjectsByCategory = (category) => {
  return OBJECTS_LIBRARY[category] || [];
};

/**
 * Retorna objeto por ID
 */
export const getObjectById = (id) => {
  for (const category in OBJECTS_LIBRARY) {
    const found = OBJECTS_LIBRARY[category].find(obj => obj.id === id);
    if (found) return found;
  }
  return null;
};

/**
 * Retorna todos os objetos em array flat
 */
export const getAllObjects = () => {
  return Object.values(OBJECTS_LIBRARY).flat();
};

/**
 * Busca objetos por query
 */
export const searchObjects = (query) => {
  const lowerQuery = query.toLowerCase();
  return getAllObjects().filter(obj =>
    obj.name.toLowerCase().includes(lowerQuery) ||
    obj.description.toLowerCase().includes(lowerQuery) ||
    obj.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Presets de salas prontas
 */
export const ROOM_PRESETS = [
  {
    id: 'modern-office',
    name: 'Modern Office',
    description: 'Contemporary workspace',
    objects: [
      { id: 'desk-basic', x: 8, y: 8, rotation: 0 },
      { id: 'chair-office', x: 8, y: 9, rotation: 0 },
      { id: 'monitor', x: 8, y: 8, rotation: 0 },
      { id: 'bookshelf', x: 6, y: 7, rotation: 0 },
      { id: 'plant-medium', x: 11, y: 8, rotation: 0 },
      { id: 'lamp-desk', x: 9, y: 8, rotation: 0 },
      { id: 'rug-small', x: 7, y: 8, rotation: 0 },
    ],
  },
  {
    id: 'meeting-room',
    name: 'Meeting Room',
    description: 'Conference setup',
    objects: [
      { id: 'table-meeting', x: 8, y: 8, rotation: 0 },
      { id: 'chair-simple', x: 7, y: 7, rotation: 0 },
      { id: 'chair-simple', x: 11, y: 7, rotation: 0 },
      { id: 'chair-simple', x: 7, y: 10, rotation: 0 },
      { id: 'chair-simple', x: 11, y: 10, rotation: 0 },
      { id: 'tv-wall', x: 8, y: 5, rotation: 0 },
      { id: 'plant-large', x: 13, y: 8, rotation: 0 },
      { id: 'water-cooler', x: 5, y: 10, rotation: 0 },
    ],
  },
  {
    id: 'lounge-area',
    name: 'Lounge Area',
    description: 'Relaxation zone',
    objects: [
      { id: 'sofa-3seat', x: 7, y: 8, rotation: 0 },
      { id: 'table-coffee', x: 9, y: 10, rotation: 0 },
      { id: 'plant-large', x: 12, y: 7, rotation: 0 },
      { id: 'plant-medium', x: 6, y: 7, rotation: 0 },
      { id: 'lamp-floor', x: 5, y: 9, rotation: 0 },
      { id: 'tv-wall', x: 8, y: 6, rotation: 0 },
      { id: 'rug-large', x: 7, y: 8, rotation: 0 },
      { id: 'coffee-machine', x: 13, y: 11, rotation: 0 },
    ],
  },
];
