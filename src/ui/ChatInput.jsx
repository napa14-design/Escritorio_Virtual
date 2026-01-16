import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const QUICK_EMOJIS = ['👋', '👍', '😂', '❤️', '🎉', '🤔', '👀', '🔥'];
const MAX_MESSAGE_LENGTH = 200;

/**
 * ChatInput - Input de chat com emojis rápidos
 */
export function ChatInput({
  onSendMessage,
  placeholder = 'Digite uma mensagem... (Enter para enviar)',
  disabled = false,
}) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [whisperMode, setWhisperMode] = useState(false);
  const [whisperTarget, setWhisperTarget] = useState(null);
  const inputRef = useRef(null);

  // Focus no input quando apertar Enter
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !isFocused && document.activeElement.tagName !== 'INPUT') {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFocused]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSendMessage({
      text: trimmed,
      isWhisper: whisperMode,
      target: whisperTarget,
    });

    setMessage('');

    // Manter foco se não for whisper
    if (!whisperMode) {
      inputRef.current?.focus();
    } else {
      // Desativar whisper mode após enviar
      setWhisperMode(false);
      setWhisperTarget(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // ESC para cancelar whisper
    if (e.key === 'Escape' && whisperMode) {
      setWhisperMode(false);
      setWhisperTarget(null);
    }
  };

  const handleEmojiClick = (emoji) => {
    // Enviar emoji diretamente
    onSendMessage({
      text: emoji,
      isWhisper: whisperMode,
      target: whisperTarget,
    });

    if (whisperMode) {
      setWhisperMode(false);
      setWhisperTarget(null);
    }
  };

  const charCount = message.length;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;

  const charCountClass = [
    'char-count',
    isOverLimit && 'error',
    isNearLimit && !isOverLimit && 'warning',
  ].filter(Boolean).join(' ');

  return (
    <div className={`chat-input-container ${isFocused ? 'focused' : ''}`}>
      {/* Quick Emoji Bar */}
      <div className="emoji-quick-bar">
        {QUICK_EMOJIS.map(emoji => (
          <button
            key={emoji}
            className="emoji-btn"
            onClick={() => handleEmojiClick(emoji)}
            title={`Enviar ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Wrapper */}
      <div className={`chat-input-wrapper ${isFocused ? 'focused' : ''}`}>
        {/* Whisper Indicator */}
        {whisperMode && (
          <div className="whisper-indicator">
            <span>🔒 Whisper</span>
            {whisperTarget && <span>→ {whisperTarget}</span>}
            <button onClick={() => {
              setWhisperMode(false);
              setWhisperTarget(null);
            }}>✕</button>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={MAX_MESSAGE_LENGTH + 10}
        />

        {/* Character Count */}
        {charCount > 0 && (
          <span className={charCountClass}>
            {charCount}/{MAX_MESSAGE_LENGTH}
          </span>
        )}

        {/* Send Button */}
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!message.trim() || isOverLimit || disabled}
          title="Enviar (Enter)"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
