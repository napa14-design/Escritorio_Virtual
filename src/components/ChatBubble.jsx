import React, { useEffect, useState } from 'react';
import './ChatBubble.css';

/**
 * ChatBubble - Bolha de chat que aparece sobre o avatar (estilo Habbo Hotel)
 */
export function ChatBubble({
  message,
  author,
  position,
  isOwnMessage = false,
  isWhisper = false,
  duration = 5000,
  onExpire,
}) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (duration <= 0) return;

    // Começar fade antes de expirar
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 300);

    // Expirar totalmente
    const expireTimer = setTimeout(() => {
      if (onExpire) onExpire();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(expireTimer);
    };
  }, [duration, onExpire]);

  // Detectar se é apenas emoji
  const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(message) && message.length <= 10;

  const bubbleClass = [
    'chat-bubble',
    isFading && 'fading',
    isOwnMessage && 'own-message',
    isWhisper && 'whisper',
    isEmojiOnly && 'emoji-only',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={bubbleClass}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {!isEmojiOnly && author && (
        <div className="chat-bubble-author">{author}</div>
      )}
      <div className="chat-bubble-text">{message}</div>
    </div>
  );
}

export default ChatBubble;
