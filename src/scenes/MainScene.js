import Phaser from 'phaser';
import { GRID_CONFIG, ISO_CONFIG } from '../config/gameConfig';
import { cartesianToIsometric, isometricToCartesian, calculateDepth } from '../utils/isometric';
import Pathfinding from '../systems/Pathfinding';
import Avatar from '../entities/Avatar';
import IsometricObject from '../entities/IsometricObject';
import { getObjectById } from '../config/objectsLibrary';
import { DEFAULT_AUDIO_ZONES } from '../config/audioZones';
import { SharedScreenManager } from '../systems/SharedScreenManager';
import { DEFAULT_AVATAR_CUSTOMIZATION } from '../utils/avatarStorage';

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
    this.avatarCustomization = data.avatarCustomization || DEFAULT_AVATAR_CUSTOMIZATION;
  }

  create() {
    // Sistemas
    this.pathfinding = new Pathfinding();
    this.placedObjects = [];
    this.selectedObject = null;
    this.sharedScreenManager = new SharedScreenManager(this);

    // Estado
    this.editMode = false;
    this.isDragging = false;

    // Multiplayer
    this.remoteAvatars = new Map();

    // Criar ambiente
    this.createFloor();
    this.createAudioZones();
    this.createSharedScreens();
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
   * Cria zonas de áudio visualmente
   */
  createAudioZones() {
    this.audioZonesContainer = this.add.container(0, 0);
    this.audioZonesContainer.setDepth(5); // Acima do piso, abaixo dos objetos

    DEFAULT_AUDIO_ZONES.forEach(zone => {
      const { bounds, color, opacity, name, icon } = zone;

      // Criar retângulo da zona
      const graphics = this.add.graphics();

      // Converter cor hex string para número
      const colorNum = parseInt(color.replace('#', ''), 16);

      graphics.fillStyle(colorNum, opacity);
      graphics.lineStyle(2, colorNum, 0.5);

      // Desenhar retângulo isométrico da zona
      for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
          const iso = cartesianToIsometric(x, y);

          graphics.beginPath();
          graphics.moveTo(iso.x, iso.y);
          graphics.lineTo(iso.x + ISO_CONFIG.TILE_WIDTH_HALF, iso.y + ISO_CONFIG.TILE_HEIGHT_HALF);
          graphics.lineTo(iso.x, iso.y + ISO_CONFIG.TILE_HEIGHT);
          graphics.lineTo(iso.x - ISO_CONFIG.TILE_WIDTH_HALF, iso.y + ISO_CONFIG.TILE_HEIGHT_HALF);
          graphics.closePath();
          graphics.fillPath();
        }
      }

      // Borda do perímetro
      const topLeft = cartesianToIsometric(bounds.x, bounds.y);
      const topRight = cartesianToIsometric(bounds.x + bounds.width, bounds.y);
      const bottomLeft = cartesianToIsometric(bounds.x, bounds.y + bounds.height);
      const bottomRight = cartesianToIsometric(bounds.x + bounds.width, bounds.y + bounds.height);

      graphics.strokeRect(
        topLeft.x,
        topLeft.y,
        topRight.x - topLeft.x,
        bottomLeft.y - topLeft.y
      );

      // Label da zona (centro)
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const centerIso = cartesianToIsometric(centerX, centerY);

      const label = this.add.text(centerIso.x, centerIso.y - 20, `${icon} ${name}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: color + '99',
        padding: { x: 8, y: 4 },
        stroke: '#000000',
        strokeThickness: 2,
      });
      label.setOrigin(0.5);
      label.setDepth(6);

      this.audioZonesContainer.add(graphics);
      this.audioZonesContainer.add(label);
    });
  }

  /**
   * Cria telas compartilhadas no escritório
   */
  createSharedScreens() {
    // Adicionar 2 telas grandes nas "paredes" do escritório
    // Tela 1: No canto superior esquerdo
    this.sharedScreenManager.addScreen(2, 2, {
      width: 3,
      height: 2,
      name: 'Screen 1',
      frameColor: 0x2d3748,
      screenColor: 0x1a202c,
    });

    // Tela 2: No canto superior direito
    this.sharedScreenManager.addScreen(GRID_CONFIG.WIDTH - 5, 2, {
      width: 3,
      height: 2,
      name: 'Screen 2',
      frameColor: 0x2d3748,
      screenColor: 0x1a202c,
    });

    console.log('Created shared screens:', this.sharedScreenManager.getAllScreens().length);
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

    this.player = new Avatar(this, startX, startY, this.avatarCustomization);
    this.player.setName(this.playerName);

    // Mapa de avatares remotos
    this.remoteAvatars = new Map();
  }

  /**
   * Adiciona avatar de outro usuário
   */
  addRemoteAvatar(userData) {
    const { id, name, position, customization } = userData;

    // Verificar se já existe
    if (this.remoteAvatars.has(id)) {
      return this.remoteAvatars.get(id);
    }

    // Criar avatar
    const avatar = new Avatar(
      this,
      position?.x || 10,
      position?.y || 10,
      customization
    );
    avatar.setName(name);

    // Armazenar
    this.remoteAvatars.set(id, avatar);

    console.log(`Added remote avatar: ${name} (${id})`);

    return avatar;
  }

  /**
   * Remove avatar remoto
   */
  removeRemoteAvatar(userId) {
    const avatar = this.remoteAvatars.get(userId);
    if (avatar) {
      avatar.destroy();
      this.remoteAvatars.delete(userId);
      console.log(`Removed remote avatar: ${userId}`);
    }
  }

  /**
   * Retorna avatar remoto
   */
  getRemoteAvatar(userId) {
    return this.remoteAvatars.get(userId);
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
   * Adiciona um avatar remoto (multiplayer)
   */
  addRemoteAvatar(userData) {
    const { id, name, position, customization } = userData;

    // Não adicionar se já existe
    if (this.remoteAvatars.has(id)) {
      console.warn(`Avatar ${id} already exists`);
      return this.remoteAvatars.get(id);
    }

    // Criar avatar
    const avatar = new Avatar(
      this,
      position?.x || 10,
      position?.y || 10,
      customization || {}
    );

    avatar.setName(name || 'Remote User');
    this.add.existing(avatar);

    // Adicionar ao mapa
    this.remoteAvatars.set(id, avatar);

    console.log(`Added remote avatar: ${name} (${id})`);

    return avatar;
  }

  /**
   * Remove um avatar remoto
   */
  removeRemoteAvatar(userId) {
    const avatar = this.remoteAvatars.get(userId);

    if (avatar) {
      avatar.destroy();
      this.remoteAvatars.delete(userId);
      console.log(`Removed remote avatar: ${userId}`);
    }
  }

  /**
   * Atualiza posição de um avatar remoto
   */
  updateRemoteAvatarPosition(userId, position) {
    const avatar = this.remoteAvatars.get(userId);

    if (avatar) {
      avatar.moveToGrid(position.x, position.y, this.pathfinding);
    }
  }

  /**
   * Retorna o gerenciador de telas compartilhadas
   */
  getSharedScreenManager() {
    return this.sharedScreenManager;
  }

  /**
   * Update loop
   */
  update(time, delta) {
    // Atualizar avatar local
    if (this.player) {
      this.player.update(time, delta);
    }

    // Atualizar avatares remotos
    if (this.remoteAvatars) {
      this.remoteAvatars.forEach(avatar => {
        avatar.update(time, delta);
      });
    }

    // Atualizar debug
    if (this.debugText) {
      const playerPos = this.player.getGridPosition();
      const availableScreens = this.sharedScreenManager?.getAvailableScreenCount() || 0;
      this.debugText.setText([
        `FPS: ${Math.round(this.game.loop.actualFps)}`,
        `Player: (${playerPos.x}, ${playerPos.y})`,
        `Objects: ${this.placedObjects.length}`,
        `Remote Users: ${this.remoteAvatars?.size || 0}`,
        `Available Screens: ${availableScreens}`,
        `Edit Mode: ${this.editMode ? 'ON' : 'OFF'}`,
        `Press E: Toggle Edit`,
        `Press G: Toggle Grid`,
      ]);
    }
  }
}

export default MainScene;
