import { useState, useEffect, useRef } from 'react';

/**
 * Hook para monitorar qualidade de conexão WebRTC
 */
export function useConnectionQuality(peerConnection) {
  const [quality, setQuality] = useState({
    state: 'unknown', // 'excellent' | 'good' | 'poor' | 'disconnected' | 'unknown'
    ping: null,
    packetLoss: 0,
    bandwidth: 0,
  });

  const intervalRef = useRef(null);
  const lastTimestampRef = useRef(Date.now());

  useEffect(() => {
    if (!peerConnection?.peer) return;

    const peer = peerConnection.peer;

    // Monitorar estado de conexão
    const checkConnectionState = () => {
      if (!peer._pc) return;

      peer._pc.getStats().then(stats => {
        let bytesReceived = 0;
        let packetsLost = 0;
        let packetsReceived = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            bytesReceived = report.bytesReceived || 0;
            packetsLost = report.packetsLost || 0;
            packetsReceived = report.packetsReceived || 0;
          }
        });

        // Calcular packet loss
        const totalPackets = packetsReceived + packetsLost;
        const packetLossPercentage = totalPackets > 0
          ? (packetsLost / totalPackets) * 100
          : 0;

        // Calcular bandwidth (aproximado)
        const now = Date.now();
        const timeDiff = (now - lastTimestampRef.current) / 1000;
        const bandwidth = timeDiff > 0 ? (bytesReceived * 8) / timeDiff / 1000 : 0; // kbps
        lastTimestampRef.current = now;

        // Determinar qualidade
        let state = 'excellent';
        if (packetLossPercentage > 10 || bandwidth < 10) {
          state = 'poor';
        } else if (packetLossPercentage > 5 || bandwidth < 20) {
          state = 'good';
        }

        setQuality({
          state,
          ping: null, // SimplePeer não expõe RTT facilmente
          packetLoss: packetLossPercentage,
          bandwidth,
        });
      }).catch(err => {
        console.error('Error getting stats:', err);
      });
    };

    // Monitorar estado de conexão
    const handleConnectionStateChange = () => {
      if (peer._pc) {
        const state = peer._pc.connectionState;

        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setQuality(prev => ({ ...prev, state: 'disconnected' }));
        }
      }
    };

    // Verificar a cada 2 segundos
    intervalRef.current = setInterval(checkConnectionState, 2000);
    checkConnectionState();

    // Listeners
    if (peer._pc) {
      peer._pc.addEventListener('connectionstatechange', handleConnectionStateChange);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (peer._pc) {
        peer._pc.removeEventListener('connectionstatechange', handleConnectionStateChange);
      }
    };
  }, [peerConnection]);

  return quality;
}

/**
 * Hook para monitorar múltiplas conexões
 */
export function useConnectionsQuality(connections) {
  const [qualities, setQualities] = useState(new Map());

  useEffect(() => {
    const newQualities = new Map();

    connections.forEach((connection, userId) => {
      // Para cada conexão, precisaríamos usar useConnectionQuality
      // Por simplicidade, vamos criar um objeto básico
      newQualities.set(userId, {
        state: connection.isConnected ? 'good' : 'disconnected',
        ping: null,
        packetLoss: 0,
        bandwidth: 0,
      });
    });

    setQualities(newQualities);
  }, [connections]);

  return qualities;
}

export default useConnectionQuality;
