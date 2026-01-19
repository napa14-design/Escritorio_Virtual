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
  const [isConnected, setIsConnected] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userStatus, setUserStatus] = useState(DEFAULT_STATUS);

  const networkRef = useRef(null);
  const remoteAvatarsRef = useRef(new Map());
  const toast = useToast();
  const audioZones = DEFAULT_AUDIO_ZONES;

  // Auto-away detection
  useAutoAway(userStatus, setUserStatus);

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
  }, [phaserGame, localStream, createPeerConnection, toast]);

  /**
   * Handle usuário saiu
   */
  const handleUserLeft = useCallback((userId) => {
    console.log('User left:', userId);

    // Pegar nome antes de remover
    const user = allUsers.find(u => u.id === userId);
    const userName = user?.name || 'User';

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
  }, [removePeerConnection, allUsers, toast]);

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
  }, []);

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
    </>
  );
}

export default VoiceManager;
