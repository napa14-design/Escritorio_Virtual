import { useState, useEffect, useRef } from 'react';

/**
 * Hook para gerenciar modo de seguir outro usuário
 */
export function useFollowMode(phaserGame, allUsers) {
  const [followingUserId, setFollowingUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const intervalRef = useRef(null);

  /**
   * Inicia follow mode
   */
  const startFollowing = (userId) => {
    if (!userId || !phaserGame) return;

    setFollowingUserId(userId);
    setIsFollowing(true);

    console.log(`Following user: ${userId}`);
  };

  /**
   * Para follow mode
   */
  const stopFollowing = () => {
    setFollowingUserId(null);
    setIsFollowing(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log('Stopped following');
  };

  /**
   * Atualiza posição do jogador para seguir o usuário
   */
  useEffect(() => {
    if (!isFollowing || !followingUserId || !phaserGame) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene || !scene.player) return;

    // Atualizar posição periodicamente
    intervalRef.current = setInterval(() => {
      const targetUser = allUsers.find(u => u.id === followingUserId);

      if (!targetUser) {
        // Usuário não encontrado, parar de seguir
        stopFollowing();
        return;
      }

      const targetPos = targetUser.position;
      if (!targetPos) return;

      // Verificar distância atual
      const playerPos = scene.player.getGridPosition();
      const distance = Math.sqrt(
        Math.pow(targetPos.x - playerPos.x, 2) +
        Math.pow(targetPos.y - playerPos.y, 2)
      );

      // Se estiver longe demais (mais de 2 tiles), mover para perto
      if (distance > 2) {
        // Mover para uma posição próxima ao usuário
        const offsetX = Math.random() > 0.5 ? 1 : -1;
        const offsetY = Math.random() > 0.5 ? 1 : -1;

        scene.player.moveToGrid(
          targetPos.x + offsetX,
          targetPos.y + offsetY,
          scene.pathfinding
        );
      }
    }, 500); // Atualizar a cada 500ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isFollowing, followingUserId, phaserGame, allUsers]);

  /**
   * Para de seguir se o jogador se mover manualmente
   */
  useEffect(() => {
    if (!isFollowing || !phaserGame) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene) return;

    // Listener para cliques do mouse
    const handlePointerDown = () => {
      // Se o jogador clicar, parar de seguir
      stopFollowing();
    };

    scene.input.on('pointerdown', handlePointerDown);

    return () => {
      scene.input.off('pointerdown', handlePointerDown);
    };
  }, [isFollowing, phaserGame]);

  return {
    followingUserId,
    isFollowing,
    startFollowing,
    stopFollowing,
  };
}

export default useFollowMode;
