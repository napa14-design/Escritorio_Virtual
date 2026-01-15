import Phaser from 'phaser';
import { GRID_CONFIG, ISO_CONFIG } from '../config/gameConfig';
import { cartesianToIsometric, isometricToCartesian, calculateDepth } from '../utils/isometric';
import Pathfinding from '../systems/Pathfinding';
import Avatar from '../entities/Avatar';
import IsometricObject from '../entities/IsometricObject';
import { getObjectById } from '../config/objectsLibrary';

/**
 * Cena principal do escritório virtual isométrico
 */
export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  init(data) {
    // Dados iniciais
    this.playerName = data.playerName || 'Player';
    this.roomData = data.roomData || null;
  }

  create() {
    // Sistemas
    this.pathfinding = new Pathfinding();
    this.placedObjects = [];
    this.selectedObject = null;

    // Estado
    this.editMode = false;
    this.isDragging = false;

    // Criar ambiente
    this.createFloor();
    this.createGrid();

    // Criar avatar do jogador
    this.createPlayer();

    // Controles
    this.setupControls();

    // Carregar sala se houver dados
    if (this.roomData) {
      this.loadRoom(this.roomData);
    }

    // UI do Phaser (info de debug)
    this.createDebugUI();

    // Emitir evento de cena pronta
    this.events.emit('scene-ready');
  }

  /**
   * Cria o piso isométrico
   */
  createFloor() {
    this.floorContainer = this.add.container(0, 0);
    this.floorContainer.setDepth(0);

    for (let y = 0; y < GRID_CONFIG.HEIGHT; y++) {
      for (let x = 0; x < GRID_CONFIG.WIDTH; x++) {
        const iso = cartesianToIsometric(x, y);

        // Tile do piso
        const tile = this.add.graphics();

        // Padrão xadrez
        const isLight = (x + y) % 2 === 0;
        const color = isLight ? 0xE8E8E8 : 0xD0D0D0;

        tile.fillStyle(color);
        tile.lineStyle(1, 0x999999, 0.3);

        // Desenhar losango isométrico
        tile.beginPath();
        tile.moveTo(iso.x, iso.y);
        tile.lineTo(iso.x + ISO_CONFIG.TILE_WIDTH_HALF, iso.y + ISO_CONFIG.TILE_HEIGHT_HALF);
        tile.lineTo(iso.x, iso.y + ISO_CONFIG.TILE_HEIGHT);
        tile.lineTo(iso.x - ISO_CONFIG.TILE_WIDTH_HALF, iso.y + ISO_CONFIG.TILE_HEIGHT_HALF);
        tile.closePath();

        tile.fillPath();
        tile.strokePath();

        this.floorContainer.add(tile);
      }
    }
  }

  /**
   * Cria grid de debug
   */
  createGrid() {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.setDepth(1000);
    this.gridGraphics.setVisible(false);

    this.gridGraphics.lineStyle(1, 0x00ff00, 0.3);

    for (let y = 0; y <= GRID_CONFIG.HEIGHT; y++) {
      for (let x = 0; x <= GRID_CONFIG.WIDTH; x++) {
        const iso = cartesianToIsometric(x, y);

        if (x < GRID_CONFIG.WIDTH) {
          const isoRight = cartesianToIsometric(x + 1, y);
          this.gridGraphics.lineBetween(iso.x, iso.y, isoRight.x, isoRight.y);
        }

        if (y < GRID_CONFIG.HEIGHT) {
          const isoDown = cartesianToIsometric(x, y + 1);
          this.gridGraphics.lineBetween(iso.x, iso.y, isoDown.x, isoDown.y);
        }
      }
    }
  }

  /**
   * Cria o avatar do jogador
   */
  createPlayer() {
    const startX = Math.floor(GRID_CONFIG.WIDTH / 2);
    const startY = Math.floor(GRID_CONFIG.HEIGHT / 2);

    this.player = new Avatar(this, startX, startY);
    this.player.setName(this.playerName);
  }

  /**
   * Configura controles
   */
  setupControls() {
    // Click para mover
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) return;

      const gridPos = isometricToCartesian(pointer.x, pointer.y);

      if (this.editMode) {
        this.handleEditModeClick(gridPos, pointer);
      } else {
        this.handleNavigationClick(gridPos);
      }
    });

    // Hover
    this.input.on('pointermove', (pointer) => {
      const gridPos = isometricToCartesian(pointer.x, pointer.y);
      this.handleHover(gridPos, pointer);
    });

    // Teclado
    this.input.keyboard.on('keydown-E', () => {
      this.toggleEditMode();
    });

    this.input.keyboard.on('keydown-G', () => {
      this.toggleGrid();
    });

    this.input.keyboard.on('keydown-DELETE', () => {
      if (this.selectedObject && this.editMode) {
        this.removeObject(this.selectedObject);
      }
    });
  }

  /**
   * Handle click em modo navegação
   */
  handleNavigationClick(gridPos) {
    if (
      gridPos.x >= 0 &&
      gridPos.x < GRID_CONFIG.WIDTH &&
      gridPos.y >= 0 &&
      gridPos.y < GRID_CONFIG.HEIGHT
    ) {
      // Mover jogador para posição
      this.player.moveToGrid(gridPos.x, gridPos.y, this.pathfinding);
    }
  }

  /**
   * Handle click em modo edição
   */
  handleEditModeClick(gridPos, pointer) {
    // Verificar se clicou em algum objeto
    const clickedObject = this.getObjectAtPosition(pointer.x, pointer.y);

    if (clickedObject) {
      this.selectObject(clickedObject);
    } else {
      this.selectObject(null);
    }
  }

  /**
   * Handle hover
   */
  handleHover(gridPos, pointer) {
    // Atualizar hover em objetos
    const hoveredObject = this.getObjectAtPosition(pointer.x, pointer.y);

    this.placedObjects.forEach(obj => {
      obj.setHovered(obj === hoveredObject);
    });

    // Cursor
    if (hoveredObject || this.editMode) {
      this.input.setDefaultCursor('pointer');
    } else {
      this.input.setDefaultCursor('default');
    }
  }

  /**
   * Retorna objeto na posição da tela
   */
  getObjectAtPosition(screenX, screenY) {
    // Usar hitTest do Phaser
    const hits = this.input.hitTestPointer(this.input.activePointer);

    for (const hit of hits) {
      if (hit.parentContainer && hit.parentContainer instanceof IsometricObject) {
        return hit.parentContainer;
      }
    }

    return null;
  }

  /**
   * Adiciona objeto à cena
   */
  addObject(objectId, gridX, gridY) {
    const objectData = getObjectById(objectId);
    if (!objectData) return null;

    // Verificar se posição é válida
    if (!this.canPlaceObject(gridX, gridY, objectData.width, objectData.height)) {
      console.warn('Cannot place object at this position');
      return null;
    }

    // Criar objeto
    const obj = new IsometricObject(this, gridX, gridY, objectData);
    this.placedObjects.push(obj);

    // Atualizar pathfinding se não é walkable
    if (!objectData.walkable) {
      this.updatePathfindingForObject(obj, true);
    }

    return obj;
  }

  /**
   * Remove objeto da cena
   */
  removeObject(object) {
    const index = this.placedObjects.indexOf(object);
    if (index === -1) return;

    // Atualizar pathfinding
    if (!object.walkable) {
      this.updatePathfindingForObject(object, false);
    }

    this.placedObjects.splice(index, 1);
    object.destroy();

    if (this.selectedObject === object) {
      this.selectedObject = null;
    }
  }

  /**
   * Atualiza pathfinding para objeto
   */
  updatePathfindingForObject(object, add) {
    const cells = object.getOccupiedCells();

    cells.forEach(cell => {
      if (add) {
        this.pathfinding.addObstacle(cell.x, cell.y);
      } else {
        this.pathfinding.removeObstacle(cell.x, cell.y);
      }
    });
  }

  /**
   * Verifica se pode colocar objeto
   */
  canPlaceObject(gridX, gridY, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const checkX = gridX + x;
        const checkY = gridY + y;

        // Fora dos limites
        if (checkX >= GRID_CONFIG.WIDTH || checkY >= GRID_CONFIG.HEIGHT) {
          return false;
        }

        // Verificar colisão com outros objetos
        for (const obj of this.placedObjects) {
          if (obj.isAtPosition(checkX, checkY)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Seleciona objeto
   */
  selectObject(object) {
    if (this.selectedObject) {
      this.selectedObject.setSelected(false);
    }

    this.selectedObject = object;

    if (object) {
      object.setSelected(true);
    }

    // Emitir evento
    this.events.emit('object-selected', object);
  }

  /**
   * Toggle modo edição
   */
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.events.emit('edit-mode-changed', this.editMode);

    if (!this.editMode) {
      this.selectObject(null);
    }
  }

  /**
   * Toggle grid de debug
   */
  toggleGrid() {
    this.gridGraphics.setVisible(!this.gridGraphics.visible);
  }

  /**
   * Carrega sala de dados salvos
   */
  loadRoom(roomData) {
    // Limpar objetos existentes
    this.placedObjects.forEach(obj => obj.destroy());
    this.placedObjects = [];
    this.pathfinding.clearObstacles();

    // Carregar objetos
    if (roomData.objects) {
      roomData.objects.forEach(objData => {
        this.addObject(objData.id, objData.gridX || objData.x, objData.gridY || objData.y);
      });
    }
  }

  /**
   * Salva estado atual da sala
   */
  saveRoom() {
    return {
      objects: this.placedObjects.map(obj => obj.serialize()),
    };
  }

  /**
   * Cria UI de debug
   */
  createDebugUI() {
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 8 },
    });
    this.debugText.setDepth(10000);
    this.debugText.setScrollFactor(0);
  }

  /**
   * Update loop
   */
  update(time, delta) {
    // Atualizar avatar
    if (this.player) {
      this.player.update(time, delta);
    }

    // Atualizar debug
    if (this.debugText) {
      const playerPos = this.player.getGridPosition();
      this.debugText.setText([
        `FPS: ${Math.round(this.game.loop.actualFps)}`,
        `Player: (${playerPos.x}, ${playerPos.y})`,
        `Objects: ${this.placedObjects.length}`,
        `Edit Mode: ${this.editMode ? 'ON' : 'OFF'}`,
        `Press E: Toggle Edit`,
        `Press G: Toggle Grid`,
      ]);
    }
  }
}

export default MainScene;
