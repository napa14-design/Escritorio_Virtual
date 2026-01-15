import EasyStar from 'easystarjs';
import { GRID_CONFIG } from '../config/gameConfig';

/**
 * Sistema de pathfinding A* para navegação isométrica
 */
export class Pathfinding {
  constructor() {
    this.easystar = new EasyStar.js();
    this.grid = [];
    this.obstacles = new Set();

    this.initGrid();
  }

  /**
   * Inicializa o grid de navegação
   */
  initGrid() {
    // Criar grid 2D preenchido com 0 (walkable)
    for (let y = 0; y < GRID_CONFIG.HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < GRID_CONFIG.WIDTH; x++) {
        row.push(0);
      }
      this.grid.push(row);
    }

    // Configurar EasyStar
    this.easystar.setGrid(this.grid);
    this.easystar.setAcceptableTiles([0]); // 0 = walkable
    this.easystar.enableDiagonals();
    this.easystar.enableCornerCutting();
  }

  /**
   * Adiciona obstáculo no grid
   */
  addObstacle(gridX, gridY) {
    if (this.isValidPosition(gridX, gridY)) {
      this.grid[gridY][gridX] = 1; // 1 = obstacle
      this.obstacles.add(`${gridX},${gridY}`);
      this.easystar.setGrid(this.grid);
    }
  }

  /**
   * Remove obstáculo do grid
   */
  removeObstacle(gridX, gridY) {
    if (this.isValidPosition(gridX, gridY)) {
      this.grid[gridY][gridX] = 0;
      this.obstacles.delete(`${gridX},${gridY}`);
      this.easystar.setGrid(this.grid);
    }
  }

  /**
   * Verifica se posição tem obstáculo
   */
  hasObstacle(gridX, gridY) {
    return this.obstacles.has(`${gridX},${gridY}`);
  }

  /**
   * Verifica se posição é válida
   */
  isValidPosition(gridX, gridY) {
    return (
      gridX >= 0 &&
      gridX < GRID_CONFIG.WIDTH &&
      gridY >= 0 &&
      gridY < GRID_CONFIG.HEIGHT
    );
  }

  /**
   * Verifica se posição é walkable
   */
  isWalkable(gridX, gridY) {
    if (!this.isValidPosition(gridX, gridY)) return false;
    return this.grid[gridY][gridX] === 0;
  }

  /**
   * Encontra caminho entre dois pontos
   * @returns Promise<Array<{x, y}>>
   */
  findPath(startX, startY, endX, endY) {
    return new Promise((resolve, reject) => {
      // Validar posições
      if (!this.isValidPosition(startX, startY) || !this.isValidPosition(endX, endY)) {
        reject(new Error('Invalid start or end position'));
        return;
      }

      // Se destino não é walkable, tentar encontrar posição próxima
      if (!this.isWalkable(endX, endY)) {
        const nearestWalkable = this.findNearestWalkable(endX, endY);
        if (nearestWalkable) {
          endX = nearestWalkable.x;
          endY = nearestWalkable.y;
        } else {
          reject(new Error('No walkable path found'));
          return;
        }
      }

      this.easystar.findPath(startX, startY, endX, endY, (path) => {
        if (path === null) {
          reject(new Error('No path found'));
        } else {
          resolve(path);
        }
      });

      this.easystar.calculate();
    });
  }

  /**
   * Encontra posição walkable mais próxima
   */
  findNearestWalkable(gridX, gridY, maxRadius = 5) {
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
            const checkX = gridX + dx;
            const checkY = gridY + dy;

            if (this.isWalkable(checkX, checkY)) {
              return { x: checkX, y: checkY };
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Limpa todos os obstáculos
   */
  clearObstacles() {
    this.obstacles.clear();
    for (let y = 0; y < GRID_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < GRID_CONFIG.WIDTH; x++) {
        this.grid[y][x] = 0;
      }
    }
    this.easystar.setGrid(this.grid);
  }

  /**
   * Define múltiplos obstáculos de uma vez
   */
  setObstacles(obstacleList) {
    this.clearObstacles();

    obstacleList.forEach(({ x, y }) => {
      this.addObstacle(x, y);
    });
  }

  /**
   * Debug: retorna representação do grid
   */
  getGridDebug() {
    return this.grid.map(row => row.join(' ')).join('\n');
  }

  /**
   * Calcula linha de visão entre dois pontos (Bresenham)
   */
  hasLineOfSight(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let currentX = x0;
    let currentY = y0;

    while (true) {
      // Chegou ao destino
      if (currentX === x1 && currentY === y1) {
        return true;
      }

      // Encontrou obstáculo
      if (!this.isWalkable(currentX, currentY)) {
        return false;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currentX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currentY += sy;
      }
    }
  }
}

export default Pathfinding;
