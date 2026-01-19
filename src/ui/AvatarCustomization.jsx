import React, { useState, useEffect } from 'react';
import { AVATAR_CONFIG } from '../config/gameConfig';
import './AvatarCustomization.css';

/**
 * Avatar Customization UI - Personalização do avatar
 */
export function AvatarCustomization({
  isOpen,
  onClose,
  onApplyCustomization,
  currentCustomization = {},
}) {
  const [customization, setCustomization] = useState({
    skinColor: currentCustomization.skinColor || AVATAR_CONFIG.COLORS.SKIN[0],
    hairColor: currentCustomization.hairColor || AVATAR_CONFIG.COLORS.HAIR[0],
    shirtColor: currentCustomization.shirtColor || AVATAR_CONFIG.COLORS.SHIRT[0],
    pantsColor: currentCustomization.pantsColor || AVATAR_CONFIG.COLORS.PANTS[0],
  });

  /**
   * Atualiza cor
   */
  const updateColor = (type, color) => {
    setCustomization(prev => ({
      ...prev,
      [type]: color,
    }));
  };

  /**
   * Aplicar customização
   */
  const handleApply = () => {
    onApplyCustomization(customization);
    onClose();
  };

  /**
   * Randomizar cores
   */
  const handleRandomize = () => {
    const randomSkin = AVATAR_CONFIG.COLORS.SKIN[Math.floor(Math.random() * AVATAR_CONFIG.COLORS.SKIN.length)];
    const randomHair = AVATAR_CONFIG.COLORS.HAIR[Math.floor(Math.random() * AVATAR_CONFIG.COLORS.HAIR.length)];
    const randomShirt = AVATAR_CONFIG.COLORS.SHIRT[Math.floor(Math.random() * AVATAR_CONFIG.COLORS.SHIRT.length)];
    const randomPants = AVATAR_CONFIG.COLORS.PANTS[Math.floor(Math.random() * AVATAR_CONFIG.COLORS.PANTS.length)];

    setCustomization({
      skinColor: randomSkin,
      hairColor: randomHair,
      shirtColor: randomShirt,
      pantsColor: randomPants,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="customization-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="customization-header">
          <h2>🎨 Personalizar Avatar</h2>
          <button className="customization-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="customization-content">
          {/* Preview */}
          <div className="customization-preview">
            <h3>Pré-visualização</h3>
            <div className="avatar-preview">
              {/* Hair */}
              <div
                className="preview-hair"
                style={{ backgroundColor: customization.hairColor }}
              />
              {/* Head */}
              <div
                className="preview-head"
                style={{ backgroundColor: customization.skinColor }}
              />
              {/* Body */}
              <div
                className="preview-body"
                style={{ backgroundColor: customization.shirtColor }}
              />
              {/* Legs */}
              <div
                className="preview-legs"
                style={{ backgroundColor: customization.pantsColor }}
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="customization-colors">
            {/* Skin */}
            <div className="color-group">
              <label>Tom de Pele</label>
              <div className="color-palette">
                {AVATAR_CONFIG.COLORS.SKIN.map(color => (
                  <button
                    key={color}
                    className={`color-button ${customization.skinColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor('skinColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Hair */}
            <div className="color-group">
              <label>Cor do Cabelo</label>
              <div className="color-palette">
                {AVATAR_CONFIG.COLORS.HAIR.map(color => (
                  <button
                    key={color}
                    className={`color-button ${customization.hairColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor('hairColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Shirt */}
            <div className="color-group">
              <label>Cor da Camisa</label>
              <div className="color-palette">
                {AVATAR_CONFIG.COLORS.SHIRT.map(color => (
                  <button
                    key={color}
                    className={`color-button ${customization.shirtColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor('shirtColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Pants */}
            <div className="color-group">
              <label>Cor da Calça</label>
              <div className="color-palette">
                {AVATAR_CONFIG.COLORS.PANTS.map(color => (
                  <button
                    key={color}
                    className={`color-button ${customization.pantsColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateColor('pantsColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="customization-footer">
          <button className="btn-secondary" onClick={handleRandomize}>
            🎲 Aleatório
          </button>
          <div className="customization-footer-right">
            <button className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleApply}>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarCustomization;
