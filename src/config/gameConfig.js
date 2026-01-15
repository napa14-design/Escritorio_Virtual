// Configuração principal do jogo isométrico

export const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#2d2d2d',
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Configurações isométricas
export const ISO_CONFIG = {
  TILE_WIDTH: 64,
  TILE_HEIGHT: 32,
  TILE_WIDTH_HALF: 32,
  TILE_HEIGHT_HALF: 16,
};

// Grid configuration
export const GRID_CONFIG = {
  WIDTH: 20,  // tiles horizontalmente
  HEIGHT: 20, // tiles verticalmente
  START_X: 640, // centro da tela X
  START_Y: 100, // início Y
};

// Avatar configuration
export const AVATAR_CONFIG = {
  WALK_SPEED: 150,
  ANIMATION_SPEED: 8,
  COLORS: {
    SKIN: ['#FDB777', '#E89B6C', '#D67D5C', '#8B5A3C', '#5C3D2E'],
    HAIR: ['#2C1B18', '#4A312C', '#6F4E37', '#8B7355', '#FFD700', '#FF6B6B'],
    SHIRT: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'],
    PANTS: ['#2C3E50', '#34495E', '#5D4E37', '#2E4053', '#1C1C1C'],
  },
};

// Room types
export const ROOM_TYPES = {
  OFFICE: 'office',
  MEETING: 'meeting',
  LOUNGE: 'lounge',
  RECEPTION: 'reception',
};

// Object types
export const OBJECT_TYPES = {
  FURNITURE: 'furniture',
  DECORATION: 'decoration',
  ELECTRONICS: 'electronics',
  PLANTS: 'plants',
};

// Collision layers
export const LAYERS = {
  FLOOR: 0,
  OBJECTS: 1,
  AVATARS: 2,
  UI: 3,
};
