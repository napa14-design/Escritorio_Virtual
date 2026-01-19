import { useEffect } from 'react';
import { getEmoteByKey } from '../config/emotes';

/**
 * Hook para gerenciar atalhos de teclado dos emotes
 */
export function useEmoteShortcuts(onEmoteSelect, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event) => {
      // Ignorar se estiver digitando em input/textarea
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      // Verificar se é uma tecla numérica (1-8)
      const key = event.key;
      if (key >= '1' && key <= '8') {
        const emote = getEmoteByKey(key);
        if (emote) {
          event.preventDefault();
          onEmoteSelect(emote);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [onEmoteSelect, enabled]);
}

export default useEmoteShortcuts;
