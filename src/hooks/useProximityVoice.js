import { useEffect, useRef, useCallback } from 'react';

/**
 * Configuração padrão de proximidade
 */
export const DEFAULT_PROXIMITY_CONFIG = {
  maxDistance: 8,          // Distância máxima para ouvir (tiles)
  fadeStartDistance: 4,    // Onde começa o fade de volume
  minVolume: 0.05,         // Volume mínimo antes de cortar
  updateInterval: 100,     // Intervalo de atualização (ms)
};

/**
 * Calcula distância euclidiana entre duas posições
 */
function calculateDistance(pos1, pos2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula volume baseado na distância
 */
function calculateVolume(distance, config) {
  if (distance > config.maxDistance) {
    return 0;
  }

  if (distance <= config.fadeStartDistance) {
    return 1;
  }

  // Fade linear de fadeStartDistance até maxDistance
  const fadeRange = config.maxDistance - config.fadeStartDistance;
  const fadeProgress = (distance - config.fadeStartDistance) / fadeRange;

  const volume = Math.max(config.minVolume, 1 - fadeProgress);

  return volume;
}

/**
 * Hook para gerenciar volume de voz baseado em proximidade
 */
export function useProximityVoice(
  currentUserPosition,
  allUsers,
  webRTCConnections,
  setRemoteVolume,
  config = DEFAULT_PROXIMITY_CONFIG
) {
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodesRef = useRef(new Map());

  /**
   * Cria Web Audio API context e gain nodes para controle fino de volume
   */
  const setupAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return audioContextRef.current;
  }, []);

  /**
   * Cria ou retorna gain node para um usuário específico
   */
  const getGainNode = useCallback((userId, stream) => {
    if (gainNodesRef.current.has(userId)) {
      return gainNodesRef.current.get(userId);
    }

    const audioContext = setupAudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const gainNode = audioContext.createGain();
    const destination = audioContext.createMediaStreamDestination();

    source.connect(gainNode);
    gainNode.connect(destination);
    gainNode.connect(audioContext.destination);

    gainNodesRef.current.set(userId, {
      source,
      gainNode,
      destination,
    });

    return gainNodesRef.current.get(userId);
  }, [setupAudioContext]);

  /**
   * Atualiza volumes baseado em proximidade
   */
  const updateProximityVolumes = useCallback(() => {
    if (!currentUserPosition || !allUsers) return;

    allUsers.forEach(user => {
      // Não processar o próprio usuário
      if (user.isLocalUser) return;

      const distance = calculateDistance(currentUserPosition, user.position);
      const volume = calculateVolume(distance, config);

      // Atualizar volume via WebRTC
      if (setRemoteVolume) {
        setRemoteVolume(user.id, volume);
      }

      // Se temos Web Audio API setup, atualizar gain node
      const connection = webRTCConnections?.get(user.id);
      if (connection && connection.remoteStream) {
        const audioNodes = getGainNode(user.id, connection.remoteStream);
        if (audioNodes && audioNodes.gainNode) {
          // Suavizar transição de volume
          audioNodes.gainNode.gain.setTargetAtTime(
            volume,
            audioContextRef.current.currentTime,
            0.1
          );
        }
      }

      // Atualizar dados do usuário com volume e distância
      user.proximityData = {
        distance,
        volume,
        isInRange: distance <= config.maxDistance,
      };
    });
  }, [currentUserPosition, allUsers, config, setRemoteVolume, webRTCConnections, getGainNode]);

  /**
   * Inicia atualização periódica de volumes
   */
  useEffect(() => {
    if (!currentUserPosition) return;

    // Atualizar imediatamente
    updateProximityVolumes();

    // Configurar intervalo de atualização
    intervalRef.current = setInterval(
      updateProximityVolumes,
      config.updateInterval
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUserPosition, updateProximityVolumes, config.updateInterval]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      // Limpar gain nodes
      gainNodesRef.current.forEach((nodes) => {
        if (nodes.source) nodes.source.disconnect();
        if (nodes.gainNode) nodes.gainNode.disconnect();
      });
      gainNodesRef.current.clear();

      // Fechar audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Retorna usuários próximos ordenados por distância
   */
  const getNearbyUsers = useCallback(() => {
    if (!allUsers || !currentUserPosition) return [];

    return allUsers
      .filter(user => !user.isLocalUser && user.proximityData?.isInRange)
      .sort((a, b) => {
        const distA = a.proximityData?.distance || Infinity;
        const distB = b.proximityData?.distance || Infinity;
        return distA - distB;
      });
  }, [allUsers, currentUserPosition]);

  /**
   * Verifica se um usuário está dentro do alcance de voz
   */
  const isUserInRange = useCallback((userId) => {
    const user = allUsers?.find(u => u.id === userId);
    return user?.proximityData?.isInRange || false;
  }, [allUsers]);

  /**
   * Retorna volume atual de um usuário
   */
  const getUserVolume = useCallback((userId) => {
    const user = allUsers?.find(u => u.id === userId);
    return user?.proximityData?.volume || 0;
  }, [allUsers]);

  return {
    getNearbyUsers,
    isUserInRange,
    getUserVolume,
    updateProximityVolumes,
  };
}

export default useProximityVoice;
