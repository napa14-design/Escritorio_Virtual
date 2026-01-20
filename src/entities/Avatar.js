import Phaser from 'phaser';
import { cartesianToIsometric, calculateDepth } from '../utils/isometric';
import { AVATAR_CONFIG } from '../config/gameConfig';

/**
 * Avatar controlável pelo jogador (estilo Habbo)
 */
export class Avatar extends Phaser.GameObjects.Container {
  constructor(scene, gridX, gridY, customization = {}) {
    super(scene);

    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;

    // Customização
    this.customization = {
      skinColor: customization.skinColor || AVATAR_CONFIG.COLORS.SKIN[0],
      hairColor: customization.hairColor || AVATAR_CONFIG.COLORS.HAIR[0],
      shirtColor: customization.shirtColor || AVATAR_CONFIG.COLORS.SHIRT[0],
      pantsColor: customization.pantsColor || AVATAR_CONFIG.COLORS.PANTS[0],
    };

    // Estado
    this.isWalking = false;
    this.currentPath = [];
    this.pathIndex = 0;
    this.direction = 's'; // direção: n, ne, e, se, s, sw, w, nw
    this.isSpeaking = false;

    // Movimento
    this.moveSpeed = AVATAR_CONFIG.WALK_SPEED;

    // Inicializar
    this.createSprite();
    this.updatePosition();

    scene.add.existing(this);
  }

  /**
   * Cria sprite do avatar (proceduralmente)
   */
  createSprite() {
    // Body (camisa)
    this.body = this.scene.add.graphics();
    this.body.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.shirtColor).color);
    this.body.fillRect(-8, -16, 16, 20);
    this.add(this.body);

    // Legs (calça)
    this.legs = this.scene.add.graphics();
    this.legs.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.pantsColor).color);
    this.legs.fillRect(-8, 4, 16, 12);
    this.add(this.legs);

    // Head (cabeça)
    this.head = this.scene.add.graphics();
    this.head.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.skinColor).color);
    this.head.fillCircle(0, -20, 8);
    this.add(this.head);

    // Hair (cabelo)
    this.hair = this.scene.add.graphics();
    this.hair.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.hairColor).color);
    this.hair.fillCircle(0, -24, 9);
    this.add(this.hair);

    // Nome do usuário
    this.nameText = this.scene.add.text(0, -40, 'Player', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    // Sombra
    this.shadow = this.scene.add.ellipse(0, 8, 20, 10, 0x000000, 0.3);
    this.add(this.shadow);

    // Indicador de fala (círculo pulsante)
    this.speakingIndicator = this.scene.add.graphics();
    this.speakingIndicator.setVisible(false);
    this.add(this.speakingIndicator);

    // Indicador de status (círculo colorido)
    this.statusIndicator = this.scene.add.graphics();
    this.statusIndicator.setVisible(false);
    this.add(this.statusIndicator);
    this.currentStatusColor = 0x10b981; // Verde por padrão (disponível)

    // Círculo de proximidade (mostra range de voz)
    this.proximityCircle = this.scene.add.graphics();
    this.proximityCircle.setVisible(false);
    this.proximityCircle.setDepth(-1); // Atrás de tudo
    this.add(this.proximityCircle);
    this.drawProximityCircle();

    // Texto de emote (bolha de emote)
    this.emoteText = this.scene.add.text(0, -55, '', {
      fontSize: '32px',
      fontFamily: 'Arial',
    });
    this.emoteText.setOrigin(0.5);
    this.emoteText.setVisible(false);
    this.add(this.emoteText);
    this.emoteTimer = null;
  }

  /**
   * Atualiza posição isométrica baseada no grid
   */
  updatePosition() {
    const iso = cartesianToIsometric(this.gridX, this.gridY);
    this.x = iso.x;
    this.y = iso.y;
    this.depth = calculateDepth(this.gridX, this.gridY) + 1;
  }

  /**
   * Define caminho para seguir
   */
  setPath(path) {
    if (!path || path.length === 0) return;

    this.currentPath = path;
    this.pathIndex = 0;
    this.isWalking = true;
  }

  /**
   * Para o movimento
   */
  stopWalking() {
    this.isWalking = false;
    this.currentPath = [];
    this.pathIndex = 0;
  }

  /**
   * Define se o usuário está falando
   */
  setSpeaking(speaking) {
    this.isSpeaking = speaking;
    this.speakingIndicator.setVisible(speaking);

    if (speaking) {
      // Desenhar círculo pulsante verde
      this.speakingIndicator.clear();
      this.speakingIndicator.lineStyle(3, 0x10b981, 1);
      this.speakingIndicator.strokeCircle(0, -8, 25);
    }
  }

  /**
   * Define o status do usuário (cor do indicador)
   */
  setStatus(statusColor) {
    this.currentStatusColor = statusColor;
    this.statusIndicator.setVisible(true);

    // Desenhar círculo de status ao lado do nome
    this.statusIndicator.clear();
    this.statusIndicator.fillStyle(statusColor, 1);
    this.statusIndicator.fillCircle(-30, -40, 5);
  }

  /**
   * Mostra emote acima do avatar
   */
  showEmote(emoteIcon, duration = 2000) {
    // Limpar timer anterior se existir
    if (this.emoteTimer) {
      clearTimeout(this.emoteTimer);
    }

    // Mostrar emote
    this.emoteText.setText(emoteIcon);
    this.emoteText.setVisible(true);

    // Animação de entrada (escala)
    this.scene.tweens.add({
      targets: this.emoteText,
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
    });

    // Ocultar após duração
    this.emoteTimer = setTimeout(() => {
      // Animação de saída
      this.scene.tweens.add({
        targets: this.emoteText,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.emoteText.setVisible(false);
          this.emoteText.setAlpha(1);
          this.emoteText.setScale(1);
        },
      });
    }, duration);
  }

  /**
   * Desenha círculo de proximidade
   */
  drawProximityCircle(radius = 100, color = 0x3b82f6, alpha = 0.2) {
    this.proximityCircle.clear();
    this.proximityCircle.lineStyle(2, color, 0.5);
    this.proximityCircle.fillStyle(color, alpha);
    this.proximityCircle.fillCircle(0, 0, radius);
    this.proximityCircle.strokeCircle(0, 0, radius);
  }

  /**
   * Mostra círculo de proximidade
   */
  showProximityCircle(radius = 100) {
    this.drawProximityCircle(radius);
    this.proximityCircle.setVisible(true);
  }

  /**
   * Esconde círculo de proximidade
   */
  hideProximityCircle() {
    this.proximityCircle.setVisible(false);
  }

  /**
   * Define opacidade do avatar baseado na distância
   */
  setDistanceOpacity(distance, maxDistance) {
    // Opacidade varia de 1.0 (perto) a 0.3 (longe)
    const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
    this.setAlpha(opacity);
  }

  /**
   * Reseta opacidade
   */
  resetOpacity() {
    this.setAlpha(1.0);
  }

  /**
   * Atualiza movimento ao longo do caminho
   */
  update(time, delta) {
    // Atualizar animação do indicador de fala
    if (this.isSpeaking) {
      const pulse = Math.sin(time * 0.005) * 0.3 + 0.7;
      this.speakingIndicator.setAlpha(pulse);

      // Redesenhar com tamanho variável
      const radius = 25 + Math.sin(time * 0.008) * 3;
      this.speakingIndicator.clear();
      this.speakingIndicator.lineStyle(3, 0x10b981, 1);
      this.speakingIndicator.strokeCircle(0, -8, radius);
    }

    if (!this.isWalking || this.currentPath.length === 0) {
      this.playIdleAnimation();
      return;
    }

    if (this.pathIndex >= this.currentPath.length) {
      this.stopWalking();
      return;
    }

    const target = this.currentPath[this.pathIndex];
    const targetIso = cartesianToIsometric(target.x, target.y);

    // Calcular direção
    const dx = targetIso.x - this.x;
    const dy = targetIso.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Chegou ao waypoint
    if (distance < 2) {
      this.gridX = target.x;
      this.gridY = target.y;
      this.updatePosition();
      this.pathIndex++;

      // Verificar se chegou ao destino final
      if (this.pathIndex >= this.currentPath.length) {
        this.stopWalking();
      }

      return;
    }

    // Mover em direção ao target
    const moveDistance = (this.moveSpeed * delta) / 1000;
    const ratio = moveDistance / distance;

    this.x += dx * ratio;
    this.y += dy * ratio;

    // Atualizar direção baseada no movimento
    this.updateDirection(dx, dy);

    // Atualizar profundidade
    this.depth = calculateDepth(this.gridX, this.gridY) + 1;

    // Animação de caminhada
    this.playWalkAnimation();
  }

  /**
   * Atualiza direção baseada no vetor de movimento
   */
  updateDirection(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Converter ângulo para 4 direções principais (simplificado)
    if (angle >= -45 && angle < 45) {
      this.direction = 'e';
    } else if (angle >= 45 && angle < 135) {
      this.direction = 's';
    } else if (angle >= -135 && angle < -45) {
      this.direction = 'n';
    } else {
      this.direction = 'w';
    }
  }

  /**
   * Animação de caminhada (simples)
   */
  playWalkAnimation() {
    // Balanço simples ao caminhar
    const bounce = Math.sin(Date.now() * 0.01) * 2;
    this.y += bounce * 0.1;
  }

  /**
   * Animação idle
   */
  playIdleAnimation() {
    // Pequeno bounce quando parado
    const bounce = Math.sin(Date.now() * 0.002) * 1;
    this.body.y = bounce;
  }

  /**
   * Move para posição específica do grid
   */
  async moveToGrid(gridX, gridY, pathfinding) {
    try {
      const path = await pathfinding.findPath(
        this.gridX,
        this.gridY,
        gridX,
        gridY
      );

      if (path && path.length > 1) {
        // Remover primeiro ponto (posição atual)
        this.setPath(path.slice(1));
        return true;
      }
    } catch (error) {
      console.error('Failed to find path:', error);
    }

    return false;
  }

  /**
   * Atualizar customização
   */
  updateCustomization(newCustomization) {
    Object.assign(this.customization, newCustomization);

    // Redesenhar sprites
    if (this.body) {
      this.body.clear();
      this.body.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.shirtColor).color);
      this.body.fillRect(-8, -16, 16, 20);
    }

    if (this.legs) {
      this.legs.clear();
      this.legs.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.pantsColor).color);
      this.legs.fillRect(-8, 4, 16, 12);
    }

    if (this.head) {
      this.head.clear();
      this.head.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.skinColor).color);
      this.head.fillCircle(0, -20, 8);
    }

    if (this.hair) {
      this.hair.clear();
      this.hair.fillStyle(Phaser.Display.Color.HexStringToColor(this.customization.hairColor).color);
      this.hair.fillCircle(0, -24, 9);
    }
  }

  /**
   * Define nome do avatar
   */
  setName(name) {
    if (this.nameText) {
      this.nameText.setText(name);
    }
  }

  /**
   * Retorna posição atual no grid
   */
  getGridPosition() {
    return { x: this.gridX, y: this.gridY };
  }

  /**
   * Verifica se está em movimento
   */
  isMoving() {
    return this.isWalking;
  }

  /**
   * Destroi o avatar
   */
  destroy(fromScene) {
    if (this.body) this.body.destroy();
    if (this.legs) this.legs.destroy();
    if (this.head) this.head.destroy();
    if (this.hair) this.hair.destroy();
    if (this.nameText) this.nameText.destroy();
    if (this.shadow) this.shadow.destroy();
    if (this.speakingIndicator) this.speakingIndicator.destroy();

    super.destroy(fromScene);
  }
}

export default Avatar;
