import {
  ObjectDefinition,
  ObjectCategory,
  FurnitureType,
  ElectronicsType,
  DecorationType,
  UtilitiesType,
  ArchitectureType,
  MaterialType,
  TextureType,
} from '@/types'

// ============================================
// BIBLIOTECA DE OBJETOS 3D
// ============================================

export const objectLibrary: ObjectDefinition[] = [
  // ============================================
  // MOBÍLIA
  // ============================================
  {
    id: 'desk-modern',
    name: 'Mesa Moderna',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.DESK,
    description: 'Mesa de trabalho moderna e minimalista',
    icon: '🖥️',
    defaultSize: [1.5, 0.75, 0.8],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#8B4513',
      texture: TextureType.WOOD_OAK,
      roughness: 0.5,
    },
    interactive: false,
    tags: ['furniture', 'work', 'desk'],
    variations: [
      {
        id: 'desk-modern-white',
        name: 'Mesa Moderna Branca',
        modifications: {
          material: {
            type: MaterialType.MATTE,
            color: '#FFFFFF',
            roughness: 0.7,
          },
        },
      },
      {
        id: 'desk-modern-glass',
        name: 'Mesa Moderna Vidro',
        modifications: {
          material: {
            type: MaterialType.GLASS,
            color: '#E0F0FF',
            texture: TextureType.GLASS_CLEAR,
            opacity: 0.3,
            transparent: true,
          },
        },
      },
    ],
  },
  {
    id: 'desk-executive',
    name: 'Mesa Executiva',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.DESK,
    description: 'Mesa executiva grande em madeira nobre',
    icon: '🏛️',
    defaultSize: [2.0, 0.75, 1.0],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#654321',
      texture: TextureType.WOOD_WALNUT,
      roughness: 0.3,
    },
    tags: ['furniture', 'executive', 'desk'],
  },
  {
    id: 'chair-office',
    name: 'Cadeira de Escritório',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.CHAIR,
    description: 'Cadeira ergonômica de escritório',
    icon: '💺',
    defaultSize: [0.6, 1.2, 0.6],
    defaultMaterial: {
      type: MaterialType.FABRIC,
      color: '#333333',
      texture: TextureType.FABRIC_COTTON,
      roughness: 0.8,
    },
    interactive: true,
    tags: ['furniture', 'seating', 'chair'],
  },
  {
    id: 'chair-executive',
    name: 'Cadeira Executiva',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.CHAIR,
    description: 'Cadeira executiva em couro',
    icon: '👑',
    defaultSize: [0.7, 1.3, 0.7],
    defaultMaterial: {
      type: MaterialType.FABRIC,
      color: '#000000',
      texture: TextureType.FABRIC_LEATHER,
      roughness: 0.4,
    },
    interactive: true,
    tags: ['furniture', 'executive', 'chair'],
  },
  {
    id: 'sofa-modern',
    name: 'Sofá Moderno',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.SOFA,
    description: 'Sofá de 3 lugares moderno',
    icon: '🛋️',
    defaultSize: [2.0, 0.9, 0.9],
    defaultMaterial: {
      type: MaterialType.FABRIC,
      color: '#4A5568',
      texture: TextureType.FABRIC_COTTON,
      roughness: 0.9,
    },
    interactive: true,
    tags: ['furniture', 'seating', 'lounge'],
  },
  {
    id: 'table-coffee',
    name: 'Mesa de Centro',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.TABLE,
    description: 'Mesa de centro para sala de estar',
    icon: '⬛',
    defaultSize: [1.2, 0.4, 0.6],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#A0522D',
      texture: TextureType.WOOD_OAK,
      roughness: 0.5,
    },
    tags: ['furniture', 'table', 'lounge'],
  },
  {
    id: 'table-meeting',
    name: 'Mesa de Reunião',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.TABLE,
    description: 'Mesa grande para reuniões',
    icon: '🗂️',
    defaultSize: [3.0, 0.75, 1.5],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#8B4513',
      texture: TextureType.WOOD_WALNUT,
      roughness: 0.3,
    },
    tags: ['furniture', 'meeting', 'table'],
  },
  {
    id: 'shelf-bookcase',
    name: 'Estante de Livros',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.SHELF,
    description: 'Estante alta para livros e decoração',
    icon: '📚',
    defaultSize: [1.0, 2.0, 0.3],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#8B7355',
      texture: TextureType.WOOD_OAK,
      roughness: 0.6,
    },
    tags: ['furniture', 'storage', 'shelf'],
  },
  {
    id: 'cabinet-file',
    name: 'Armário de Arquivos',
    category: ObjectCategory.FURNITURE,
    type: FurnitureType.CABINET,
    description: 'Armário metálico para arquivos',
    icon: '🗄️',
    defaultSize: [0.5, 1.5, 0.6],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#C0C0C0',
      texture: TextureType.METAL_BRUSHED,
      metalness: 0.9,
      roughness: 0.3,
    },
    interactive: true,
    tags: ['furniture', 'storage', 'office'],
  },

  // ============================================
  // ELETRÔNICOS
  // ============================================
  {
    id: 'monitor-27',
    name: 'Monitor 27"',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.MONITOR,
    description: 'Monitor widescreen 27 polegadas',
    icon: '🖥️',
    defaultSize: [0.6, 0.4, 0.05],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#000000',
      roughness: 0.1,
    },
    interactive: true,
    tags: ['electronics', 'monitor', 'work'],
  },
  {
    id: 'monitor-ultrawide',
    name: 'Monitor Ultrawide',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.MONITOR,
    description: 'Monitor ultrawide para produtividade',
    icon: '📺',
    defaultSize: [1.0, 0.4, 0.05],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#000000',
      roughness: 0.1,
    },
    interactive: true,
    tags: ['electronics', 'monitor', 'work'],
  },
  {
    id: 'laptop-modern',
    name: 'Laptop Moderno',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.LAPTOP,
    description: 'Laptop fino e moderno',
    icon: '💻',
    defaultSize: [0.35, 0.02, 0.25],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#808080',
      metalness: 0.8,
      roughness: 0.2,
    },
    interactive: true,
    tags: ['electronics', 'laptop', 'work'],
  },
  {
    id: 'tablet-large',
    name: 'Tablet Grande',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.TABLET,
    description: 'Tablet grande para apresentações',
    icon: '📱',
    defaultSize: [0.25, 0.01, 0.18],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#1A1A1A',
      roughness: 0.1,
    },
    interactive: true,
    tags: ['electronics', 'tablet', 'mobile'],
  },
  {
    id: 'tv-large',
    name: 'TV Grande',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.TV,
    description: 'TV grande para apresentações',
    icon: '📺',
    defaultSize: [1.5, 0.85, 0.05],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#000000',
      roughness: 0.1,
    },
    interactive: true,
    tags: ['electronics', 'tv', 'display'],
  },
  {
    id: 'printer-office',
    name: 'Impressora de Escritório',
    category: ObjectCategory.ELECTRONICS,
    type: ElectronicsType.PRINTER,
    description: 'Impressora multifuncional',
    icon: '🖨️',
    defaultSize: [0.5, 0.4, 0.4],
    defaultMaterial: {
      type: MaterialType.PLASTIC,
      color: '#E0E0E0',
      roughness: 0.6,
    },
    interactive: true,
    tags: ['electronics', 'printer', 'office'],
  },

  // ============================================
  // DECORAÇÃO
  // ============================================
  {
    id: 'plant-small',
    name: 'Planta Pequena',
    category: ObjectCategory.DECORATION,
    type: DecorationType.PLANT,
    description: 'Planta decorativa em vaso pequeno',
    icon: '🪴',
    defaultSize: [0.2, 0.3, 0.2],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#228B22',
      roughness: 0.9,
    },
    tags: ['decoration', 'plant', 'nature'],
  },
  {
    id: 'plant-medium',
    name: 'Planta Média',
    category: ObjectCategory.DECORATION,
    type: DecorationType.PLANT,
    description: 'Planta decorativa em vaso médio',
    icon: '🌿',
    defaultSize: [0.3, 0.6, 0.3],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#2E8B57',
      roughness: 0.9,
    },
    tags: ['decoration', 'plant', 'nature'],
  },
  {
    id: 'plant-large',
    name: 'Planta Grande',
    category: ObjectCategory.DECORATION,
    type: DecorationType.PLANT,
    description: 'Planta grande para espaços amplos',
    icon: '🌳',
    defaultSize: [0.5, 1.5, 0.5],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#006400',
      roughness: 0.9,
    },
    tags: ['decoration', 'plant', 'nature'],
  },
  {
    id: 'painting-landscape',
    name: 'Quadro Paisagem',
    category: ObjectCategory.DECORATION,
    type: DecorationType.PAINTING,
    description: 'Quadro decorativo com paisagem',
    icon: '🖼️',
    defaultSize: [1.0, 0.7, 0.05],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#4A90E2',
      roughness: 0.8,
    },
    tags: ['decoration', 'art', 'wall'],
  },
  {
    id: 'painting-abstract',
    name: 'Quadro Abstrato',
    category: ObjectCategory.DECORATION,
    type: DecorationType.PAINTING,
    description: 'Quadro decorativo abstrato',
    icon: '🎨',
    defaultSize: [0.8, 0.8, 0.05],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#FF6B6B',
      roughness: 0.8,
    },
    tags: ['decoration', 'art', 'wall'],
  },
  {
    id: 'sculpture-modern',
    name: 'Escultura Moderna',
    category: ObjectCategory.DECORATION,
    type: DecorationType.SCULPTURE,
    description: 'Escultura decorativa moderna',
    icon: '🗿',
    defaultSize: [0.3, 0.5, 0.3],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#B8860B',
      metalness: 0.9,
      roughness: 0.2,
    },
    tags: ['decoration', 'art', 'sculpture'],
  },
  {
    id: 'rug-modern',
    name: 'Tapete Moderno',
    category: ObjectCategory.DECORATION,
    type: DecorationType.RUG,
    description: 'Tapete decorativo moderno',
    icon: '🟫',
    defaultSize: [2.0, 0.01, 1.5],
    defaultMaterial: {
      type: MaterialType.FABRIC,
      color: '#8B7355',
      texture: TextureType.FABRIC_COTTON,
      roughness: 0.95,
    },
    tags: ['decoration', 'rug', 'floor'],
  },
  {
    id: 'lamp-desk',
    name: 'Luminária de Mesa',
    category: ObjectCategory.DECORATION,
    type: DecorationType.LAMP,
    description: 'Luminária ajustável para mesa',
    icon: '💡',
    defaultSize: [0.2, 0.5, 0.2],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#333333',
      metalness: 0.7,
      roughness: 0.3,
      emissive: '#FFD700',
      emissiveIntensity: 0.5,
    },
    interactive: true,
    tags: ['decoration', 'lighting', 'desk'],
  },
  {
    id: 'lamp-floor',
    name: 'Luminária de Chão',
    category: ObjectCategory.DECORATION,
    type: DecorationType.LAMP,
    description: 'Luminária de chão alta',
    icon: '🕯️',
    defaultSize: [0.3, 1.7, 0.3],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#444444',
      metalness: 0.6,
      roughness: 0.4,
      emissive: '#FFF8DC',
      emissiveIntensity: 0.4,
    },
    interactive: true,
    tags: ['decoration', 'lighting', 'floor'],
  },

  // ============================================
  // UTILITÁRIOS
  // ============================================
  {
    id: 'whiteboard-large',
    name: 'Quadro Branco Grande',
    category: ObjectCategory.UTILITIES,
    type: UtilitiesType.WHITEBOARD,
    description: 'Quadro branco para anotações',
    icon: '📋',
    defaultSize: [2.0, 1.2, 0.05],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#FFFFFF',
      roughness: 0.1,
    },
    interactive: true,
    tags: ['utilities', 'whiteboard', 'meeting'],
  },
  {
    id: 'coffee-maker',
    name: 'Cafeteira',
    category: ObjectCategory.UTILITIES,
    type: UtilitiesType.COFFEE_MAKER,
    description: 'Cafeteira automática',
    icon: '☕',
    defaultSize: [0.3, 0.4, 0.3],
    defaultMaterial: {
      type: MaterialType.METALLIC,
      color: '#1A1A1A',
      metalness: 0.5,
      roughness: 0.4,
    },
    interactive: true,
    tags: ['utilities', 'coffee', 'kitchen'],
  },
  {
    id: 'water-cooler',
    name: 'Bebedouro',
    category: ObjectCategory.UTILITIES,
    type: UtilitiesType.WATER_COOLER,
    description: 'Bebedouro de água',
    icon: '🚰',
    defaultSize: [0.4, 1.2, 0.4],
    defaultMaterial: {
      type: MaterialType.PLASTIC,
      color: '#4A90E2',
      roughness: 0.5,
    },
    interactive: true,
    tags: ['utilities', 'water', 'kitchen'],
  },
  {
    id: 'clock-wall',
    name: 'Relógio de Parede',
    category: ObjectCategory.UTILITIES,
    type: UtilitiesType.CLOCK,
    description: 'Relógio analógico de parede',
    icon: '🕐',
    defaultSize: [0.3, 0.3, 0.05],
    defaultMaterial: {
      type: MaterialType.GLOSSY,
      color: '#FFFFFF',
      roughness: 0.2,
    },
    interactive: true,
    tags: ['utilities', 'clock', 'wall'],
  },
  {
    id: 'calendar-wall',
    name: 'Calendário de Parede',
    category: ObjectCategory.UTILITIES,
    type: UtilitiesType.CALENDAR,
    description: 'Calendário interativo',
    icon: '📅',
    defaultSize: [0.4, 0.5, 0.02],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#FFFFFF',
      roughness: 0.9,
    },
    interactive: true,
    tags: ['utilities', 'calendar', 'wall'],
  },

  // ============================================
  // ARQUITETURA
  // ============================================
  {
    id: 'wall-standard',
    name: 'Parede Padrão',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.WALL,
    description: 'Parede padrão do escritório',
    icon: '🧱',
    defaultSize: [4.0, 3.0, 0.2],
    defaultMaterial: {
      type: MaterialType.MATTE,
      color: '#F5F5F5',
      roughness: 0.9,
    },
    tags: ['architecture', 'wall', 'structure'],
  },
  {
    id: 'wall-glass',
    name: 'Parede de Vidro',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.WALL,
    description: 'Parede de vidro transparente',
    icon: '🪟',
    defaultSize: [4.0, 3.0, 0.1],
    defaultMaterial: {
      type: MaterialType.GLASS,
      color: '#E0F0FF',
      texture: TextureType.GLASS_CLEAR,
      opacity: 0.2,
      transparent: true,
    },
    tags: ['architecture', 'wall', 'glass'],
  },
  {
    id: 'door-standard',
    name: 'Porta Padrão',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.DOOR,
    description: 'Porta de madeira padrão',
    icon: '🚪',
    defaultSize: [1.0, 2.1, 0.05],
    defaultMaterial: {
      type: MaterialType.WOOD,
      color: '#8B4513',
      texture: TextureType.WOOD_OAK,
      roughness: 0.5,
    },
    interactive: true,
    tags: ['architecture', 'door', 'entrance'],
  },
  {
    id: 'door-glass',
    name: 'Porta de Vidro',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.DOOR,
    description: 'Porta de vidro moderna',
    icon: '🚪',
    defaultSize: [1.0, 2.1, 0.05],
    defaultMaterial: {
      type: MaterialType.GLASS,
      color: '#E0F0FF',
      texture: TextureType.GLASS_FROSTED,
      opacity: 0.3,
      transparent: true,
    },
    interactive: true,
    tags: ['architecture', 'door', 'glass'],
  },
  {
    id: 'window-large',
    name: 'Janela Grande',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.WINDOW,
    description: 'Janela grande com vidro',
    icon: '🪟',
    defaultSize: [1.5, 1.5, 0.1],
    defaultMaterial: {
      type: MaterialType.GLASS,
      color: '#E0F0FF',
      texture: TextureType.GLASS_CLEAR,
      opacity: 0.2,
      transparent: true,
    },
    interactive: true,
    tags: ['architecture', 'window', 'light'],
  },
  {
    id: 'divider-panel',
    name: 'Divisória',
    category: ObjectCategory.ARCHITECTURE,
    type: ArchitectureType.DIVIDER,
    description: 'Divisória móvel para ambientes',
    icon: '📐',
    defaultSize: [2.0, 1.8, 0.05],
    defaultMaterial: {
      type: MaterialType.FABRIC,
      color: '#808080',
      texture: TextureType.FABRIC_COTTON,
      roughness: 0.8,
    },
    tags: ['architecture', 'divider', 'partition'],
  },
]

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

export const getObjectsByCategory = (
  category: ObjectCategory
): ObjectDefinition[] => {
  return objectLibrary.filter((obj) => obj.category === category)
}

export const getObjectById = (id: string): ObjectDefinition | undefined => {
  return objectLibrary.find((obj) => obj.id === id)
}

export const searchObjects = (query: string): ObjectDefinition[] => {
  const lowerQuery = query.toLowerCase()
  return objectLibrary.filter(
    (obj) =>
      obj.name.toLowerCase().includes(lowerQuery) ||
      obj.description?.toLowerCase().includes(lowerQuery) ||
      obj.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

export const getObjectsByTag = (tag: string): ObjectDefinition[] => {
  return objectLibrary.filter((obj) => obj.tags?.includes(tag))
}

export const getAllCategories = (): ObjectCategory[] => {
  return Object.values(ObjectCategory)
}

export const getCategoryIcon = (category: ObjectCategory): string => {
  const icons: Record<ObjectCategory, string> = {
    [ObjectCategory.FURNITURE]: '🪑',
    [ObjectCategory.ELECTRONICS]: '💻',
    [ObjectCategory.DECORATION]: '🎨',
    [ObjectCategory.UTILITIES]: '🔧',
    [ObjectCategory.ARCHITECTURE]: '🏗️',
    [ObjectCategory.LIGHTING]: '💡',
  }
  return icons[category] || '📦'
}

export const getCategoryName = (category: ObjectCategory): string => {
  const names: Record<ObjectCategory, string> = {
    [ObjectCategory.FURNITURE]: 'Mobília',
    [ObjectCategory.ELECTRONICS]: 'Eletrônicos',
    [ObjectCategory.DECORATION]: 'Decoração',
    [ObjectCategory.UTILITIES]: 'Utilitários',
    [ObjectCategory.ARCHITECTURE]: 'Arquitetura',
    [ObjectCategory.LIGHTING]: 'Iluminação',
  }
  return names[category] || category
}
