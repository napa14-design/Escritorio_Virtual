/**
 * Configuração de Zonas de Áudio (estilo Gather.town)
 *
 * Tipos de zonas:
 * - normal: Proximidade padrão (volume baseado em distância)
 * - private: Sala fechada - só quem está dentro ouve
 * - broadcast: Todos na zona ouvem, sem limite de distância
 * - spotlight: Um/poucos falam, todos na zona ouvem
 * - quiet: Zona silenciosa - sem áudio
 */

export const AUDIO_ZONE_TYPES = {
  NORMAL: 'normal',
  PRIVATE: 'private',
  BROADCAST: 'broadcast',
  SPOTLIGHT: 'spotlight',
  QUIET: 'quiet',
};

/**
 * Configuração padrão de uma zona de áudio
 */
export class AudioZone {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || AUDIO_ZONE_TYPES.NORMAL;
    this.bounds = config.bounds; // { x, y, width, height }
    this.color = config.color || '#3b82f6';
    this.opacity = config.opacity || 0.2;
    this.maxParticipants = config.maxParticipants || null;
    this.icon = config.icon || '🔊';
    this.description = config.description || '';

    // Configurações específicas por tipo
    this.allowVideo = config.allowVideo !== false;
    this.allowScreenShare = config.allowScreenShare !== false;

    // Para tipo spotlight
    this.speakers = config.speakers || []; // Array de user IDs que podem falar
    this.autoMuteNonSpeakers = config.autoMuteNonSpeakers !== false;
  }

  /**
   * Verifica se uma posição está dentro da zona
   */
  containsPosition(x, y) {
    return (
      x >= this.bounds.x &&
      x < this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y < this.bounds.y + this.bounds.height
    );
  }

  /**
   * Verifica se a zona está cheia
   */
  isFull(currentParticipants) {
    if (!this.maxParticipants) return false;
    return currentParticipants >= this.maxParticipants;
  }

  /**
   * Retorna descrição baseada no tipo
   */
  getDescription() {
    if (this.description) return this.description;

    switch (this.type) {
      case AUDIO_ZONE_TYPES.PRIVATE:
        return 'Sala privada - Apenas quem está dentro pode ouvir';
      case AUDIO_ZONE_TYPES.BROADCAST:
        return 'Área aberta - Todos ouvem sem limite de distância';
      case AUDIO_ZONE_TYPES.SPOTLIGHT:
        return 'Apresentação - Palestrantes têm a palavra';
      case AUDIO_ZONE_TYPES.QUIET:
        return 'Zona silenciosa - Sem conversas por voz';
      case AUDIO_ZONE_TYPES.NORMAL:
      default:
        return 'Área normal - Volume por proximidade';
    }
  }
}

/**
 * Zonas pré-definidas para o escritório virtual
 */
export const DEFAULT_AUDIO_ZONES = [
  // Sala de Reunião 1 (Privada)
  new AudioZone({
    id: 'meeting-room-1',
    name: 'Sala de Reunião 1',
    type: AUDIO_ZONE_TYPES.PRIVATE,
    bounds: { x: 2, y: 2, width: 6, height: 5 },
    color: '#ef4444',
    maxParticipants: 8,
    icon: '🚪',
  }),

  // Sala de Reunião 2 (Privada)
  new AudioZone({
    id: 'meeting-room-2',
    name: 'Sala de Reunião 2',
    type: AUDIO_ZONE_TYPES.PRIVATE,
    bounds: { x: 22, y: 2, width: 6, height: 5 },
    color: '#ef4444',
    maxParticipants: 8,
    icon: '🚪',
  }),

  // Área de Apresentação (Spotlight)
  new AudioZone({
    id: 'presentation-area',
    name: 'Auditório',
    type: AUDIO_ZONE_TYPES.SPOTLIGHT,
    bounds: { x: 10, y: 15, width: 10, height: 8 },
    color: '#8b5cf6',
    maxParticipants: 30,
    icon: '📺',
    autoMuteNonSpeakers: true,
  }),

  // Zona de Foco (Silenciosa)
  new AudioZone({
    id: 'focus-zone',
    name: 'Zona de Foco',
    type: AUDIO_ZONE_TYPES.QUIET,
    bounds: { x: 24, y: 15, width: 5, height: 5 },
    color: '#64748b',
    icon: '🔇',
  }),

  // Copa/Cozinha (Broadcast)
  new AudioZone({
    id: 'break-room',
    name: 'Copa',
    type: AUDIO_ZONE_TYPES.BROADCAST,
    bounds: { x: 10, y: 2, width: 8, height: 5 },
    color: '#10b981',
    icon: '☕',
  }),
];

/**
 * Encontra zona que contém uma posição
 */
export function findZoneAtPosition(x, y, zones = DEFAULT_AUDIO_ZONES) {
  return zones.find(zone => zone.containsPosition(x, y));
}

/**
 * Filtra usuários que estão na mesma zona
 */
export function getUsersInSameZone(userPosition, allUsers, zones = DEFAULT_AUDIO_ZONES) {
  const userZone = findZoneAtPosition(userPosition.x, userPosition.y, zones);

  if (!userZone) {
    // Usuário está em área normal (sem zona)
    return allUsers.filter(u => {
      const zone = findZoneAtPosition(u.position.x, u.position.y, zones);
      return !zone; // Apenas usuários também sem zona
    });
  }

  // Usuário está em uma zona
  return allUsers.filter(u => {
    const zone = findZoneAtPosition(u.position.x, u.position.y, zones);
    return zone && zone.id === userZone.id;
  });
}

/**
 * Verifica se um usuário pode ouvir outro baseado em zonas
 */
export function canHearUser(listenerPos, speakerPos, speakerId, zones = DEFAULT_AUDIO_ZONES) {
  const listenerZone = findZoneAtPosition(listenerPos.x, listenerPos.y, zones);
  const speakerZone = findZoneAtPosition(speakerPos.x, speakerPos.y, zones);

  // Ambos em área normal
  if (!listenerZone && !speakerZone) {
    return { canHear: true, reason: 'normal' };
  }

  // Em zonas diferentes
  if (listenerZone?.id !== speakerZone?.id) {
    return { canHear: false, reason: 'different-zones' };
  }

  // Na mesma zona
  const zone = listenerZone;

  switch (zone.type) {
    case AUDIO_ZONE_TYPES.QUIET:
      return { canHear: false, reason: 'quiet-zone' };

    case AUDIO_ZONE_TYPES.SPOTLIGHT:
      // Apenas speakers podem ser ouvidos
      const isSpeaker = zone.speakers.length === 0 || zone.speakers.includes(speakerId);
      return {
        canHear: isSpeaker,
        reason: isSpeaker ? 'spotlight-speaker' : 'spotlight-muted',
      };

    case AUDIO_ZONE_TYPES.PRIVATE:
    case AUDIO_ZONE_TYPES.BROADCAST:
    case AUDIO_ZONE_TYPES.NORMAL:
    default:
      return { canHear: true, reason: 'same-zone' };
  }
}

export default {
  AUDIO_ZONE_TYPES,
  AudioZone,
  DEFAULT_AUDIO_ZONES,
  findZoneAtPosition,
  getUsersInSameZone,
  canHearUser,
};
