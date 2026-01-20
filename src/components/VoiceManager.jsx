import React, { useEffect, useState, useCallback, useRef } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import useVoiceActivityDetection, { useRemoteVoiceActivityDetection } from '../hooks/useVoiceActivityDetection';
import useProximityVoice from '../hooks/useProximityVoice';
import useAutoAway from '../hooks/useAutoAway';
import useEmoteShortcuts from '../hooks/useEmoteShortcuts';
import NetworkManager from '../systems/NetworkManager';
import AudioControls from '../ui/AudioControls';
import ProximityVideoPanel from '../ui/ProximityVideoPanel';
import ChatManager from './ChatManager';
import SettingsModal from '../ui/SettingsModal';
import ScreenSharePreview from '../ui/ScreenSharePreview';
import StatusSelector from '../ui/StatusSelector';
import EmoteSelector from '../ui/EmoteSelector';
import Whiteboard from '../ui/Whiteboard';
import NearbyUsersList from '../ui/NearbyUsersList';
import UserActionsMenu from '../ui/UserActionsMenu';
import UserProfileModal from '../ui/UserProfileModal';
import RoomSelector from '../ui/RoomSelector';
import CreateRoomModal from '../ui/CreateRoomModal';
import ActivityLog from '../ui/ActivityLog';
import useFollowMode from '../hooks/useFollowMode';
import useProximityNotifications from '../hooks/useProximityNotifications';
import { getSoundManager } from '../utils/soundManager';
import { useToast } from '../ui/Toast';
import { DEFAULT_AUDIO_ZONES, findZoneAtPosition } from '../config/audioZones';
import { DEFAULT_STATUS, STATUS_CONFIG } from '../config/userStatus';
import { EMOTE_CONFIG } from '../config/emotes';
import { loadSettings, saveSettings, settingsToMediaConstraints, settingsToVADConfig } from '../utils/settingsStorage';

/**
 * VoiceManager - Componente que gerencia todo o sistema de voz/vídeo
 */
export function VoiceManager({
  phaserGame,
  currentUser,
  serverUrl = 'http://localhost:3001'
}) {
  const [networkManager, setNetworkManager] = useState(null);
  const [localUserId, setLocalUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userStatus, setUserStatus] = useState(DEFAULT_STATUS);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('default-room');
  const [isRoomSelectorOpen, setIsRoomSelectorOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [activityEvents, setActivityEvents] = useState([]);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const networkRef = useRef(null);
  const remoteAvatarsRef = useRef(new Map());
  const toast = useToast();
  const audioZones = DEFAULT_AUDIO_ZONES;
  const soundManager = getSoundManager();

  // Auto-away detection
  useAutoAway(userStatus, setUserStatus);

  // Follow mode
  const { followingUserId, isFollowing, startFollowing, stopFollowing } = useFollowMode(phaserGame, allUsers);

  /**
   * Adiciona evento ao activity log
   */
  const addActivityEvent = useCallback((type, text) => {
    setActivityEvents(prev => [...prev, {
      type,
      text,
      timestamp: Date.now(),
    }]);
  }, []);

  // Configurar gerenciador de som
  useEffect(() => {
    soundManager.setEnabled(soundsEnabled);
  }, [soundsEnabled, soundManager]);

  // WebRTC hook
  const {
    connections,
    localStream,
    error: webRTCError,
    initializeMedia,
    createPeerConnection,
    handleSignal,
    removePeerConnection,
    setRemoteVolume,
    toggleMute: webRTCToggleMute,
    toggleVideo: webRTCToggleVideo,
    startScreenShare,
    stopScreenShare,
    getRemoteStream,
  } = useWebRTC(networkManager?.getSocket(), localUserId);

  // Voice Activity Detection
  const vadConfig = settingsToVADConfig(settings);
  const { isSpeaking, audioLevel } = useVoiceActivityDetection(localStream, vadConfig);
  const { speakingUsers, isUserSpeaking } = useRemoteVoiceActivityDetection(connections);

  // Proximity Voice
  const currentUserPosition = currentUser?.position;
  const { getNearbyUsers } = useProximityVoice(
    currentUserPosition,
    allUsers,
    connections,
    setRemoteVolume,
    audioZones
  );

  /**
   * Inicializa NetworkManager
   */
  useEffect(() => {
    const manager = new NetworkManager(serverUrl);
    networkRef.current = manager;
    setNetworkManager(manager);

    // Conectar ao servidor
    manager.connect({
      name: currentUser?.name || 'Player',
      position: currentUser?.position || { x: 10, y: 10 },
      customization: currentUser?.customization || null,
    }).then(() => {
      const userId = manager.getLocalUserId();
      console.log('Connected to server with ID:', userId);
      setLocalUserId(userId);
      setIsConnected(true);
    }).catch((err) => {
      console.error('Failed to connect:', err);
    });

    // Event handlers
    manager.on('userJoined', handleUserJoined);
    manager.on('userLeft', handleUserLeft);
    manager.on('userMoved', handleUserMoved);
    manager.on('userMediaChanged', handleUserMediaChanged);
    manager.on('userCustomizationChanged', handleUserCustomizationChanged);
    manager.on('userStatusChanged', handleUserStatusChanged);
    manager.on('userEmote', handleUserEmote);
    manager.on('webRTCSignal', handleWebRTCSignal);
    manager.on('knock', handleKnock);
    manager.on('privateMessage', handlePrivateMessage);

    return () => {
      manager.disconnect();
    };
  }, [serverUrl]);

  /**
   * Inicializa mídia quando conectado
   */
  useEffect(() => {
    if (isConnected && !localStream) {
      const constraints = settingsToMediaConstraints(settings, isVideoEnabled);
      initializeMedia(true, isVideoEnabled, constraints)
        .then(() => {
          toast.success('Conectado ao escritório virtual', {
            title: 'Bem-vindo!',
            duration: 3000,
          });
        })
        .catch((err) => {
          console.error('Failed to initialize media:', err);
          toast.error('Não foi possível acessar microfone/câmera', {
            title: 'Erro de Mídia',
            duration: 5000,
          });
        });
    }
  }, [isConnected, localStream, initializeMedia, toast, settings, isVideoEnabled]);

  /**
   * Atualiza posição do usuário atual quando muda
   */
  useEffect(() => {
    if (networkManager && currentUserPosition) {
      networkManager.updatePosition(currentUserPosition);
    }
  }, [currentUserPosition, networkManager]);

  /**
   * Detecta quando usuário entra/sai de uma zona
   */
  useEffect(() => {
    if (!currentUserPosition) return;

    const zone = findZoneAtPosition(currentUserPosition.x, currentUserPosition.y, audioZones);

    // Mudou de zona
    if (zone?.id !== currentZone?.id) {
      // Saiu de uma zona
      if (currentZone && !zone) {
        toast.info(`Você saiu de: ${currentZone.name}`, {
          duration: 2000,
        });
      }

      // Entrou em uma zona
      if (zone && zone.id !== currentZone?.id) {
        toast.info(`${zone.icon} ${zone.name}`, {
          title: 'Você entrou em',
          duration: 3000,
        });
      }

      setCurrentZone(zone);
    }
  }, [currentUserPosition, audioZones, currentZone, toast]);

  /**
   * Atualiza indicador de fala do avatar local
   */
  useEffect(() => {
    if (phaserGame && isSpeaking) {
      const scene = phaserGame.scene.scenes[0];
      if (scene?.player) {
        scene.player.setSpeaking(isSpeaking);
      }
    }
  }, [phaserGame, isSpeaking]);

  /**
   * Atualiza indicadores de fala dos avatares remotos
   */
  useEffect(() => {
    speakingUsers.forEach(userId => {
      const avatar = remoteAvatarsRef.current.get(userId);
      if (avatar) {
        avatar.setSpeaking(true);
      }
    });

    // Limpar indicadores de quem não está falando
    remoteAvatarsRef.current.forEach((avatar, userId) => {
      if (!speakingUsers.has(userId)) {
        avatar.setSpeaking(false);
      }
    });
  }, [speakingUsers]);

  /**
   * Sincroniza customização quando muda
   */
  useEffect(() => {
    if (networkManager && isConnected && currentUser?.customization) {
      networkManager.updateCustomization(currentUser.customization);
    }
  }, [networkManager, isConnected, currentUser?.customization]);

  /**
   * Handle usuário entrou
   */
  const handleUserJoined = useCallback((userData) => {
    console.log('User joined:', userData);

    // Som e notificação
    soundManager.play('userJoined');
    addActivityEvent('user-joined', `${userData.name} joined the room`);

    // Adicionar à lista de usuários
    setAllUsers(prev => {
      const existing = prev.find(u => u.id === userData.id);
      if (existing) return prev;
      return [...prev, { ...userData, isLocalUser: false }];
    });

    // Criar avatar no Phaser
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene) {
        const avatar = scene.addRemoteAvatar(userData);
        remoteAvatarsRef.current.set(userData.id, avatar);
      }
    }

    // Iniciar conexão WebRTC se temos stream local
    if (localStream) {
      createPeerConnection(userData.id, true);
    }

    // Notificação toast
    toast.info(`${userData.name} entrou no escritório`, {
      duration: 3000,
    });
  }, [phaserGame, localStream, createPeerConnection, toast, soundManager, addActivityEvent]);

  /**
   * Handle usuário saiu
   */
  const handleUserLeft = useCallback((userId) => {
    console.log('User left:', userId);

    // Pegar nome antes de remover
    const user = allUsers.find(u => u.id === userId);
    const userName = user?.name || 'User';

    // Som e notificação
    soundManager.play('userLeft');
    addActivityEvent('user-left', `${userName} left the room`);

    // Remover da lista
    setAllUsers(prev => prev.filter(u => u.id !== userId));

    // Remover avatar do Phaser
    const avatar = remoteAvatarsRef.current.get(userId);
    if (avatar) {
      avatar.destroy();
      remoteAvatarsRef.current.delete(userId);
    }

    // Fechar conexão WebRTC
    removePeerConnection(userId);

    // Notificação toast
    toast.info(`${userName} saiu do escritório`, {
      duration: 3000,
    });
  }, [removePeerConnection, allUsers, toast, soundManager, addActivityEvent]);

  /**
   * Handle usuário se moveu
   */
  const handleUserMoved = useCallback((userId, position) => {
    // Atualizar posição na lista
    setAllUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, position } : u
    ));

    // Atualizar avatar no Phaser
    const avatar = remoteAvatarsRef.current.get(userId);
    if (avatar) {
      avatar.moveToGrid(position.x, position.y, phaserGame?.scene?.scenes[0]?.pathfinding);
    }
  }, [phaserGame]);

  /**
   * Handle estado de mídia mudou
   */
  const handleUserMediaChanged = useCallback((userId, mediaState) => {
    setAllUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, mediaState } : u
    ));

    // Gerenciar compartilhamento de tela em SharedScreens
    if (phaserGame && mediaState.isScreenSharing !== undefined) {
      const scene = phaserGame.scene.scenes[0];
      const screenManager = scene?.getSharedScreenManager();

      if (screenManager) {
        if (mediaState.isScreenSharing) {
          // Usuário começou a compartilhar - tentar obter stream
          const stream = getRemoteStream(userId);
          if (stream) {
            const user = allUsers.find(u => u.id === userId);
            const userName = user?.name || 'Unknown User';
            screenManager.assignStreamToScreen(userId, userName, stream);
            console.log(`Assigned screen share from ${userName} to shared screen`);
          } else {
            console.warn(`No remote stream available for ${userId}`);
          }
        } else {
          // Usuário parou de compartilhar
          screenManager.removeUserStream(userId);
          console.log(`Removed screen share from user ${userId}`);
        }
      }
    }
  }, [phaserGame, getRemoteStream, allUsers]);

  /**
   * Handle customização mudou
   */
  const handleUserCustomizationChanged = useCallback((userId, customization) => {
    console.log('User customization changed:', userId, customization);

    // Atualizar avatar remoto no Phaser
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene) {
        const avatar = remoteAvatarsRef.current.get(userId);
        if (avatar) {
          avatar.updateCustomization(customization);
        }
      }
    }

    // Atualizar estado
    setAllUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, customization } : u
    ));
  }, [phaserGame]);

  /**
   * Handle status mudou
   */
  const handleUserStatusChanged = useCallback((userId, status) => {
    console.log('User status changed:', userId, status);

    // Atualizar indicador no avatar remoto
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene) {
        const avatar = remoteAvatarsRef.current.get(userId);
        if (avatar && STATUS_CONFIG[status]) {
          const statusColor = Phaser.Display.Color.HexStringToColor(STATUS_CONFIG[status].color).color;
          avatar.setStatus(statusColor);
        }
      }
    }

    // Atualizar estado
    setAllUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status } : u
    ));
  }, [phaserGame]);

  /**
   * Handle sinal WebRTC
   */
  const handleWebRTCSignal = useCallback((senderId, signal) => {
    handleSignal(senderId, signal);
  }, [handleSignal]);

  /**
   * Toggle mute
   */
  const handleToggleMute = useCallback(() => {
    const muted = webRTCToggleMute();
    setIsMuted(muted);

    if (networkManager) {
      networkManager.updateMediaState({ isMuted: muted });
    }
  }, [webRTCToggleMute, networkManager]);

  /**
   * Toggle vídeo
   */
  const handleToggleVideo = useCallback(() => {
    const videoOn = webRTCToggleVideo();
    setIsVideoEnabled(videoOn);

    if (networkManager) {
      networkManager.updateMediaState({ isVideoEnabled: videoOn });
    }
  }, [webRTCToggleVideo, networkManager]);

  /**
   * Toggle screen share
   */
  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Parar compartilhamento
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      stopScreenShare();
      setScreenStream(null);
      setIsScreenSharing(false);

      if (networkManager) {
        networkManager.updateMediaState({ isScreenSharing: false });
      }

      toast.info('Compartilhamento de tela parado', {
        duration: 2000,
      });
    } else {
      // Iniciar compartilhamento
      try {
        const stream = await startScreenShare();
        setScreenStream(stream);
        setIsScreenSharing(true);

        if (networkManager) {
          networkManager.updateMediaState({ isScreenSharing: true });
        }

        toast.success('Compartilhando tela', {
          duration: 2000,
        });
      } catch (err) {
        console.error('Failed to start screen share:', err);
        toast.error('Não foi possível compartilhar a tela', {
          title: 'Erro',
          duration: 3000,
        });
      }
    }
  }, [isScreenSharing, screenStream, startScreenShare, stopScreenShare, networkManager, toast]);

  /**
   * Open settings
   */
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  /**
   * Apply settings
   */
  const handleApplySettings = useCallback(async (newSettings) => {
    // Salvar no localStorage
    saveSettings(newSettings);
    setSettings(newSettings);

    // Reinicializar mídia com novas configurações
    if (localStream) {
      // Parar stream atual
      localStream.getTracks().forEach(track => track.stop());

      // Aguardar um pouco antes de reinicializar
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reinicializar com novas configurações
      const constraints = settingsToMediaConstraints(newSettings, isVideoEnabled);
      try {
        await initializeMedia(true, isVideoEnabled, constraints);
        toast.success('Configurações aplicadas', {
          duration: 2000,
        });
      } catch (err) {
        toast.error('Erro ao aplicar configurações', {
          duration: 3000,
        });
      }
    }
  }, [localStream, isVideoEnabled, initializeMedia, toast]);

  /**
   * Handle mudança de status
   */
  const handleStatusChange = useCallback((newStatus) => {
    setUserStatus(newStatus);

    // Atualizar indicador no avatar local
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene?.player) {
        const statusColor = Phaser.Display.Color.HexStringToColor(STATUS_CONFIG[newStatus].color).color;
        scene.player.setStatus(statusColor);
      }
    }

    // Sincronizar com servidor
    if (networkManager) {
      networkManager.updateStatus(newStatus);
    }

    // Notificação
    toast.info(`Status: ${STATUS_CONFIG[newStatus].label}`, {
      duration: 2000,
    });
  }, [phaserGame, networkManager, toast]);

  /**
   * Handle emote selecionado
   */
  const handleEmoteSelect = useCallback((emote) => {
    const emoteConfig = EMOTE_CONFIG[emote];
    if (!emoteConfig) return;

    // Mostrar emote no avatar local
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene?.player) {
        scene.player.showEmote(emoteConfig.icon, emoteConfig.duration);
      }
    }

    // Sincronizar com servidor
    if (networkManager) {
      networkManager.sendEmote(emote);
    }
  }, [phaserGame, networkManager]);

  /**
   * Handle emote recebido de outro usuário
   */
  const handleUserEmote = useCallback((userId, emote) => {
    const emoteConfig = EMOTE_CONFIG[emote];
    if (!emoteConfig) return;

    // Mostrar emote no avatar remoto
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene) {
        const avatar = remoteAvatarsRef.current.get(userId);
        if (avatar) {
          avatar.showEmote(emoteConfig.icon, emoteConfig.duration);
        }
      }
    }
  }, [phaserGame]);

  // Atalhos de teclado para emotes
  useEmoteShortcuts(handleEmoteSelect, isConnected);

  const nearbyUsers = getNearbyUsers();
  const connectedUsers = allUsers.length;

  // Notificações de proximidade
  useProximityNotifications(nearbyUsers, toast, soundsEnabled);

  /**
   * Atualiza transparência dos avatars baseado na distância
   */
  useEffect(() => {
    if (!phaserGame || !currentUserPosition) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene) return;

    const maxDistance = 12; // Distância máxima para efeito de transparência

    allUsers.forEach(user => {
      if (user.isLocalUser) return;

      const avatar = remoteAvatarsRef.current.get(user.id);
      if (!avatar) return;

      const distance = user.proximityData?.distance || 0;

      if (distance > maxDistance) {
        avatar.setDistanceOpacity(maxDistance, maxDistance);
      } else {
        avatar.setDistanceOpacity(distance, maxDistance);
      }
    });
  }, [phaserGame, allUsers, currentUserPosition]);

  /**
   * Mostra círculo de proximidade no avatar do jogador
   */
  useEffect(() => {
    if (!phaserGame) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene || !scene.player) return;

    // Mostrar círculo de proximidade permanentemente
    const maxDistance = 8; // Mesma distância do useProximityVoice
    const radiusInPixels = maxDistance * 32; // Converter tiles para pixels (aproximado)
    scene.player.showProximityCircle(radiusInPixels);

    return () => {
      if (scene && scene.player) {
        scene.player.hideProximityCircle();
      }
    };
  }, [phaserGame]);

  /**
   * Handle knock recebido
   */
  const handleKnock = useCallback((fromUserId, fromUserName) => {
    // Mostrar animação no avatar
    if (phaserGame) {
      const scene = phaserGame.scene.scenes[0];
      if (scene && scene.player) {
        // Animar avatar pulsando
        scene.tweens.add({
          targets: scene.player,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 150,
          yoyo: true,
          repeat: 2,
        });
      }
    }

    // Notificação
    toast.info(`👋 ${fromUserName} está chamando você!`, { duration: 3000 });
  }, [phaserGame, toast]);

  /**
   * Handle mensagem privada recebida
   */
  const handlePrivateMessage = useCallback((fromUserId, fromUserName, message) => {
    toast.success(`💬 ${fromUserName}: ${message}`, { duration: 5000 });
  }, [toast]);

  /**
   * Handle clique em usuário na lista de próximos
   */
  const handleNearbyUserClick = useCallback((user, event) => {
    setSelectedUser(user);
    setMenuPosition({
      x: event?.clientX || window.innerWidth / 2,
      y: event?.clientY || window.innerHeight / 2,
    });
  }, []);

  /**
   * Handle ação do menu de usuário
   */
  const handleUserAction = useCallback((actionId, user) => {
    if (!phaserGame || !networkManager) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene) return;

    switch (actionId) {
      case 'teleport':
        // Teleportar para o usuário
        if (user.position && scene.player) {
          const targetX = user.position.x + (Math.random() > 0.5 ? 1 : -1);
          const targetY = user.position.y + (Math.random() > 0.5 ? 1 : -1);
          scene.player.moveToGrid(targetX, targetY, scene.pathfinding);
          toast.success(`🚀 Teleportado para ${user.name}`, { duration: 2000 });
        }
        break;

      case 'follow':
        // Seguir usuário
        startFollowing(user.id);
        toast.success(`👣 Seguindo ${user.name}`, { duration: 2000 });
        break;

      case 'knock':
        // Enviar knock
        networkManager.sendKnock(user.id);
        toast.info(`👋 Chamando ${user.name}...`, { duration: 2000 });
        break;

      case 'chat':
        // Abrir chat privado (simulado com prompt por enquanto)
        const message = window.prompt(`Enviar mensagem para ${user.name}:`);
        if (message) {
          networkManager.sendPrivateMessage(user.id, message);
          toast.success(`💬 Mensagem enviada para ${user.name}`, { duration: 2000 });
        }
        break;

      case 'profile':
        // Ver perfil
        setProfileUser(user);
        break;

      default:
        break;
    }
  }, [phaserGame, networkManager, startFollowing, toast]);

  /**
   * Carregar lista de salas
   */
  const loadRooms = useCallback(async () => {
    if (!networkManager) return;

    try {
      const rooms = await networkManager.getRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  }, [networkManager]);

  /**
   * Abrir seletor de salas
   */
  const handleOpenRoomSelector = useCallback(() => {
    loadRooms();
    setIsRoomSelectorOpen(true);
  }, [loadRooms]);

  /**
   * Selecionar sala
   */
  const handleSelectRoom = useCallback(async (room) => {
    if (!networkManager) return;

    try {
      // Se sala privada, pedir senha
      if (room.type === 'private') {
        const password = window.prompt(`Enter password for ${room.name}:`);
        if (!password) return;

        await networkManager.switchRoom(room.id, password);
      } else {
        await networkManager.switchRoom(room.id);
      }

      setCurrentRoom(room.id);
      setIsRoomSelectorOpen(false);
      toast.success(`Switched to ${room.name}`, { duration: 2000 });

      // Recarregar cena do Phaser
      if (phaserGame) {
        const scene = phaserGame.scene.scenes[0];
        if (scene) {
          scene.scene.restart();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to switch room', { duration: 3000 });
    }
  }, [networkManager, phaserGame, toast]);

  /**
   * Criar nova sala
   */
  const handleCreateRoom = useCallback(async (roomData) => {
    if (!networkManager) return;

    try {
      const roomId = await networkManager.createRoom(roomData);
      toast.success(`Room "${roomData.name}" created!`, { duration: 2000 });
      setIsCreateRoomOpen(false);

      // Recarregar lista de salas
      await loadRooms();

      // Entrar automaticamente na sala criada
      await networkManager.switchRoom(roomId);
      setCurrentRoom(roomId);
    } catch (error) {
      toast.error('Failed to create room', { duration: 3000 });
    }
  }, [networkManager, loadRooms, toast]);

  /**
   * Carregar salas ao conectar
   */
  useEffect(() => {
    if (isConnected && networkManager) {
      loadRooms();

      // Listener para novas salas criadas
      networkManager.getSocket()?.on('room-created', (newRoom) => {
        setAvailableRooms(prev => [...prev, newRoom]);
      });
    }
  }, [isConnected, networkManager, loadRooms]);

  return (
    <>
      {/* Audio Controls */}
      {isConnected && (
        <AudioControls
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          connectedUsers={connectedUsers}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {/* Status Selector */}
      {isConnected && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <StatusSelector
            currentStatus={userStatus}
            onStatusChange={handleStatusChange}
          />
          <EmoteSelector
            onEmoteSelect={handleEmoteSelect}
            disabled={!isConnected}
          />
          <button
            onClick={() => setIsWhiteboardOpen(true)}
            disabled={!isConnected}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #e5e7eb',
              background: isConnected ? '#ffffff' : '#f3f4f6',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            title="Open Whiteboard"
          >
            📝
          </button>
          <button
            onClick={handleOpenRoomSelector}
            disabled={!isConnected}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #e5e7eb',
              background: isConnected ? '#ffffff' : '#f3f4f6',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            title="Rooms"
          >
            🚪
          </button>
          <button
            onClick={() => setIsActivityLogOpen(!isActivityLogOpen)}
            disabled={!isConnected}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '2px solid #e5e7eb',
              background: isConnected ? '#ffffff' : '#f3f4f6',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            title="Activity Log"
          >
            📋
          </button>
        </div>
      )}

      {/* Proximity Video Panel */}
      {isConnected && nearbyUsers.length > 0 && (
        <ProximityVideoPanel
          nearbyUsers={nearbyUsers}
          connections={connections}
          speakingUsers={speakingUsers}
          maxVideosShown={4}
          layout="grid"
        />
      )}

      {/* Chat System */}
      {isConnected && (
        <ChatManager
          networkManager={networkManager}
          phaserGame={phaserGame}
          currentUser={currentUser}
          allUsers={allUsers}
          localUserId={localUserId}
        />
      )}

      {/* Error Display */}
      {webRTCError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 10000,
        }}>
          ⚠️ {webRTCError}
        </div>
      )}

      {/* Screen Share Preview */}
      {isScreenSharing && screenStream && (
        <ScreenSharePreview
          stream={screenStream}
          onClose={handleToggleScreenShare}
          userName="Você"
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApplySettings={handleApplySettings}
        currentSettings={settings}
        localStream={localStream}
        testAudioLevel={audioLevel}
      />

      {/* Collaborative Whiteboard */}
      <Whiteboard
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        networkManager={networkManager}
      />

      {/* Nearby Users List */}
      {isConnected && (
        <NearbyUsersList
          nearbyUsers={nearbyUsers.map(user => ({
            ...user,
            isSpeaking: isUserSpeaking(user.id),
          }))}
          onUserClick={handleNearbyUserClick}
        />
      )}

      {/* User Actions Menu */}
      {selectedUser && (
        <UserActionsMenu
          user={selectedUser}
          position={menuPosition}
          onClose={() => setSelectedUser(null)}
          onAction={handleUserAction}
        />
      )}

      {/* User Profile Modal */}
      {profileUser && (
        <UserProfileModal
          user={profileUser}
          isOwn={profileUser.id === localUserId}
          onClose={() => setProfileUser(null)}
          onUpdate={(data) => {
            if (data.statusMessage !== undefined && networkManager) {
              networkManager.updateStatusMessage(data.statusMessage);
              toast.success('Status message updated!', { duration: 2000 });
            }
          }}
          onSendMessage={(user) => {
            const message = window.prompt(`Send message to ${user.name}:`);
            if (message && networkManager) {
              networkManager.sendPrivateMessage(user.id, message);
              toast.success(`Message sent to ${user.name}`, { duration: 2000 });
            }
            setProfileUser(null);
          }}
          onTeleport={(user) => {
            if (phaserGame) {
              const scene = phaserGame.scene.scenes[0];
              if (scene && scene.player && user.position) {
                const targetX = user.position.x + 1;
                const targetY = user.position.y + 1;
                scene.player.moveToGrid(targetX, targetY, scene.pathfinding);
                toast.success(`Teleported to ${user.name}`, { duration: 2000 });
              }
            }
            setProfileUser(null);
          }}
        />
      )}

      {/* Follow Mode Indicator */}
      {isFollowing && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}>
          <span>👣 Seguindo usuário</span>
          <button
            onClick={stopFollowing}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Parar
          </button>
        </div>
      )}

      {/* Activity Log */}
      {isActivityLogOpen && (
        <ActivityLog
          events={activityEvents}
          onClose={() => setIsActivityLogOpen(false)}
        />
      )}

      {/* Room Selector */}
      {isRoomSelectorOpen && (
        <RoomSelector
          rooms={availableRooms}
          currentRoom={currentRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={() => {
            setIsRoomSelectorOpen(false);
            setIsCreateRoomOpen(true);
          }}
          onClose={() => setIsRoomSelectorOpen(false)}
        />
      )}

      {/* Create Room Modal */}
      {isCreateRoomOpen && (
        <CreateRoomModal
          onClose={() => setIsCreateRoomOpen(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </>
  );
}

export default VoiceManager;
