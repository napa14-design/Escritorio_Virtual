import { ISO_CONFIG, GRID_CONFIG } from '../config/gameConfig';

/**
 * Utilitários para conversão de coordenadas isométricas
 */

/**
 * Converte coordenadas cartesianas (grid) para isométricas (tela)
 */
export const cartesianToIsometric = (cartX, cartY) => {
  const isoX = (cartX - cartY) * ISO_CONFIG.TILE_WIDTH_HALF;
  const isoY = (cartX + cartY) * ISO_CONFIG.TILE_HEIGHT_HALF;

  return {
    x: isoX + GRID_CONFIG.START_X,
    y: isoY + GRID_CONFIG.START_Y,
  };
};

/**
 * Converte coordenadas isométricas (tela) para cartesianas (grid)
 */
export const isometricToCartesian = (isoX, isoY) => {
  // Ajustar para origem
  isoX -= GRID_CONFIG.START_X;
  isoY -= GRID_CONFIG.START_Y;

  const cartX = (isoX / ISO_CONFIG.TILE_WIDTH_HALF + isoY / ISO_CONFIG.TILE_HEIGHT_HALF) / 2;
  const cartY = (isoY / ISO_CONFIG.TILE_HEIGHT_HALF - isoX / ISO_CONFIG.TILE_WIDTH_HALF) / 2;

  return {
    x: Math.floor(cartX),
    y: Math.floor(cartY),
  };
};

/**
 * Converte posição do mouse para coordenadas do grid
 */
export const screenToGrid = (screenX, screenY) => {
  return isometricToCartesian(screenX, screenY);
};

/**
 * Converte coordenadas do grid para posição na tela
 */
export const gridToScreen = (gridX, gridY) => {
  return cartesianToIsometric(gridX, gridY);
};

/**
 * Calcula profundidade Z para ordenação de sprites
 */
export const calculateDepth = (gridX, gridY) => {
  return gridX + gridY;
};

/**
 * Verifica se uma posição está dentro dos limites do grid
 */
export const isValidGridPosition = (gridX, gridY) => {
  return (
    gridX >= 0 &&
    gridX < GRID_CONFIG.WIDTH &&
    gridY >= 0 &&
    gridY < GRID_CONFIG.HEIGHT
  );
};

/**
 * Calcula distância Manhattan entre dois pontos no grid
 */
export const manhattanDistance = (x1, y1, x2, y2) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

/**
 * Calcula distância Euclidiana entre dois pontos no grid
 */
export const euclideanDistance = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Retorna vizinhos válidos de uma célula (4 direções)
 */
export const getNeighbors = (gridX, gridY) => {
  const neighbors = [];
  const directions = [
    { x: 0, y: -1 }, // norte
    { x: 1, y: 0 },  // leste
    { x: 0, y: 1 },  // sul
    { x: -1, y: 0 }, // oeste
  ];

  directions.forEach(dir => {
    const newX = gridX + dir.x;
    const newY = gridY + dir.y;

    if (isValidGridPosition(newX, newY)) {
      neighbors.push({ x: newX, y: newY });
    }
  });

  return neighbors;
};

/**
 * Retorna vizinhos válidos incluindo diagonais (8 direções)
 */
export const getNeighbors8 = (gridX, gridY) => {
  const neighbors = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const newX = gridX + dx;
      const newY = gridY + dy;

      if (isValidGridPosition(newX, newY)) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  }

  return neighbors;
};

/**
 * Converte ângulo para direção isométrica (0-7)
 */
export const angleToDirection = (angle) => {
  // Normaliza ângulo para 0-360
  angle = ((angle % 360) + 360) % 360;

  // 8 direções: N, NE, E, SE, S, SW, W, NW
  const directionStep = 360 / 8;
  const direction = Math.round(angle / directionStep) % 8;

  return direction;
};

/**
 * Converte direção para nome (para animações)
 */
export const directionToName = (direction) => {
  const names = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  return names[direction] || 's';
};

/**
 * Interpola entre dois pontos do grid
 */
export const interpolateGrid = (x1, y1, x2, y2, t) => {
  return {
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  };
};
