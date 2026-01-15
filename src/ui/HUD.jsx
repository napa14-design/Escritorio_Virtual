import React from 'react';
import './HUD.css';

const HUD = ({ editMode, onToggleEditMode, onToggleSidebar, selectedObject, playerName }) => {
  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top">
        <div className="hud-player-info">
          <div className="player-avatar">👤</div>
          <div className="player-details">
            <div className="player-name">{playerName}</div>
            <div className="player-status">Online</div>
          </div>
        </div>

        <div className="hud-mode-badge">
          {editMode ? '🛠️ Modo Edição' : '🚶 Modo Navegação'}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="hud-bottom">
        <button
          className={`tool-btn ${editMode ? 'active' : ''}`}
          onClick={onToggleEditMode}
          title="Toggle Edit Mode (E)"
        >
          <span className="tool-icon">🛠️</span>
          <span className="tool-label">Editor</span>
        </button>

        <button
          className="tool-btn"
          onClick={onToggleSidebar}
          title="Open Menu (Tab)"
        >
          <span className="tool-icon">📦</span>
          <span className="tool-label">Objetos</span>
        </button>

        <button
          className="tool-btn"
          onClick={() => {}}
          title="Avatar Customization"
        >
          <span className="tool-icon">👕</span>
          <span className="tool-label">Avatar</span>
        </button>

        <button
          className="tool-btn"
          onClick={() => {}}
          title="Settings"
        >
          <span className="tool-icon">⚙️</span>
          <span className="tool-label">Config</span>
        </button>
      </div>

      {/* Selection Info */}
      {editMode && selectedObject && (
        <div className="selection-info">
          <div className="selection-header">
            <span className="selection-icon">{selectedObject.objectData.icon}</span>
            <span className="selection-name">{selectedObject.objectData.name}</span>
          </div>
          <div className="selection-details">
            <div className="detail-item">
              <span className="detail-label">Posição:</span>
              <span className="detail-value">({selectedObject.gridX}, {selectedObject.gridY})</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tamanho:</span>
              <span className="detail-value">{selectedObject.objectWidth}x{selectedObject.objectHeight}</span>
            </div>
          </div>
          <button className="btn-delete">
            <span>🗑️</span> Remover (Del)
          </button>
        </div>
      )}

      {/* Controls Hint */}
      <div className="controls-hint">
        <div className="hint-row">
          <kbd>Click</kbd> {editMode ? 'Selecionar' : 'Mover'} •
          <kbd>E</kbd> Editor •
          <kbd>Tab</kbd> Menu
          {editMode && <> • <kbd>Del</kbd> Remover</>}
        </div>
      </div>
    </div>
  );
};

export default HUD;
