import React, { useEffect, useRef } from 'react';
import './ScreenSharePreview.css';

/**
 * Screen Share Preview - Preview de tela compartilhada
 */
export function ScreenSharePreview({ stream, onClose, userName = 'You' }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="screen-share-preview">
      <div className="screen-share-header">
        <div className="screen-share-info">
          <span className="screen-share-icon">🖥️</span>
          <span className="screen-share-text">{userName} está compartilhando</span>
        </div>
        <button className="screen-share-close" onClick={onClose} title="Parar compartilhamento">
          ✕
        </button>
      </div>
      <div className="screen-share-video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="screen-share-video"
        />
      </div>
    </div>
  );
}

export default ScreenSharePreview;
