import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Configuração padrão de detecção de voz
 */
const DEFAULT_VAD_CONFIG = {
  threshold: 0.02,         // Nível mínimo para considerar "falando" (0-1)
  smoothingFrames: 5,      // Frames para suavizar detecção
  silenceDelay: 500,       // ms antes de considerar "parou de falar"
  fftSize: 256,            // Tamanho do FFT para análise
};

/**
 * Hook para detectar atividade de voz (Voice Activity Detection)
 */
export function useVoiceActivityDetection(stream, config = DEFAULT_VAD_CONFIG) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const smoothingBufferRef = useRef([]);
  const silenceTimerRef = useRef(null);

  /**
   * Inicializa análise de áudio
   */
  const startAnalysis = useCallback(() => {
    if (!stream) return;

    try {
      // Criar audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Criar analyser
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = config.fftSize;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Conectar stream ao analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Iniciar loop de análise
      analyzeAudio();
    } catch (err) {
      console.error('Error starting voice detection:', err);
    }
  }, [stream, config.fftSize]);

  /**
   * Loop de análise de áudio
   */
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calcular nível médio
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalized = average / 255;

      // Adicionar ao buffer de suavização
      smoothingBufferRef.current.push(normalized);
      if (smoothingBufferRef.current.length > config.smoothingFrames) {
        smoothingBufferRef.current.shift();
      }

      // Calcular média suavizada
      const smoothedLevel = smoothingBufferRef.current.reduce((sum, val) => sum + val, 0) /
                           smoothingBufferRef.current.length;

      setAudioLevel(smoothedLevel);

      // Detectar se está falando
      const speaking = smoothedLevel > config.threshold;

      if (speaking) {
        // Cancelar timer de silêncio se estava em curso
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (!isSpeaking) {
          setIsSpeaking(true);
        }
      } else {
        // Se estava falando, aguardar delay antes de marcar como silêncio
        if (isSpeaking && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            setIsSpeaking(false);
            silenceTimerRef.current = null;
          }, config.silenceDelay);
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }, [config.threshold, config.smoothingFrames, config.silenceDelay, isSpeaking]);

  /**
   * Para análise
   */
  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    smoothingBufferRef.current = [];
  }, []);

  /**
   * Iniciar análise quando stream muda
   */
  useEffect(() => {
    if (stream) {
      startAnalysis();
    }

    return () => {
      stopAnalysis();
    };
  }, [stream, startAnalysis, stopAnalysis]);

  return {
    isSpeaking,
    audioLevel,
  };
}

/**
 * Hook para detectar fala de outros usuários (stream remoto)
 */
export function useRemoteVoiceActivityDetection(connections) {
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const analyserRefs = useRef(new Map());
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  /**
   * Configura análise para todas as conexões
   */
  useEffect(() => {
    if (!connections || connections.size === 0) return;

    // Criar audio context se necessário
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const newSpeaking = new Set(speakingUsers);

    // Configurar analyser para cada conexão
    connections.forEach((connection, userId) => {
      if (!connection.remoteStream) return;

      // Criar analyser se não existe
      if (!analyserRefs.current.has(userId)) {
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        try {
          const source = audioContext.createMediaStreamSource(connection.remoteStream);
          source.connect(analyser);

          analyserRefs.current.set(userId, {
            analyser,
            source,
            dataArray: new Uint8Array(analyser.frequencyBinCount),
          });
        } catch (err) {
          console.error(`Error setting up analyser for ${userId}:`, err);
        }
      }
    });

    // Loop de análise
    const checkAllUsers = () => {
      const currentSpeaking = new Set();

      analyserRefs.current.forEach((analyserData, userId) => {
        const { analyser, dataArray } = analyserData;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalized = average / 255;

        if (normalized > 0.02) {
          currentSpeaking.add(userId);
        }
      });

      // Atualizar state se mudou
      if (currentSpeaking.size !== speakingUsers.size ||
          ![...currentSpeaking].every(id => speakingUsers.has(id))) {
        setSpeakingUsers(currentSpeaking);
      }

      animationFrameRef.current = requestAnimationFrame(checkAllUsers);
    };

    checkAllUsers();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Limpar analysers
      analyserRefs.current.forEach((analyserData) => {
        if (analyserData.source) {
          analyserData.source.disconnect();
        }
      });
      analyserRefs.current.clear();

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [connections, speakingUsers]);

  return {
    speakingUsers,
    isUserSpeaking: (userId) => speakingUsers.has(userId),
  };
}

export default useVoiceActivityDetection;
