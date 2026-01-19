import React from 'react';
import './NearbyUsersList.css';
import { STATUS_CONFIG } from '../config/userStatus';

/**
 * Lista de usuários próximos com informações e ações rápidas
 */
export function NearbyUsersList({ nearbyUsers, onUserClick }) {
  if (!nearbyUsers || nearbyUsers.length === 0) {
    return null;
  }

  return (
    <div className="nearby-users-list">
      <div className="nearby-users-header">
        <h3>👥 Nearby Users ({nearbyUsers.length})</h3>
      </div>
      <div className="nearby-users-content">
        {nearbyUsers.map((user) => {
          const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.available;
          const distance = Math.round(user.distance || 0);

          return (
            <div
              key={user.id}
              className="nearby-user-item"
              onClick={(e) => onUserClick && onUserClick(user, e)}
            >
              <div className="user-info">
                <div className="user-avatar-mini">
                  {user.customization?.skinColor && (
                    <div
                      className="avatar-color-dot"
                      style={{ backgroundColor: user.customization.skinColor }}
                    />
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {user.name || 'Unknown'}
                    {user.isSpeaking && <span className="speaking-badge">🎤</span>}
                  </div>
                  <div className="user-meta">
                    <span className="status-badge" title={statusConfig.label}>
                      {statusConfig.icon}
                    </span>
                    <span className="distance-badge">
                      📍 {distance}m
                    </span>
                  </div>
                </div>
              </div>
              <div className="user-actions">
                <button
                  className="action-btn"
                  title="View Profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open profile
                  }}
                >
                  👤
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NearbyUsersList;
