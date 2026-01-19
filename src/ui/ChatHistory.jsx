import React, { useState, useEffect, useRef } from 'react';
import './ChatHistory.css';

/**
 * ChatHistory - Histórico de mensagens do chat
 */
export function ChatHistory({
  messages = [],
  currentUserId,
  onClear,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Se recebeu nova mensagem
    if (messages.length > prevMessagesLengthRef.current) {
      if (isCollapsed) {
        // Incrementar unread se colapsado
        setUnreadCount(prev => prev + (messages.length - prevMessagesLengthRef.current));
      } else {
        // Scroll para baixo se expandido
        scrollToBottom();
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isCollapsed]);

  // Resetar unread ao expandir
  useEffect(() => {
    if (!isCollapsed) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isCollapsed]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEmojiOnly = (text) => {
    return /^[\p{Emoji}\s]+$/u.test(text) && text.length <= 10;
  };

  const handleClear = () => {
    if (window.confirm('Limpar todo o histórico de chat?')) {
      onClear?.();
    }
  };

  return (
    <div className={`chat-history-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div
        className="chat-history-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="chat-history-title">
          <span>💬 Chat</span>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <button className="collapse-btn">
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      {/* Messages List */}
      {!isCollapsed && (
        <>
          <div className="chat-messages-list">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-state-icon">💬</div>
                <div>Nenhuma mensagem ainda</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>
                  Digite algo para começar a conversar!
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.userId === currentUserId;
                const isEmoji = isEmojiOnly(msg.text);

                const messageClass = [
                  'chat-message-item',
                  isOwn && 'own-message',
                  msg.isWhisper && 'whisper',
                  isEmoji && 'emoji-only',
                ].filter(Boolean).join(' ');

                return (
                  <div key={index} className={messageClass}>
                    <div className="chat-message-header">
                      <span className="chat-message-author">
                        {isOwn ? 'Você' : msg.userName}
                      </span>
                      {msg.isWhisper && (
                        <span className="whisper-badge">🔒 Privado</span>
                      )}
                      <span className="chat-message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="chat-message-text">{msg.text}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Actions */}
          {messages.length > 0 && (
            <div className="chat-history-footer">
              <button className="chat-action-btn" onClick={handleClear}>
                Limpar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChatHistory;
