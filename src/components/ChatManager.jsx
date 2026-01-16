import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatInput from '../ui/ChatInput';
import ChatHistory from '../ui/ChatHistory';
import ChatBubble from './ChatBubble';

/**
 * ChatManager - Gerencia sistema completo de chat
 */
export function ChatManager({
  networkManager,
  phaserGame,
  currentUser,
  allUsers,
  localUserId,
}) {
  const [messages, setMessages] = useState([]);
  const [activeBubbles, setActiveBubbles] = useState(new Map());
  const bubblesRef = useRef(new Map());

  // Sincronizar ref
  useEffect(() => {
    bubblesRef.current = activeBubbles;
  }, [activeBubbles]);

  /**
   * Envia mensagem para o servidor
   */
  const handleSendMessage = useCallback((messageData) => {
    if (!networkManager) return;

    const message = {
      text: messageData.text,
      userId: localUserId,
      userName: currentUser?.name || 'Player',
      timestamp: Date.now(),
      isWhisper: messageData.isWhisper || false,
      targetUserId: messageData.target || null,
    };

    // Enviar via NetworkManager
    networkManager.sendChatMessage(message);

    // Adicionar ao histórico local imediatamente
    setMessages(prev => [...prev, message]);

    // Mostrar bolha sobre próprio avatar
    showChatBubble(localUserId, message);
  }, [networkManager, localUserId, currentUser]);

  /**
   * Recebe mensagem do servidor
   */
  useEffect(() => {
    if (!networkManager) return;

    const handleChatMessage = (message) => {
      // Não adicionar se for própria mensagem (já adicionou)
      if (message.userId === localUserId) return;

      // Verificar se é whisper para mim
      if (message.isWhisper && message.targetUserId !== localUserId) {
        return; // Não mostrar whispers de outros
      }

      // Adicionar ao histórico
      setMessages(prev => [...prev, message]);

      // Mostrar bolha
      showChatBubble(message.userId, message);
    };

    // Listener via evento customizado
    const socket = networkManager.getSocket();
    if (socket) {
      socket.on('chat-message', handleChatMessage);

      return () => {
        socket.off('chat-message', handleChatMessage);
      };
    }
  }, [networkManager, localUserId]);

  /**
   * Mostra bolha de chat sobre o avatar
   */
  const showChatBubble = useCallback((userId, message) => {
    if (!phaserGame) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene) return;

    // Encontrar avatar (player ou remote)
    let avatar;
    if (userId === localUserId) {
      avatar = scene.player;
    } else {
      avatar = scene.remoteAvatars?.get(userId);
    }

    if (!avatar) return;

    // Calcular posição da bolha (acima do avatar)
    const avatarWorldPos = {
      x: avatar.x,
      y: avatar.y - 60, // 60px acima do avatar
    };

    // Criar ID único para a bolha
    const bubbleId = `${userId}-${Date.now()}`;

    // Adicionar bolha
    setActiveBubbles(prev => {
      const newBubbles = new Map(prev);

      // Remover bolha anterior deste usuário (se existir)
      prev.forEach((bubble, id) => {
        if (id.startsWith(userId)) {
          newBubbles.delete(id);
        }
      });

      // Adicionar nova bolha
      newBubbles.set(bubbleId, {
        id: bubbleId,
        userId,
        message: message.text,
        author: message.userName,
        position: avatarWorldPos,
        isOwnMessage: userId === localUserId,
        isWhisper: message.isWhisper,
        timestamp: Date.now(),
      });

      return newBubbles;
    });

    // Remover após 5 segundos
    setTimeout(() => {
      setActiveBubbles(prev => {
        const newBubbles = new Map(prev);
        newBubbles.delete(bubbleId);
        return newBubbles;
      });
    }, 5000);
  }, [phaserGame, localUserId]);

  /**
   * Atualiza posições das bolhas quando avatares se movem
   */
  useEffect(() => {
    if (!phaserGame) return;

    const scene = phaserGame.scene.scenes[0];
    if (!scene) return;

    const updateInterval = setInterval(() => {
      if (activeBubbles.size === 0) return;

      setActiveBubbles(prev => {
        const newBubbles = new Map();
        let hasChanges = false;

        prev.forEach((bubble, id) => {
          // Encontrar avatar
          let avatar;
          if (bubble.userId === localUserId) {
            avatar = scene.player;
          } else {
            avatar = scene.remoteAvatars?.get(bubble.userId);
          }

          if (avatar) {
            const newPos = {
              x: avatar.x,
              y: avatar.y - 60,
            };

            // Verificar se posição mudou
            if (newPos.x !== bubble.position.x || newPos.y !== bubble.position.y) {
              hasChanges = true;
              newBubbles.set(id, {
                ...bubble,
                position: newPos,
              });
            } else {
              newBubbles.set(id, bubble);
            }
          }
        });

        return hasChanges ? newBubbles : prev;
      });
    }, 100); // Atualizar a cada 100ms

    return () => clearInterval(updateInterval);
  }, [phaserGame, activeBubbles, localUserId]);

  /**
   * Limpa histórico de chat
   */
  const handleClearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <>
      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={!networkManager}
      />

      {/* Chat History */}
      <ChatHistory
        messages={messages}
        currentUserId={localUserId}
        onClear={handleClearHistory}
      />

      {/* Chat Bubbles (overlay sobre Phaser) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
      }}>
        {Array.from(activeBubbles.values()).map(bubble => (
          <ChatBubble
            key={bubble.id}
            message={bubble.message}
            author={bubble.author}
            position={bubble.position}
            isOwnMessage={bubble.isOwnMessage}
            isWhisper={bubble.isWhisper}
            duration={5000}
            onExpire={() => {
              setActiveBubbles(prev => {
                const newBubbles = new Map(prev);
                newBubbles.delete(bubble.id);
                return newBubbles;
              });
            }}
          />
        ))}
      </div>
    </>
  );
}

export default ChatManager;
