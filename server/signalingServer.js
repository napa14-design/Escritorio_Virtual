/**
 * Servidor de Sinalização WebRTC + Sincronização Multiplayer
 *
 * Este servidor gerencia:
 * - Sincronização de posições de usuários
 * - Sinalização WebRTC para conexões peer-to-peer
 * - Estado de mídia (mute, vídeo)
 * - Chat em tempo real
 */

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Estado do servidor
const rooms = new Map();

/**
 * Estrutura de uma sala
 */
function createRoom(roomId, metadata = {}) {
  return {
    id: roomId,
    name: metadata.name || roomId,
    description: metadata.description || '',
    type: metadata.type || 'public', // public or private
    password: metadata.password || null,
    maxUsers: metadata.maxUsers || 50,
    users: new Map(),
    createdAt: Date.now(),
    createdBy: metadata.createdBy || null,
  };
}

/**
 * Estrutura de um usuário
 */
function createUser(userId, userData) {
  return {
    id: userId,
    name: userData.name || 'Player',
    position: userData.position || { x: 10, y: 10 },
    customization: userData.customization || null,
    status: userData.status || 'available',
    mediaState: {
      isMuted: true,
      isVideoEnabled: false,
      isScreenSharing: false,
      isSpeaking: false,
    },
    joinedAt: Date.now(),
  };
}

/**
 * Inicializa servidor
 */
function startServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('🚀 Signaling Server starting...');

  // Criar sala padrão
  if (!rooms.has('default-room')) {
    rooms.set('default-room', createRoom('default-room', {
      name: 'Main Office',
      description: 'The main virtual office space',
      type: 'public',
      maxUsers: 50,
    }));
  }

  // Eventos do Socket.io
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    /**
     * Listar todas as salas
     */
    socket.on('get-rooms', () => {
      const roomsList = Array.from(rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        maxUsers: room.maxUsers,
        userCount: room.users.size,
        createdAt: room.createdAt,
      }));

      socket.emit('rooms-list', roomsList);
    });

    /**
     * Criar nova sala
     */
    socket.on('create-room', ({ roomData }) => {
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newRoom = createRoom(roomId, {
        name: roomData.name,
        description: roomData.description,
        type: roomData.type,
        password: roomData.password,
        maxUsers: roomData.maxUsers,
        createdBy: socket.id,
      });

      rooms.set(roomId, newRoom);

      console.log(`🏢 Room created: ${roomData.name} (${roomId})`);

      // Notificar todos sobre nova sala
      io.emit('room-created', {
        id: newRoom.id,
        name: newRoom.name,
        description: newRoom.description,
        type: newRoom.type,
        maxUsers: newRoom.maxUsers,
        userCount: 0,
        createdAt: newRoom.createdAt,
      });

      socket.emit('room-create-success', { roomId });
    });

    /**
     * Validar senha e entrar em sala privada
     */
    socket.on('join-room-with-password', ({ roomId, password, userData }, callback) => {
      const room = rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found' });
        return;
      }

      if (room.type === 'private' && room.password !== password) {
        callback({ success: false, error: 'Incorrect password' });
        return;
      }

      if (room.users.size >= room.maxUsers) {
        callback({ success: false, error: 'Room is full' });
        return;
      }

      callback({ success: true });
    });

    /**
     * Usuário entra em uma sala
     */
    socket.on('join-room', ({ roomId, userData }) => {
      console.log(`👤 ${socket.id} joining room: ${roomId}`);

      // Criar sala se não existe
      if (!rooms.has(roomId)) {
        rooms.set(roomId, createRoom(roomId));
      }

      const room = rooms.get(roomId);
      const user = createUser(socket.id, userData);

      // Adicionar usuário à sala
      room.users.set(socket.id, user);
      socket.join(roomId);

      // Enviar estado atual da sala para o novo usuário
      socket.emit('room-state', {
        roomId,
        users: Array.from(room.users.values()),
      });

      // Notificar outros usuários sobre novo usuário
      socket.to(roomId).emit('user-joined', user);

      console.log(`📊 Room ${roomId} now has ${room.users.size} users`);
    });

    /**
     * Usuário sai da sala
     */
    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(socket, roomId);
    });

    /**
     * Atualizar posição
     */
    socket.on('update-position', ({ roomId, position }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (!user) return;

      user.position = position;

      // Broadcast para outros usuários na sala
      socket.to(roomId).emit('user-moved', {
        userId: socket.id,
        position,
      });
    });

    /**
     * Atualizar estado de mídia
     */
    socket.on('update-media', ({ roomId, mediaState }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (!user) return;

      user.mediaState = { ...user.mediaState, ...mediaState };

      // Broadcast para outros usuários na sala
      socket.to(roomId).emit('user-media-changed', {
        userId: socket.id,
        mediaState: user.mediaState,
      });
    });

    /**
     * Atualizar customização do avatar
     */
    socket.on('update-customization', ({ roomId, customization }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (!user) return;

      user.customization = customization;

      // Broadcast para outros usuários na sala
      socket.to(roomId).emit('user-customization-changed', {
        userId: socket.id,
        customization,
      });
    });

    /**
     * Atualizar status do usuário
     */
    socket.on('update-status', ({ roomId, status }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (!user) return;

      user.status = status;

      // Broadcast para outros usuários na sala
      socket.to(roomId).emit('user-status-changed', {
        userId: socket.id,
        status,
      });
    });

    /**
     * Enviar emote
     */
    socket.on('send-emote', ({ roomId, emote }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Broadcast para outros usuários na sala
      socket.to(roomId).emit('user-emote', {
        userId: socket.id,
        emote,
      });
    });

    /**
     * Sinalização WebRTC
     */
    socket.on('webrtc-signal', ({ targetUserId, signal, senderId }) => {
      console.log(`🔄 Relaying WebRTC signal from ${senderId} to ${targetUserId}`);

      // Enviar sinal para o usuário específico
      io.to(targetUserId).emit('webrtc-signal', {
        senderId: senderId || socket.id,
        signal,
      });
    });

    /**
     * Mensagem de chat
     */
    socket.on('chat-message', ({ roomId, message }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.users.get(socket.id);
      if (!user) return;

      // Broadcast mensagem para a sala
      io.to(roomId).emit('chat-message', {
        userId: socket.id,
        userName: user.name,
        message,
        timestamp: Date.now(),
      });
    });

    /**
     * Ação do whiteboard
     */
    socket.on('whiteboard-action', ({ roomId, action }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Broadcast ação para outros usuários na sala
      socket.to(roomId).emit('whiteboard-action', action);
    });

    /**
     * Knock/Poke
     */
    socket.on('send-knock', ({ roomId, targetUserId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const fromUser = room.users.get(socket.id);
      if (!fromUser) return;

      // Enviar knock para o usuário específico
      io.to(targetUserId).emit('knock-received', {
        fromUserId: socket.id,
        fromUserName: fromUser.name,
      });

      console.log(`👋 ${fromUser.name} knocked ${targetUserId}`);
    });

    /**
     * Mensagem privada
     */
    socket.on('send-private-message', ({ roomId, targetUserId, message }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const fromUser = room.users.get(socket.id);
      if (!fromUser) return;

      // Enviar mensagem para o usuário específico
      io.to(targetUserId).emit('private-message', {
        fromUserId: socket.id,
        fromUserName: fromUser.name,
        message,
        timestamp: Date.now(),
      });

      console.log(`💬 ${fromUser.name} sent private message to ${targetUserId}`);
    });

    /**
     * Desconexão
     */
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);

      // Remover usuário de todas as salas
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          handleUserLeave(socket, roomId);
        }
      });
    });

    /**
     * Erro
     */
    socket.on('error', (error) => {
      console.error(`⚠️  Socket error from ${socket.id}:`, error);
    });
  });

  /**
   * Handle de saída de usuário
   */
  function handleUserLeave(socket, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Remover usuário
    room.users.delete(socket.id);
    socket.leave(roomId);

    // Notificar outros usuários
    socket.to(roomId).emit('user-left', socket.id);

    console.log(`👋 ${socket.id} left room ${roomId}`);
    console.log(`📊 Room ${roomId} now has ${room.users.size} users`);

    // Remover sala se vazia
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} deleted (empty)`);
    }
  }

  // Iniciar servidor HTTP
  httpServer.listen(PORT, () => {
    console.log(`✅ Signaling Server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${CORS_ORIGIN}`);
    console.log(`📡 WebRTC signaling ready`);
  });

  // Logs periódicos
  setInterval(() => {
    console.log(`📊 Status: ${rooms.size} room(s), Total users: ${
      Array.from(rooms.values()).reduce((sum, room) => sum + room.users.size, 0)
    }`);
  }, 30000);

  return io;
}

// Iniciar servidor
startServer();
