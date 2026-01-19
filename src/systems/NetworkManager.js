import { io } from 'socket.io-client';

/**
 * NetworkManager - Gerencia conexão Socket.io e sincronização multiplayer
 */
export class NetworkManager {
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.localUserId = null;
    this.roomId = 'default-room';
    this.connected = false;
    this.callbacks = {
      onUserJoined: null,
      onUserLeft: null,
      onUserMoved: null,
      onUserMediaChanged: null,
      onUserCustomizationChanged: null,
      onUserStatusChanged: null,
      onUserEmote: null,
      onWebRTCSignal: null,
      onWhiteboardAction: null,
      onConnected: null,
      onDisconnected: null,
    };
  }

  /**
   * Conecta ao servidor
   */
  connect(userData = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
        });

        this.setupEventHandlers();

        this.socket.on('connect', () => {
          console.log('Connected to server:', this.socket.id);
          this.localUserId = this.socket.id;
          this.connected = true;

          // Entrar na sala
          this.joinRoom(this.roomId, userData);

          if (this.callbacks.onConnected) {
            this.callbacks.onConnected(this.localUserId);
          }

          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Configura event handlers do Socket.io
   */
  setupEventHandlers() {
    // Usuário entrou
    this.socket.on('user-joined', (userData) => {
      console.log('User joined:', userData);
      if (this.callbacks.onUserJoined) {
        this.callbacks.onUserJoined(userData);
      }
    });

    // Usuário saiu
    this.socket.on('user-left', (userId) => {
      console.log('User left:', userId);
      if (this.callbacks.onUserLeft) {
        this.callbacks.onUserLeft(userId);
      }
    });

    // Usuário se moveu
    this.socket.on('user-moved', ({ userId, position }) => {
      if (this.callbacks.onUserMoved) {
        this.callbacks.onUserMoved(userId, position);
      }
    });

    // Estado de mídia mudou
    this.socket.on('user-media-changed', ({ userId, mediaState }) => {
      if (this.callbacks.onUserMediaChanged) {
        this.callbacks.onUserMediaChanged(userId, mediaState);
      }
    });

    // Customização mudou
    this.socket.on('user-customization-changed', ({ userId, customization }) => {
      if (this.callbacks.onUserCustomizationChanged) {
        this.callbacks.onUserCustomizationChanged(userId, customization);
      }
    });

    // Status mudou
    this.socket.on('user-status-changed', ({ userId, status }) => {
      if (this.callbacks.onUserStatusChanged) {
        this.callbacks.onUserStatusChanged(userId, status);
      }
    });

    // Emote recebido
    this.socket.on('user-emote', ({ userId, emote }) => {
      if (this.callbacks.onUserEmote) {
        this.callbacks.onUserEmote(userId, emote);
      }
    });

    // Sinal WebRTC
    this.socket.on('webrtc-signal', ({ senderId, signal }) => {
      if (this.callbacks.onWebRTCSignal) {
        this.callbacks.onWebRTCSignal(senderId, signal);
      }
    });

    // Ação do whiteboard
    this.socket.on('whiteboard-action', (action) => {
      if (this.callbacks.onWhiteboardAction) {
        this.callbacks.onWhiteboardAction(action);
      }
    });

    // Estado da sala
    this.socket.on('room-state', (roomState) => {
      console.log('Room state:', roomState);
      // Processar usuários existentes na sala
      if (roomState.users && this.callbacks.onUserJoined) {
        Object.values(roomState.users).forEach(user => {
          if (user.id !== this.localUserId) {
            this.callbacks.onUserJoined(user);
          }
        });
      }
    });

    // Desconexão
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.connected = false;

      if (this.callbacks.onDisconnected) {
        this.callbacks.onDisconnected(reason);
      }
    });

    // Erro
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  /**
   * Entra em uma sala
   */
  joinRoom(roomId, userData = {}) {
    this.roomId = roomId;

    this.socket.emit('join-room', {
      roomId,
      userData: {
        id: this.localUserId,
        name: userData.name || 'Player',
        position: userData.position || { x: 10, y: 10 },
        ...userData,
      },
    });
  }

  /**
   * Sai da sala
   */
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
    }
  }

  /**
   * Envia atualização de posição
   */
  updatePosition(position) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('update-position', {
      roomId: this.roomId,
      position,
    });
  }

  /**
   * Envia atualização de estado de mídia
   */
  updateMediaState(mediaState) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('update-media', {
      roomId: this.roomId,
      mediaState,
    });
  }

  /**
   * Envia atualização de customização de avatar
   */
  updateCustomization(customization) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('update-customization', {
      roomId: this.roomId,
      customization,
    });
  }

  /**
   * Envia atualização de status
   */
  updateStatus(status) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('update-status', {
      roomId: this.roomId,
      status,
    });
  }

  /**
   * Envia emote
   */
  sendEmote(emote) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('send-emote', {
      roomId: this.roomId,
      emote,
    });
  }

  /**
   * Envia ação do whiteboard
   */
  sendWhiteboardAction(action) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('whiteboard-action', {
      roomId: this.roomId,
      action,
    });
  }

  /**
   * Envia mensagem de chat
   */
  sendChatMessage(message) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('chat-message', {
      roomId: this.roomId,
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Envia sinal WebRTC para outro usuário
   */
  sendWebRTCSignal(targetUserId, signal) {
    if (!this.socket || !this.connected) return;

    this.socket.emit('webrtc-signal', {
      targetUserId,
      signal,
      senderId: this.localUserId,
    });
  }

  /**
   * Define callback para eventos
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  /**
   * Desconecta do servidor
   */
  disconnect() {
    if (this.socket) {
      this.leaveRoom();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Verifica se está conectado
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  /**
   * Retorna ID do usuário local
   */
  getLocalUserId() {
    return this.localUserId;
  }

  /**
   * Retorna socket
   */
  getSocket() {
    return this.socket;
  }
}

export default NetworkManager;
