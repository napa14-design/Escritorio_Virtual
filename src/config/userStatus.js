/**
 * Configuração de Status de Usuário
 */

export const USER_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away',
  DO_NOT_DISTURB: 'do_not_disturb',
};

export const STATUS_CONFIG = {
  [USER_STATUS.AVAILABLE]: {
    label: 'Disponível',
    icon: '🟢',
    color: '#10b981',
    description: 'Disponível para conversar',
  },
  [USER_STATUS.BUSY]: {
    label: 'Ocupado',
    icon: '🔴',
    color: '#ef4444',
    description: 'Ocupado, mas pode responder',
  },
  [USER_STATUS.AWAY]: {
    label: 'Ausente',
    icon: '🟡',
    color: '#f59e0b',
    description: 'Ausente temporariamente',
  },
  [USER_STATUS.DO_NOT_DISTURB]: {
    label: 'Não Perturbe',
    icon: '⛔',
    color: '#8b5cf6',
    description: 'Não perturbe, focado',
  },
};

/**
 * Tempo de inatividade antes de marcar como "ausente" (ms)
 */
export const AUTO_AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutos

/**
 * Status padrão
 */
export const DEFAULT_STATUS = USER_STATUS.AVAILABLE;
