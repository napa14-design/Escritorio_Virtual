import { AVATAR_CONFIG } from '../config/gameConfig';

/**
 * Utility para salvar/carregar customização de avatar no localStorage
 */

const AVATAR_KEY = 'virtual-office-avatar';

/**
 * Customização padrão
 */
export const DEFAULT_AVATAR_CUSTOMIZATION = {
  skinColor: AVATAR_CONFIG.COLORS.SKIN[0],
  hairColor: AVATAR_CONFIG.COLORS.HAIR[0],
  shirtColor: AVATAR_CONFIG.COLORS.SHIRT[0],
  pantsColor: AVATAR_CONFIG.COLORS.PANTS[0],
};

/**
 * Salva customização no localStorage
 */
export function saveAvatarCustomization(customization) {
  try {
    localStorage.setItem(AVATAR_KEY, JSON.stringify(customization));
    return true;
  } catch (err) {
    console.error('Error saving avatar customization:', err);
    return false;
  }
}

/**
 * Carrega customização do localStorage
 */
export function loadAvatarCustomization() {
  try {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_AVATAR_CUSTOMIZATION, ...parsed };
    }
  } catch (err) {
    console.error('Error loading avatar customization:', err);
  }

  return DEFAULT_AVATAR_CUSTOMIZATION;
}

/**
 * Reseta customização para padrão
 */
export function resetAvatarCustomization() {
  try {
    localStorage.removeItem(AVATAR_KEY);
    return DEFAULT_AVATAR_CUSTOMIZATION;
  } catch (err) {
    console.error('Error resetting avatar customization:', err);
    return DEFAULT_AVATAR_CUSTOMIZATION;
  }
}

/**
 * Valida customização (garante que cores existem nas paletas)
 */
export function validateCustomization(customization) {
  const validated = { ...DEFAULT_AVATAR_CUSTOMIZATION };

  if (customization.skinColor && AVATAR_CONFIG.COLORS.SKIN.includes(customization.skinColor)) {
    validated.skinColor = customization.skinColor;
  }

  if (customization.hairColor && AVATAR_CONFIG.COLORS.HAIR.includes(customization.hairColor)) {
    validated.hairColor = customization.hairColor;
  }

  if (customization.shirtColor && AVATAR_CONFIG.COLORS.SHIRT.includes(customization.shirtColor)) {
    validated.shirtColor = customization.shirtColor;
  }

  if (customization.pantsColor && AVATAR_CONFIG.COLORS.PANTS.includes(customization.pantsColor)) {
    validated.pantsColor = customization.pantsColor;
  }

  return validated;
}

export default {
  DEFAULT_AVATAR_CUSTOMIZATION,
  saveAvatarCustomization,
  loadAvatarCustomization,
  resetAvatarCustomization,
  validateCustomization,
};
