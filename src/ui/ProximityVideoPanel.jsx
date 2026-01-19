import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaExpand, FaTimes } from 'react-icons/fa';
import './ProximityVideoPanel.css';

/**
 * Componente de vídeo individual
 */
function VideoTile({ user, stream, volume, isSpeaking, onExpand, onClose }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const distanceText = user.proximityData?.distance
    ? `${user.proximityData.distance.toFixed(1)}m`
    : '';

  const volumePercentage = Math.round(volume * 100);

  return (
    <div
      className={`video-tile ${isSpeaking ? 'speaking' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="video-stream"
      />

      {/* Overlay de informações */}
      <div className="video-overlay">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          {distanceText && <span className="user-distance">{distanceText}</span>}
        </div>

        {/* Indicador de volume */}
        <div className="volume-indicator">
          {volume > 0 ? <FaMicrophone /> : <FaMicrophoneSlash />}
          <div className="volume-bar">
            <div
              className="volume-bar-fill"
              style={{ width: `${volumePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controles (aparecem no hover) */}
      {isHovered && (
        <div className="video-controls">
          <button
            className="video-control-btn"
            onClick={() => onExpand && onExpand(user.id)}
            title="Expandir"
          >
            <FaExpand />
          </button>
          <button
            className="video-control-btn"
            onClick={() => onClose && onClose(user.id)}
            title="Fechar"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Indicador de fala (anel ao redor) */}
      {isSpeaking && <div className="speaking-ring" />}
    </div>
  );
}

/**
 * Painel de vídeos de usuários próximos
 */
export function ProximityVideoPanel({
  nearbyUsers = [],
  connections = new Map(),
  speakingUsers = new Set(),
  maxVideosShown = 4,
  layout = 'grid', // 'grid' | 'stack' | 'horizontal'
}) {
  const [expandedUser, setExpandedUser] = useState(null);
  const [hiddenUsers, setHiddenUsers] = useState(new Set());

  // Filtrar usuários que têm vídeo habilitado
  const usersWithVideo = nearbyUsers
    .filter(user => {
      const connection = connections.get(user.id);
      return connection?.remoteStream && !hiddenUsers.has(user.id);
    })
    .slice(0, maxVideosShown);

  // Se não há usuários com vídeo, não renderizar
  if (usersWithVideo.length === 0) {
    return null;
  }

  const handleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const handleClose = (userId) => {
    setHiddenUsers(new Set([...hiddenUsers, userId]));
  };

  return (
    <div className={`proximity-video-panel layout-${layout}`}>
      {usersWithVideo.map(user => {
        const connection = connections.get(user.id);
        const isSpeaking = speakingUsers.has(user.id);
        const volume = user.proximityData?.volume || 0;
        const isExpanded = expandedUser === user.id;

        return (
          <div
            key={user.id}
            className={`video-wrapper ${isExpanded ? 'expanded' : ''}`}
          >
            <VideoTile
              user={user}
              stream={connection.remoteStream}
              volume={volume}
              isSpeaking={isSpeaking}
              onExpand={handleExpand}
              onClose={handleClose}
            />
          </div>
        );
      })}

      {/* Contador de usuários próximos sem vídeo */}
      {nearbyUsers.length > usersWithVideo.length && (
        <div className="more-users-indicator">
          +{nearbyUsers.length - usersWithVideo.length} próximo(s)
        </div>
      )}
    </div>
  );
}

export default ProximityVideoPanel;
