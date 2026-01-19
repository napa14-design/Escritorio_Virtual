/**
 * Configuração de Emotes/Gestos
 */

export const EMOTES = {
  WAVE: 'wave',
  THUMBS_UP: 'thumbs_up',
  CLAP: 'clap',
  LAUGH: 'laugh',
  HEART: 'heart',
  PARTY: 'party',
  THINK: 'think',
  FIRE: 'fire',
};

export const EMOTE_CONFIG = {
  [EMOTES.WAVE]: {
    label: 'Acenar',
    icon: '👋',
    animation: 'wave',
    duration: 2000,
    key: '1',
  },
  [EMOTES.THUMBS_UP]: {
    label: 'Positivo',
    icon: '👍',
    animation: 'thumbs_up',
    duration: 2000,
    key: '2',
  },
  [EMOTES.CLAP]: {
    label: 'Aplaudir',
    icon: '👏',
    animation: 'clap',
    duration: 2000,
    key: '3',
  },
  [EMOTES.LAUGH]: {
    label: 'Rir',
    icon: '😂',
    animation: 'laugh',
    duration: 2000,
    key: '4',
  },
  [EMOTES.HEART]: {
    label: 'Coração',
    icon: '❤️',
    animation: 'heart',
    duration: 2000,
    key: '5',
  },
  [EMOTES.PARTY]: {
    label: 'Festa',
    icon: '🎉',
    animation: 'party',
    duration: 2000,
    key: '6',
  },
  [EMOTES.THINK]: {
    label: 'Pensar',
    icon: '🤔',
    animation: 'think',
    duration: 2000,
    key: '7',
  },
  [EMOTES.FIRE]: {
    label: 'Fogo',
    icon: '🔥',
    animation: 'fire',
    duration: 2000,
    key: '8',
  },
};

/**
 * Obter emote por tecla
 */
export function getEmoteByKey(key) {
  return Object.entries(EMOTE_CONFIG).find(
    ([, config]) => config.key === key
  )?.[0];
}
