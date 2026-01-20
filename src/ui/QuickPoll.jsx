import React, { useState, useEffect } from 'react';
import './QuickPoll.css';

/**
 * QuickPoll - Votações rápidas para decisões em grupo
 */
export function QuickPoll({ poll, onVote, onClose, hasVoted, currentUserId }) {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!poll) return null;

  const totalVotes = Object.values(poll.votes || {}).reduce((sum, arr) => sum + arr.length, 0);

  const handleVote = (optionId) => {
    if (hasVoted || !onVote) return;

    setSelectedOption(optionId);
    onVote(poll.id, optionId);
  };

  const getVotePercentage = (optionId) => {
    if (totalVotes === 0) return 0;
    const votes = poll.votes?.[optionId]?.length || 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getVoteCount = (optionId) => {
    return poll.votes?.[optionId]?.length || 0;
  };

  const userVote = hasVoted ? Object.keys(poll.votes || {}).find(optionId =>
    poll.votes[optionId]?.includes(currentUserId)
  ) : null;

  return (
    <>
      <div className="poll-overlay" onClick={onClose} />
      <div className="poll-modal">
        <div className="poll-header">
          <div>
            <h3>📊 Quick Poll</h3>
            <div className="poll-creator">by {poll.createdBy}</div>
          </div>
          <button className="poll-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="poll-content">
          <div className="poll-question">{poll.question}</div>

          <div className="poll-options">
            {poll.options.map((option, index) => {
              const optionId = `option-${index}`;
              const voteCount = getVoteCount(optionId);
              const percentage = getVotePercentage(optionId);
              const isSelected = userVote === optionId;
              const isWinning = totalVotes > 0 && voteCount > 0 &&
                voteCount === Math.max(...Object.values(poll.votes || {}).map(arr => arr.length));

              return (
                <button
                  key={optionId}
                  className={`poll-option ${isSelected ? 'selected' : ''} ${isWinning && hasVoted ? 'winning' : ''}`}
                  onClick={() => handleVote(optionId)}
                  disabled={hasVoted}
                >
                  <div className="option-content">
                    <span className="option-text">{option}</span>
                    {hasVoted && (
                      <span className="option-votes">
                        {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage}%)
                      </span>
                    )}
                  </div>
                  {hasVoted && (
                    <div
                      className="option-bar"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="poll-footer">
            <span className="poll-total">{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</span>
            {hasVoted && (
              <span className="poll-voted-badge">✓ You voted</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * CreatePollModal - Modal para criar nova votação
 */
export function CreatePollModal({ onClose, onCreate }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    setError('');

    if (!question.trim()) {
      setError('Question is required');
      return;
    }

    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    onCreate({
      question: question.trim(),
      options: validOptions,
    });

    onClose();
  };

  return (
    <>
      <div className="poll-overlay" onClick={onClose} />
      <div className="poll-modal create-poll">
        <div className="poll-header">
          <h3>📊 Create Poll</h3>
          <button className="poll-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="poll-content">
          <div className="form-group">
            <label>Question *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you want to ask?"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Options *</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={50}
                />
                {options.length > 2 && (
                  <button
                    className="remove-option-btn"
                    onClick={() => removeOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button className="add-option-btn" onClick={addOption}>
                + Add Option
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="poll-actions">
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
            <button className="create-btn" onClick={handleCreate}>Create Poll</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickPoll;
