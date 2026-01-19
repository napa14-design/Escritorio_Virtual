import React, { useState } from 'react';
import { EMOTES, EMOTE_CONFIG } from '../config/emotes';
import './EmoteSelector.css';

/**
 * Emote Selector - Seletor de emotes/gestos
 */
export function EmoteSelector({ onEmoteSelect, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmoteClick = (emote) => {
    onEmoteSelect(emote);
    setIsOpen(false);
  };

  return (
    <div className="emote-selector">
      <button
        className={`emote-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        title="Emotes (1-8)"
      >
        😊
      </button>

      {isOpen && (
        <>
          <div className="emote-overlay" onClick={() => setIsOpen(false)} />
          <div className="emote-panel">
            <div className="emote-header">
              <span>Emotes & Gestos</span>
              <button className="emote-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className="emote-grid">
              {Object.entries(EMOTES).map(([key, value]) => {
                const config = EMOTE_CONFIG[value];
                return (
                  <button
                    key={value}
                    className="emote-button"
                    onClick={() => handleEmoteClick(value)}
                    title={`${config.label} (${config.key})`}
                  >
                    <span className="emote-icon">{config.icon}</span>
                    <span className="emote-label">{config.label}</span>
                    <span className="emote-key">{config.key}</span>
                  </button>
                );
              })}
            </div>
            <div className="emote-hint">
              💡 Pressione 1-8 para usar emotes rapidamente
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmoteSelector;
