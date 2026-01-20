import { useEffect, useRef } from 'react';
import { getSoundManager } from '../utils/soundManager';

/**
 * Hook para notificar quando usuários entram/saem da zona de proximidade
 */
export function useProximityNotifications(nearbyUsers, toast, enabled = true) {
  const previousNearbyRef = useRef(new Set());
  const soundManager = getSoundManager();

  useEffect(() => {
    if (!enabled || !nearbyUsers) return;

    const currentNearby = new Set(nearbyUsers.map(u => u.id));
    const previousNearby = previousNearbyRef.current;

    // Usuários que entraram na zona
    const entered = [...currentNearby].filter(id => !previousNearby.has(id));

    // Usuários que saíram da zona
    const left = [...previousNearby].filter(id => !currentNearby.has(id));

    // Notificar entradas
    entered.forEach(userId => {
      const user = nearbyUsers.find(u => u.id === userId);
      if (user) {
        soundManager.play('userJoined');
        toast.info(`👋 ${user.name} is nearby`, { duration: 2500 });
      }
    });

    // Notificar saídas
    left.forEach(userId => {
      // Buscar nos usuários anteriores
      const previousUsers = Array.from(previousNearby).map(id => ({ id }));
      // Precisaríamos guardar os dados completos, por enquanto só notificamos o ID
      soundManager.play('userLeft');
      toast.info(`👋 User left proximity`, { duration: 2000 });
    });

    // Atualizar referência
    previousNearbyRef.current = currentNearby;
  }, [nearbyUsers, toast, enabled, soundManager]);

  return {
    // Pode retornar métodos úteis se necessário
  };
}

export default useProximityNotifications;
