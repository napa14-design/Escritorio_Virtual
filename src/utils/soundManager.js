/**
 * Sistema de sons para eventos do escritório virtual
 */
class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.5;
    this.loadSounds();
  }

  /**
   * Carrega sons usando Web Audio API
   */
  loadSounds() {
    // Criar sons sintéticos usando oscillators
    this.createSound('userJoined', 'notification');
    this.createSound('userLeft', 'notification-low');
    this.createSound('mention', 'alert');
    this.createSound('knock', 'knock');
    this.createSound('message', 'pop');
    this.createSound('emote', 'pop-soft');
  }

  /**
   * Cria som sintético
   */
  createSound(name, type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
      'notification': () => {
        // Som de notificação agradável (dó-mi)
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator1.frequency.value = 523; // C5
        oscillator2.frequency.value = 659; // E5
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3 * this.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime + 0.05);
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.35);
      },
      'notification-low': () => {
        // Som mais baixo para saída
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 392; // G4
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2 * this.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      },
      'alert': () => {
        // Som de alerta para @mention
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15 * this.volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      },
      'knock': () => {
        // Som de batida
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 150;
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.4 * this.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      },
      'pop': () => {
        // Som de pop para mensagens
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 1000;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2 * this.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      },
      'pop-soft': () => {
        // Som suave para emotes
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 600;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1 * this.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.08);
      },
    };

    this.sounds.set(name, sounds[type] || sounds['pop']);
  }

  /**
   * Toca um som
   */
  play(soundName) {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        sound();
      } catch (error) {
        console.warn('Error playing sound:', error);
      }
    }
  }

  /**
   * Define volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Ativa/desativa sons
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Retorna se está ativado
   */
  isEnabled() {
    return this.enabled;
  }
}

// Singleton
let soundManagerInstance = null;

export function getSoundManager() {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}

export default getSoundManager;
