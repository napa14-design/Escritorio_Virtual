import React, { useState } from 'react';
import './UserProfileModal.css';
import { STATUS_CONFIG } from '../config/userStatus';

/**
 * Modal de perfil de usuário com informações e customização
 */
export function UserProfileModal({ user, isOwn, onClose, onUpdate, onSendMessage, onTeleport }) {
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.available;

  const handleSaveStatusMessage = () => {
    if (onUpdate) {
      onUpdate({ statusMessage });
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className="profile-overlay" onClick={onClose} />
      <div className="profile-modal">
        <button className="profile-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div className="profile-header">
          <div
            className="profile-avatar-large"
            style={{
              backgroundColor: user.customization?.skinColor || '#f5c98c',
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{user.name || 'Unknown User'}</h2>
            <div className="profile-status-badge">
              <span className="status-icon">{statusConfig.icon}</span>
              <span className="status-label">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="profile-section">
          <h3 className="section-title">📝 Status Message</h3>
          {isOwn ? (
            <div className="status-message-edit">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="Set your status message..."
                    maxLength={60}
                    className="status-input"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button onClick={handleSaveStatusMessage} className="save-btn">
                      Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="status-message-display" onClick={() => setIsEditing(true)}>
                  {statusMessage || 'Click to set a status message...'}
                  <span className="edit-icon">✏️</span>
                </div>
              )}
            </div>
          ) : (
            <div className="status-message-readonly">
              {user.statusMessage || 'No status message'}
            </div>
          )}
        </div>

        {/* Avatar Customization */}
        <div className="profile-section">
          <h3 className="section-title">🎨 Avatar</h3>
          <div className="avatar-preview">
            <div className="avatar-colors">
              <div className="color-item">
                <span>Skin:</span>
                <div
                  className="color-circle"
                  style={{ backgroundColor: user.customization?.skinColor || '#f5c98c' }}
                />
              </div>
              <div className="color-item">
                <span>Hair:</span>
                <div
                  className="color-circle"
                  style={{ backgroundColor: user.customization?.hairColor || '#8B4513' }}
                />
              </div>
              <div className="color-item">
                <span>Shirt:</span>
                <div
                  className="color-circle"
                  style={{ backgroundColor: user.customization?.shirtColor || '#3b82f6' }}
                />
              </div>
              <div className="color-item">
                <span>Pants:</span>
                <div
                  className="color-circle"
                  style={{ backgroundColor: user.customization?.pantsColor || '#1f2937' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Info */}
        {!isOwn && (
          <div className="profile-section">
            <h3 className="section-title">📊 Activity</h3>
            <div className="activity-info">
              <div className="activity-item">
                <span className="activity-label">Distance:</span>
                <span className="activity-value">
                  {user.distance ? `${Math.round(user.distance)}m` : 'Unknown'}
                </span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Speaking:</span>
                <span className="activity-value">
                  {user.isSpeaking ? '🎤 Yes' : '🔇 No'}
                </span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Media:</span>
                <span className="activity-value">
                  {user.mediaState?.isMuted ? '🔇' : '🎤'}
                  {user.mediaState?.isVideoEnabled ? ' 📹' : ''}
                  {user.mediaState?.isScreenSharing ? ' 🖥️' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions (for other users) */}
        {!isOwn && (
          <div className="profile-actions">
            {onSendMessage && (
              <button className="action-btn primary" onClick={() => onSendMessage(user)}>
                💬 Send Message
              </button>
            )}
            {onTeleport && (
              <button className="action-btn secondary" onClick={() => onTeleport(user)}>
                🚀 Teleport
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default UserProfileModal;
