import { SharedScreen } from '../entities/SharedScreen';

/**
 * SharedScreenManager - Gerencia telas compartilhadas no escritório
 * Automaticamente exibe streams de usuários que estão compartilhando tela
 */
export class SharedScreenManager {
  constructor(scene) {
    this.scene = scene;
    this.screens = [];
    this.screenAssignments = new Map(); // userId -> screenIndex
  }

  /**
   * Adiciona uma tela compartilhada à cena
   */
  addScreen(gridX, gridY, config = {}) {
    const screen = new SharedScreen(this.scene, gridX, gridY, config);
    this.screens.push(screen);
    return screen;
  }

  /**
   * Remove uma tela compartilhada
   */
  removeScreen(screen) {
    const index = this.screens.indexOf(screen);
    if (index === -1) return;

    screen.destroy();
    this.screens.splice(index, 1);

    // Atualizar assignments
    this.screenAssignments.forEach((screenIndex, userId) => {
      if (screenIndex === index) {
        this.screenAssignments.delete(userId);
      } else if (screenIndex > index) {
        this.screenAssignments.set(userId, screenIndex - 1);
      }
    });
  }

  /**
   * Atribui stream de um usuário a uma tela disponível
   */
  assignStreamToScreen(userId, userName, stream) {
    if (!stream) {
      console.warn('SharedScreenManager: No stream provided');
      return false;
    }

    // Verificar se usuário já tem uma tela atribuída
    if (this.screenAssignments.has(userId)) {
      const screenIndex = this.screenAssignments.get(userId);
      const screen = this.screens[screenIndex];
      if (screen) {
        screen.setStream(stream, userId, userName);
        return true;
      }
    }

    // Procurar primeira tela disponível
    for (let i = 0; i < this.screens.length; i++) {
      const screen = this.screens[i];
      if (!screen.isDisplayingStream()) {
        screen.setStream(stream, userId, userName);
        this.screenAssignments.set(userId, i);
        console.log(`SharedScreenManager: Assigned ${userName} to screen ${i}`);
        return true;
      }
    }

    console.warn('SharedScreenManager: No available screens');
    return false;
  }

  /**
   * Remove stream de um usuário
   */
  removeUserStream(userId) {
    if (!this.screenAssignments.has(userId)) {
      return;
    }

    const screenIndex = this.screenAssignments.get(userId);
    const screen = this.screens[screenIndex];

    if (screen) {
      screen.clearStream();
      console.log(`SharedScreenManager: Removed stream from user ${userId}`);
    }

    this.screenAssignments.delete(userId);
  }

  /**
   * Limpa todas as telas
   */
  clearAllScreens() {
    this.screens.forEach(screen => {
      screen.clearStream();
    });
    this.screenAssignments.clear();
  }

  /**
   * Retorna tela de um usuário
   */
  getScreenForUser(userId) {
    if (!this.screenAssignments.has(userId)) {
      return null;
    }

    const screenIndex = this.screenAssignments.get(userId);
    return this.screens[screenIndex] || null;
  }

  /**
   * Retorna todas as telas
   */
  getAllScreens() {
    return this.screens;
  }

  /**
   * Retorna número de telas disponíveis
   */
  getAvailableScreenCount() {
    return this.screens.filter(screen => !screen.isDisplayingStream()).length;
  }

  /**
   * Destroi todas as telas
   */
  destroy() {
    this.screens.forEach(screen => {
      screen.destroy();
    });
    this.screens = [];
    this.screenAssignments.clear();
  }
}

export default SharedScreenManager;
