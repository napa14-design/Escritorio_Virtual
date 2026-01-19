import React, { useState } from 'react';
import { USER_STATUS, STATUS_CONFIG } from '../config/userStatus';
import './StatusSelector.css';

/**
 * Status Selector - Seletor de status do usuário
 */
export function StatusSelector({ currentStatus, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectStatus = (status) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const currentConfig = STATUS_CONFIG[currentStatus];

  return (
    <div className="status-selector">
      <button
        className="status-button"
        onClick={() => setIsOpen(!isOpen)}
        title={currentConfig.description}
      >
        <span className="status-icon">{currentConfig.icon}</span>
        <span className="status-label">{currentConfig.label}</span>
        <span className="status-arrow">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <>
          <div className="status-overlay" onClick={() => setIsOpen(false)} />
          <div className="status-dropdown">
            {Object.entries(USER_STATUS).map(([key, value]) => {
              const config = STATUS_CONFIG[value];
              const isActive = currentStatus === value;

              return (
                <button
                  key={value}
                  className={`status-option ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectStatus(value)}
                >
                  <span className="status-option-icon">{config.icon}</span>
                  <div className="status-option-text">
                    <div className="status-option-label">{config.label}</div>
                    <div className="status-option-description">{config.description}</div>
                  </div>
                  {isActive && <span className="status-checkmark">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default StatusSelector;
