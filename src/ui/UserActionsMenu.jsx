import React from 'react';
import './UserActionsMenu.css';

/**
 * Menu de ações rápidas para interagir com um usuário
 */
export function UserActionsMenu({ user, position, onClose, onAction }) {
  if (!user) return null;

  const actions = [
    {
      id: 'teleport',
      label: 'Teleport to User',
      icon: '🚀',
      description: 'Jump to their location',
      color: '#3b82f6',
    },
    {
      id: 'follow',
      label: 'Follow User',
      icon: '👣',
      description: 'Automatically follow them',
      color: '#10b981',
    },
    {
      id: 'knock',
      label: 'Knock/Poke',
      icon: '👋',
      description: 'Get their attention',
      color: '#f59e0b',
    },
    {
      id: 'chat',
      label: 'Private Chat',
      icon: '💬',
      description: 'Send private message',
      color: '#8b5cf6',
    },
    {
      id: 'profile',
      label: 'View Profile',
      icon: '👤',
      description: 'See user details',
      color: '#6b7280',
    },
  ];

  const handleAction = (actionId) => {
    if (onAction) {
      onAction(actionId, user);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="user-actions-overlay" onClick={onClose} />
      <div
        className="user-actions-menu"
        style={{
          top: position?.y || '50%',
          left: position?.x || '50%',
        }}
      >
        <div className="menu-header">
          <div className="user-info-compact">
            {user.customization?.skinColor && (
              <div
                className="avatar-dot"
                style={{ backgroundColor: user.customization.skinColor }}
              />
            )}
            <span className="user-name-compact">{user.name || 'Unknown'}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="menu-actions">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-item"
              onClick={() => handleAction(action.id)}
              style={{ '--action-color': action.color }}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-details">
                <div className="action-label">{action.label}</div>
                <div className="action-description">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default UserActionsMenu;
