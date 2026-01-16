import React, { useEffect, useState, useCallback, useRef } from 'react';
import useWebRTC from '../hooks/useWebRTC';
import useVoiceActivityDetection, { useRemoteVoiceActivityDetection } from '../hooks/useVoiceActivityDetection';
import useProximityVoice from '../hooks/useProximityVoice';
import NetworkManager from '../systems/NetworkManager';
import AudioControls from '../ui/AudioControls';
import ProximityVideoPanel from '../ui/ProximityVideoPanel';
import ChatManager from './ChatManager';
import SettingsModal from '../ui/SettingsModal';
import { useToast } from '../ui/Toast';
import { DEFAULT_AUDIO_ZONES, findZoneAtPosition } from '../config/audioZones';
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
  const [isConnected, setIsConnected] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [settings, setSettings] = useState(() => loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const networkRef = useRef(null);
  const remoteAvatarsRef = useRef(new Map());
  const toast = useToast();
  const audioZones = DEFAULT_AUDIO_ZONES;

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
   * Toggle screen share (TODO: implementar)
   */
  const handleToggleScreenShare = useCallback(() => {
    console.log('Screen sharing not yet implemented');
  }, []);

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
