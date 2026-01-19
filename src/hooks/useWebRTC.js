import { useState, useRef, useEffect, useCallback } from 'react';
import SimplePeer from 'simple-peer';

/**
 * Hook para gerenciar conexões WebRTC com outros usuários
 */
export function useWebRTC(socket, localUserId) {
  const [connections, setConnections] = useState(new Map());
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);

  const connectionsRef = useRef(new Map());
  const localStreamRef = useRef(null);

  // Sincronizar refs com state
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  /**
   * Inicializa captura de mídia local (áudio/vídeo)
   */
  const initializeMedia = useCallback(async (audioEnabled = true, videoEnabled = false, customConstraints = null) => {
    try {
      // Usar constraints customizadas ou padrão
      const constraints = customConstraints || {
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: videoEnabled ? {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 },
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;
      setLocalStream(stream);
      setError(null);

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Cria conexão peer-to-peer com outro usuário
   */
  const createPeerConnection = useCallback((targetUserId, initiator = false) => {
    if (!localStreamRef.current) {
      console.warn('No local stream available');
      return null;
    }

    // Verificar se já existe conexão
    if (connectionsRef.current.has(targetUserId)) {
      return connectionsRef.current.get(targetUserId);
    }

    console.log(`Creating peer connection with ${targetUserId} (initiator: ${initiator})`);

    const peer = new SimplePeer({
      initiator,
      stream: localStreamRef.current,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    const connectionData = {
      peer,
      userId: targetUserId,
      remoteStream: null,
      currentVolume: 0,
      isConnected: false,
      audioEnabled: true,
      videoEnabled: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 3,
      lastConnected: Date.now(),
    };

    // Eventos do peer
    peer.on('signal', (signal) => {
      // Enviar sinal via socket para o outro usuário
      if (socket && socket.connected) {
        socket.emit('webrtc-signal', {
          targetUserId,
          signal,
          senderId: localUserId,
        });
      }
    });

    peer.on('stream', (stream) => {
      console.log(`Received remote stream from ${targetUserId}`);
      connectionData.remoteStream = stream;

      // Atualizar state
      setConnections(new Map(connectionsRef.current));
    });

    peer.on('connect', () => {
      console.log(`Connected to ${targetUserId}`);
      connectionData.isConnected = true;
      connectionData.reconnectAttempts = 0;
      connectionData.lastConnected = Date.now();
      setConnections(new Map(connectionsRef.current));
    });

    peer.on('error', (err) => {
      console.error(`Peer connection error with ${targetUserId}:`, err);

      // Tentar reconectar se não excedeu limite
      if (connectionData.reconnectAttempts < connectionData.maxReconnectAttempts) {
        connectionData.reconnectAttempts++;
        console.log(`Attempting reconnect ${connectionData.reconnectAttempts}/${connectionData.maxReconnectAttempts} for ${targetUserId}`);

        // Aguardar antes de reconectar (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, connectionData.reconnectAttempts - 1), 8000);

        setTimeout(() => {
          // Remover conexão antiga
          if (connectionData.peer) {
            connectionData.peer.destroy();
          }

          // Criar nova conexão
          connectionsRef.current.delete(targetUserId);
          createPeerConnection(targetUserId, true);
        }, delay);
      } else {
        // Excedeu tentativas, remover definitivamente
        removePeerConnection(targetUserId);
      }
    });

    peer.on('close', () => {
      console.log(`Connection closed with ${targetUserId}`);

      // Se fechou recentemente (< 5s após conectar), pode ser erro
      const timeSinceConnect = Date.now() - connectionData.lastConnected;
      if (timeSinceConnect < 5000 && connectionData.reconnectAttempts < connectionData.maxReconnectAttempts) {
        connectionData.reconnectAttempts++;
        console.log(`Connection closed too soon, attempting reconnect for ${targetUserId}`);

        setTimeout(() => {
          connectionsRef.current.delete(targetUserId);
          createPeerConnection(targetUserId, true);
        }, 2000);
      } else {
        removePeerConnection(targetUserId);
      }
    });

    // Adicionar ao map
    connectionsRef.current.set(targetUserId, connectionData);
    setConnections(new Map(connectionsRef.current));

    return connectionData;
  }, [socket, localUserId]);

  /**
   * Processa sinal WebRTC recebido
   */
  const handleSignal = useCallback((senderId, signal) => {
    let connection = connectionsRef.current.get(senderId);

    if (!connection) {
      // Criar nova conexão como receptor
      connection = createPeerConnection(senderId, false);
    }

    if (connection && connection.peer) {
      try {
        connection.peer.signal(signal);
      } catch (err) {
        console.error('Error processing signal:', err);
      }
    }
  }, [createPeerConnection]);

  /**
   * Remove conexão peer
   */
  const removePeerConnection = useCallback((userId) => {
    const connection = connectionsRef.current.get(userId);

    if (connection) {
      if (connection.peer) {
        connection.peer.destroy();
      }

      connectionsRef.current.delete(userId);
      setConnections(new Map(connectionsRef.current));
    }
  }, []);

  /**
   * Ajusta volume do áudio remoto
   */
  const setRemoteVolume = useCallback((userId, volume) => {
    const connection = connectionsRef.current.get(userId);

    if (connection && connection.remoteStream) {
      const audioTracks = connection.remoteStream.getAudioTracks();

      // SimplePeer não permite controlar volume diretamente
      // Precisamos usar Web Audio API
      audioTracks.forEach(track => {
        track.enabled = volume > 0;
      });

      connection.currentVolume = volume;
    }
  }, []);

  /**
   * Muta/desmuta áudio local
   */
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      return !audioTracks[0]?.enabled;
    }
    return false;
  }, []);

  /**
   * Liga/desliga vídeo local
   */
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      return videoTracks[0]?.enabled || false;
    }
    return false;
  }, []);

  /**
   * Inicia compartilhamento de tela
   */
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false,
      });

      // Substituir track de vídeo em todas as conexões
      const screenTrack = screenStream.getVideoTracks()[0];

      connectionsRef.current.forEach((connection) => {
        if (connection.peer && connection.peer._pc) {
          const sender = connection.peer._pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }
      });

      // Guardar referência ao stream original
      const originalStream = localStreamRef.current;

      // Quando o compartilhamento parar (usuário clica em "Parar compartilhamento")
      screenTrack.onended = () => {
        stopScreenShare(originalStream);
      };

      return screenStream;
    } catch (err) {
      console.error('Error starting screen share:', err);
      throw err;
    }
  }, []);

  /**
   * Para compartilhamento de tela
   */
  const stopScreenShare = useCallback((originalStream) => {
    if (!originalStream) {
      originalStream = localStreamRef.current;
    }

    // Restaurar track de vídeo original em todas as conexões
    const originalVideoTrack = originalStream?.getVideoTracks()[0];

    connectionsRef.current.forEach((connection) => {
      if (connection.peer && connection.peer._pc && originalVideoTrack) {
        const sender = connection.peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(originalVideoTrack);
        }
      }
    });
  }, []);

  /**
   * Obtém stream remoto de um usuário
   */
  const getRemoteStream = useCallback((userId) => {
    const connection = connectionsRef.current.get(userId);
    return connection?.remoteStream || null;
  }, []);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      // Fechar todas as conexões
      connectionsRef.current.forEach((connection) => {
        if (connection.peer) {
          connection.peer.destroy();
        }
      });

      // Parar stream local
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    connections,
    localStream,
    error,
    initializeMedia,
    createPeerConnection,
    handleSignal,
    removePeerConnection,
    setRemoteVolume,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    getRemoteStream,
  };
}

export default useWebRTC;
