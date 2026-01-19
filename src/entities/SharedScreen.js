import Phaser from 'phaser';
import { cartesianToIsometric, calculateDepth } from '../utils/isometric';
import { ISO_CONFIG } from '../config/gameConfig';

/**
 * SharedScreen - Display para compartilhamento de tela (TV/Monitor na parede)
 * Pode exibir stream de vídeo de usuários que estão compartilhando a tela
 */
export class SharedScreen extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, config = {}) {
    super(scene);

    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.config = {
      width: config.width || 3, // Largura em tiles
      height: config.height || 2, // Altura em tiles
      screenColor: config.screenColor || 0x1a1a1a,
      frameColor: config.frameColor || 0x333333,
      name: config.name || 'Shared Screen',
      ...config,
    };

    // Estado
    this.currentStream = null;
    this.currentUserId = null;
    this.videoElement = null;
    this.videoTexture = null;

    // Criar visual
    this.createVisual();
    this.updatePosition();

    // Tornar interativo
    this.setInteractive(
      new Phaser.Geom.Rectangle(-100, -100, 200, 150),
      Phaser.Geom.Rectangle.Contains
    );

    scene.add.existing(this);
  }

  /**
   * Cria representação visual da tela
   */
  createVisual() {
    const width = this.config.width * ISO_CONFIG.TILE_WIDTH_HALF;
    const height = this.config.height * ISO_CONFIG.TILE_HEIGHT_HALF;

    // Frame da TV/Monitor
    this.frame = this.scene.add.graphics();
    this.frame.fillStyle(this.config.frameColor);
    this.frame.fillRect(-width - 5, -height * 2 - 5, width * 2 + 10, height * 2 + 10);
    this.add(this.frame);

    // Tela (onde o vídeo será exibido)
    this.screen = this.scene.add.graphics();
    this.screen.fillStyle(this.config.screenColor);
    this.screen.fillRect(-width, -height * 2, width * 2, height * 2);
    this.add(this.screen);

    // Placeholder text
    this.placeholderText = this.scene.add.text(0, -height, 'No signal\n📺', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
      align: 'center',
    });
    this.placeholderText.setOrigin(0.5);
    this.add(this.placeholderText);

    // Video display (será criado dinamicamente quando houver stream)
    this.videoSprite = null;

    // Label com nome da tela
    this.label = this.scene.add.text(0, -height * 2 - 20, this.config.name, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // Indicador de usuário compartilhando
    this.userLabel = this.scene.add.text(0, height - 10, '', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#10b981',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    });
    this.userLabel.setOrigin(0.5);
    this.userLabel.setVisible(false);
    this.add(this.userLabel);

    // Sombra
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.3);
    this.shadow.fillEllipse(0, 10, width * 2, 20);
    this.addAt(this.shadow, 0);
  }

  /**
   * Atualiza posição isométrica
   */
  updatePosition() {
    const iso = cartesianToIsometric(this.gridX, this.gridY);
    this.x = iso.x;
    this.y = iso.y;
    this.depth = calculateDepth(this.gridX, this.gridY) + 10; // Mais alto para ficar "na parede"
  }

  /**
   * Define stream de vídeo para exibir
   */
  setStream(stream, userId, userName) {
    // Limpar stream anterior
    this.clearStream();

    if (!stream) return;

    this.currentStream = stream;
    this.currentUserId = userId;

    try {
      // Criar elemento de vídeo
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;

      // Aguardar vídeo carregar
      this.videoElement.onloadedmetadata = () => {
        // Criar textura do vídeo
        const textureKey = `screen-${userId}-${Date.now()}`;

        if (this.scene.textures.exists(textureKey)) {
          this.scene.textures.remove(textureKey);
        }

        this.videoTexture = this.scene.textures.createCanvas(textureKey, 640, 360);
        const context = this.videoTexture.getContext();

        // Criar sprite de vídeo
        const width = this.config.width * ISO_CONFIG.TILE_WIDTH_HALF;
        const height = this.config.height * ISO_CONFIG.TILE_HEIGHT_HALF;

        this.videoSprite = this.scene.add.sprite(0, -height, textureKey);
        this.videoSprite.setDisplaySize(width * 2 - 4, height * 2 - 4);
        this.add(this.videoSprite);

        // Atualizar textura a cada frame
        this.updateVideoTexture = () => {
          if (this.videoElement && this.videoElement.readyState >= 2) {
            context.clearRect(0, 0, 640, 360);
            context.drawImage(this.videoElement, 0, 0, 640, 360);
            this.videoTexture.refresh();
          }
        };

        this.scene.events.on('update', this.updateVideoTexture);

        // Ocultar placeholder
        this.placeholderText.setVisible(false);

        // Mostrar label do usuário
        this.userLabel.setText(`📡 ${userName || 'Unknown User'}`);
        this.userLabel.setVisible(true);

        console.log(`SharedScreen: Displaying stream from ${userName} (${userId})`);
      };

      this.videoElement.onerror = (error) => {
        console.error('SharedScreen: Video element error:', error);
        this.clearStream();
      };
    } catch (error) {
      console.error('SharedScreen: Error setting stream:', error);
      this.clearStream();
    }
  }

  /**
   * Limpa stream atual
   */
  clearStream() {
    // Remover listener de update
    if (this.updateVideoTexture) {
      this.scene.events.off('update', this.updateVideoTexture);
      this.updateVideoTexture = null;
    }

    // Remover sprite de vídeo
    if (this.videoSprite) {
      this.videoSprite.destroy();
      this.videoSprite = null;
    }

    // Remover textura
    if (this.videoTexture) {
      const textureKey = this.videoTexture.key;
      if (this.scene.textures.exists(textureKey)) {
        this.scene.textures.remove(textureKey);
      }
      this.videoTexture = null;
    }

    // Parar vídeo
    if (this.videoElement) {
      if (this.videoElement.srcObject) {
        this.videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Resetar estado
    this.currentStream = null;
    this.currentUserId = null;

    // Mostrar placeholder
    if (this.placeholderText) {
      this.placeholderText.setVisible(true);
    }

    // Ocultar label do usuário
    if (this.userLabel) {
      this.userLabel.setVisible(false);
    }
  }

  /**
   * Retorna ID do usuário atual
   */
  getCurrentUserId() {
    return this.currentUserId;
  }

  /**
   * Verifica se está exibindo stream
   */
  isDisplayingStream() {
    return this.currentStream !== null;
  }

  /**
   * Retorna células ocupadas
   */
  getOccupiedCells() {
    const cells = [];
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
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
      gridX < this.gridX + this.config.width &&
      gridY >= this.gridY &&
      gridY < this.gridY + this.config.height
    );
  }

  /**
   * Destroi a tela
   */
  destroy(fromScene) {
    this.clearStream();

    if (this.frame) this.frame.destroy();
    if (this.screen) this.screen.destroy();
    if (this.placeholderText) this.placeholderText.destroy();
    if (this.label) this.label.destroy();
    if (this.userLabel) this.userLabel.destroy();
    if (this.shadow) this.shadow.destroy();

    super.destroy(fromScene);
  }
}

export default SharedScreen;
