/**
 * Utility para salvar/carregar configurações do localStorage
 */

const SETTINGS_KEY = 'virtual-office-settings';

/**
 * Configurações padrão
 */
export const DEFAULT_SETTINGS = {
  audioInputId: 'default',
  audioOutputId: 'default',
  videoInputId: 'default',
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  vadThreshold: 0.02,
  vadSmoothingFrames: 5,
  vadSilenceDelay: 500,
  videoQuality: 'medium',
};

/**
 * Salva configurações no localStorage
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Error saving settings:', err);
    return false;
  }
}

/**
 * Carrega configurações do localStorage
 */
export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Reseta configurações para padrão
 */
export function resetSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.error('Error resetting settings:', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Converte qualidade de vídeo para constraints
 */
export function getVideoConstraints(quality) {
  switch (quality) {
    case 'low':
      return {
        width: { ideal: 160 },
        height: { ideal: 120 },
        frameRate: { ideal: 10 },
      };
    case 'high':
      return {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      };
    case 'medium':
    default:
      return {
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 },
      };
  }
}

/**
 * Converte settings para constraints de getUserMedia
 */
export function settingsToMediaConstraints(settings, includeVideo = false) {
  const constraints = {
    audio: {
      echoCancellation: settings.echoCancellation,
      noiseSuppression: settings.noiseSuppression,
      autoGainControl: settings.autoGainControl,
    },
    video: false,
  };

  // Adicionar deviceId se não for default
  if (settings.audioInputId && settings.audioInputId !== 'default') {
    constraints.audio.deviceId = { exact: settings.audioInputId };
  }

  // Adicionar vídeo se solicitado
  if (includeVideo) {
    constraints.video = getVideoConstraints(settings.videoQuality);

    if (settings.videoInputId && settings.videoInputId !== 'default') {
      constraints.video.deviceId = { exact: settings.videoInputId };
    }
  }

  return constraints;
}

/**
 * Converte settings para config do VAD
 */
export function settingsToVADConfig(settings) {
  return {
    threshold: settings.vadThreshold,
    smoothingFrames: settings.vadSmoothingFrames,
    silenceDelay: settings.vadSilenceDelay,
    fftSize: 256,
  };
}

export default {
  DEFAULT_SETTINGS,
  saveSettings,
  loadSettings,
  resetSettings,
  getVideoConstraints,
  settingsToMediaConstraints,
  settingsToVADConfig,
};
