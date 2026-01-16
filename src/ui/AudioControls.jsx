import React, { useState, useEffect } from 'react';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaCog,
  FaUsers,
} from 'react-icons/fa';
import './AudioControls.css';

/**
 * Componente de controles de áudio/vídeo (estilo Gather.town)
 */
export function AudioControls({
  isMuted = false,
  isVideoEnabled = false,
  isScreenSharing = false,
  isSpeaking = false,
  audioLevel = 0,
  connectedUsers = 0,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onOpenSettings,
}) {
  const [showAudioMeter, setShowAudioMeter] = useState(false);

  // Mostrar medidor quando há atividade
  useEffect(() => {
    if (audioLevel > 0.05) {
      setShowAudioMeter(true);
    } else {
      const timer = setTimeout(() => setShowAudioMeter(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [audioLevel]);

  return (
    <div className="audio-controls">
      <div className="audio-controls-container">
        {/* Botão Mute/Unmute */}
        <button
          className={`control-btn ${isMuted ? 'muted' : 'active'} ${isSpeaking ? 'speaking' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? 'Desmutar (M)' : 'Mutar (M)'}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}

          {/* Medidor de áudio */}
          {showAudioMeter && !isMuted && (
            <div className="audio-meter">
              <div
                className="audio-meter-fill"
                style={{
                  width: `${audioLevel * 100}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ef4444' : audioLevel > 0.4 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          )}
        </button>

        {/* Botão Vídeo */}
        <button
          className={`control-btn ${isVideoEnabled ? 'active' : ''}`}
          onClick={onToggleVideo}
          title={isVideoEnabled ? 'Desligar câmera (V)' : 'Ligar câmera (V)'}
        >
          {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </button>

        {/* Botão Compartilhar Tela */}
        <button
          className={`control-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={onToggleScreenShare}
          title="Compartilhar tela"
        >
          <FaDesktop />
        </button>

        {/* Separador */}
        <div className="control-separator" />

        {/* Usuários Conectados */}
        <div className="connected-users-indicator" title={`${connectedUsers} usuário(s) conectado(s)`}>
          <FaUsers />
          <span className="user-count">{connectedUsers}</span>
        </div>

        {/* Botão Configurações */}
        <button
          className="control-btn"
          onClick={onOpenSettings}
          title="Configurações de áudio/vídeo"
        >
          <FaCog />
        </button>
      </div>

      {/* Indicador de conexão */}
      {connectedUsers > 0 && (
        <div className="connection-status">
          <div className="connection-dot" />
          <span>Conectado</span>
        </div>
      )}
    </div>
  );
}

export default AudioControls;
