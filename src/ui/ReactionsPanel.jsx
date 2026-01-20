import React from 'react';
import './ReactionsPanel.css';

/**
 * ReactionsPanel - Reactions rápidas para meetings (estilo Zoom/Teams)
 */
export function ReactionsPanel({ onReaction, disabled }) {
  const reactions = [
    { id: 'thumbsup', emoji: '👍', label: 'Thumbs Up' },
    { id: 'clap', emoji: '👏', label: 'Clap' },
    { id: 'love', emoji: '❤️', label: 'Love' },
    { id: 'laugh', emoji: '😂', label: 'Laugh' },
    { id: 'wow', emoji: '😮', label: 'Wow' },
    { id: 'celebrate', emoji: '🎉', label: 'Celebrate' },
    { id: 'rocket', emoji: '🚀', label: 'Rocket' },
    { id: 'fire', emoji: '🔥', label: 'Fire' },
    { id: 'check', emoji: '✅', label: 'Check' },
    { id: 'question', emoji: '❓', label: 'Question' },
  ];

  const handleReaction = (reaction) => {
    if (!disabled && onReaction) {
      onReaction(reaction);
    }
  };

  return (
    <div className="reactions-panel">
      <div className="reactions-header">
        <span>Quick Reactions</span>
        <span className="reactions-hint">Click to react</span>
      </div>
      <div className="reactions-grid">
        {reactions.map((reaction) => (
          <button
            key={reaction.id}
            className="reaction-btn"
            onClick={() => handleReaction(reaction)}
            disabled={disabled}
            title={reaction.label}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ReactionsPanel;
