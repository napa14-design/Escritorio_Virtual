import Phaser from 'phaser';
import { cartesianToIsometric, calculateDepth } from '../utils/isometric';
import { ISO_CONFIG } from '../config/gameConfig';

/**
 * Objeto isométrico genérico (móveis, decoração, etc.)
 */
export class IsometricObject extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, objectData) {
    super(scene);

    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.objectData = objectData;

    // Propriedades
    this.id = `${objectData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.objectId = objectData.id;
    this.objectWidth = objectData.width || 1;
    this.objectHeight = objectData.height || 1;
    this.walkable = objectData.walkable || false;
    this.interactive = objectData.interactive || false;
    this.rotation = 0;

    // Estado
    this.isSelected = false;
    this.isHovered = false;

    // Criar visual
    this.createVisual();
    this.updatePosition();

    // Tornar interativo
    this.setInteractive(
      new Phaser.Geom.Rectangle(-ISO_CONFIG.TILE_WIDTH_HALF, -ISO_CONFIG.TILE_HEIGHT_HALF, ISO_CONFIG.TILE_WIDTH, ISO_CONFIG.TILE_HEIGHT * 2),
      Phaser.Geom.Rectangle.Contains
    );

    scene.add.existing(this);
  }

  /**
   * Cria representação visual do objeto
   */
  createVisual() {
    const width = this.objectWidth * ISO_CONFIG.TILE_WIDTH_HALF;
    const height = this.objectHeight * ISO_CONFIG.TILE_HEIGHT_HALF;

    // Sprite principal (usando Graphics por enquanto)
    this.sprite = this.scene.add.graphics();

    // Desenhar base isométrica
    this.drawIsometricBox(width, height, this.objectData.color);

    // Sombra
    if (!this.objectData.layer || this.objectData.layer !== 'floor') {
      this.shadow = this.scene.add.graphics();
      this.shadow.fillStyle(0x000000, 0.2);
      this.shadow.fillEllipse(0, height / 2, width * 1.2, height * 0.4);
      this.add(this.shadow);
    }

    this.add(this.sprite);

    // Ícone do objeto (texto emoji)
    if (this.objectData.icon) {
      this.icon = this.scene.add.text(0, -height / 2, this.objectData.icon, {
        fontSize: '20px',
      });
      this.icon.setOrigin(0.5);
      this.add(this.icon);
    }

    // Label com nome
    this.label = this.scene.add.text(0, -height - 10, this.objectData.name, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.label.setOrigin(0.5);
    this.label.setVisible(false);
    this.add(this.label);

    // Highlight de seleção
    this.selectionBox = this.scene.add.graphics();
    this.selectionBox.lineStyle(2, 0x00ff00, 1);
    this.drawIsometricOutline(width, height);
    this.selectionBox.setVisible(false);
    this.add(this.selectionBox);
  }

  /**
   * Desenha caixa isométrica
   */
  drawIsometricBox(width, height, color) {
    // Altura do objeto (visual 3D)
    const objectHeight = Math.max(width, height) * 0.6;

    // Face frontal (mais escura)
    this.sprite.fillStyle(Phaser.Display.Color.ValueToColor(color).darken(30).color);
    this.sprite.beginPath();
    this.sprite.moveTo(0, -objectHeight);
    this.sprite.lineTo(width, -objectHeight + height / 2);
    this.sprite.lineTo(width, height / 2);
    this.sprite.lineTo(0, 0);
    this.sprite.closePath();
    this.sprite.fillPath();

    // Face lateral (ainda mais escura)
    this.sprite.fillStyle(Phaser.Display.Color.ValueToColor(color).darken(50).color);
    this.sprite.beginPath();
    this.sprite.moveTo(0, -objectHeight);
    this.sprite.lineTo(-width, -objectHeight + height / 2);
    this.sprite.lineTo(-width, height / 2);
    this.sprite.lineTo(0, 0);
    this.sprite.closePath();
    this.sprite.fillPath();

    // Face superior (cor original)
    this.sprite.fillStyle(color);
    this.sprite.beginPath();
    this.sprite.moveTo(0, -objectHeight);
    this.sprite.lineTo(width, -objectHeight + height / 2);
    this.sprite.lineTo(0, -objectHeight + height);
    this.sprite.lineTo(-width, -objectHeight + height / 2);
    this.sprite.closePath();
    this.sprite.fillPath();

    // Bordas
    this.sprite.lineStyle(1, 0x000000, 0.3);
    this.sprite.strokePath();
  }

  /**
   * Desenha contorno isométrico
   */
  drawIsometricOutline(width, height) {
    const objectHeight = Math.max(width, height) * 0.6;

    this.selectionBox.beginPath();
    this.selectionBox.moveTo(0, -objectHeight);
    this.selectionBox.lineTo(width, -objectHeight + height / 2);
    this.selectionBox.lineTo(0, -objectHeight + height);
    this.selectionBox.lineTo(-width, -objectHeight + height / 2);
    this.selectionBox.closePath();
    this.selectionBox.strokePath();
  }

  /**
   * Atualiza posição isométrica
   */
  updatePosition() {
    const iso = cartesianToIsometric(this.gridX, this.gridY);
    this.x = iso.x;
    this.y = iso.y;
    this.depth = calculateDepth(this.gridX, this.gridY);
  }

  /**
   * Define estado de seleção
   */
  setSelected(selected) {
    this.isSelected = selected;
    if (this.selectionBox) {
      this.selectionBox.setVisible(selected);
    }
  }

  /**
   * Define estado de hover
   */
  setHovered(hovered) {
    this.isHovered = hovered;
    if (this.label) {
      this.label.setVisible(hovered);
    }

    // Efeito de hover
    if (hovered) {
      this.setScale(1.05);
    } else {
      this.setScale(1);
    }
  }

  /**
   * Move objeto para nova posição no grid
   */
  moveTo(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.updatePosition();
  }

  /**
   * Retorna células ocupadas pelo objeto
   */
  getOccupiedCells() {
    const cells = [];
    for (let y = 0; y < this.objectHeight; y++) {
      for (let x = 0; x < this.objectWidth; x++) {
        cells.push({
          x: this.gridX + x,
          y: this.gridY + y,
        });
      }
    }
    return cells;
  }

  /**
   * Verifica se objeto está em posição específica
   */
  isAtPosition(gridX, gridY) {
    return (
      gridX >= this.gridX &&
      gridX < this.gridX + this.objectWidth &&
      gridY >= this.gridY &&
      gridY < this.gridY + this.objectHeight
    );
  }

  /**
   * Serializa objeto para salvar
   */
  serialize() {
    return {
      id: this.objectId,
      gridX: this.gridX,
      gridY: this.gridY,
      rotation: this.rotation,
    };
  }

  /**
   * Destroi objeto
   */
  destroy(fromScene) {
    if (this.sprite) this.sprite.destroy();
    if (this.shadow) this.shadow.destroy();
    if (this.icon) this.icon.destroy();
    if (this.label) this.label.destroy();
    if (this.selectionBox) this.selectionBox.destroy();

    super.destroy(fromScene);
  }
}

export default IsometricObject;
