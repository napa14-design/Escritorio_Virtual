import React, { useState } from 'react';
import './CreateRoomModal.css';

/**
 * CreateRoomModal - Modal para criar novas salas
 */
export function CreateRoomModal({ onClose, onCreate }) {
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    type: 'public', // public or private
    password: '',
    maxUsers: 20,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!roomData.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (roomData.name.length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    } else if (roomData.name.length > 50) {
      newErrors.name = 'Room name must be less than 50 characters';
    }

    if (roomData.type === 'private' && !roomData.password) {
      newErrors.password = 'Password is required for private rooms';
    } else if (roomData.password && roomData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (roomData.maxUsers < 2) {
      newErrors.maxUsers = 'Room must allow at least 2 users';
    } else if (roomData.maxUsers > 100) {
      newErrors.maxUsers = 'Room cannot have more than 100 users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onCreate(roomData);
      onClose();
    }
  };

  return (
    <>
      <div className="create-room-overlay" onClick={onClose} />
      <div className="create-room-modal">
        <div className="create-room-header">
          <h2>✨ Create New Room</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          {/* Room Name */}
          <div className="form-group">
            <label htmlFor="roomName">Room Name *</label>
            <input
              id="roomName"
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
              placeholder="e.g., Team Meeting Room"
              className={errors.name ? 'error' : ''}
              maxLength={50}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="roomDescription">Description (Optional)</label>
            <textarea
              id="roomDescription"
              value={roomData.description}
              onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
              placeholder="What's this room for?"
              rows={3}
              maxLength={200}
            />
            <span className="char-count">{roomData.description.length}/200</span>
          </div>

          {/* Room Type */}
          <div className="form-group">
            <label>Room Type *</label>
            <div className="radio-group">
              <label className={`radio-option ${roomData.type === 'public' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="public"
                  checked={roomData.type === 'public'}
                  onChange={(e) => setRoomData({ ...roomData, type: e.target.value, password: '' })}
                />
                <div className="radio-content">
                  <span className="radio-icon">🌐</span>
                  <div>
                    <div className="radio-title">Public</div>
                    <div className="radio-description">Anyone can join</div>
                  </div>
                </div>
              </label>

              <label className={`radio-option ${roomData.type === 'private' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="private"
                  checked={roomData.type === 'private'}
                  onChange={(e) => setRoomData({ ...roomData, type: e.target.value })}
                />
                <div className="radio-content">
                  <span className="radio-icon">🔒</span>
                  <div>
                    <div className="radio-title">Private</div>
                    <div className="radio-description">Requires password</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Password (if private) */}
          {roomData.type === 'private' && (
            <div className="form-group">
              <label htmlFor="roomPassword">Password *</label>
              <input
                id="roomPassword"
                type="password"
                value={roomData.password}
                onChange={(e) => setRoomData({ ...roomData, password: e.target.value })}
                placeholder="Enter room password"
                className={errors.password ? 'error' : ''}
                maxLength={50}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          )}

          {/* Max Users */}
          <div className="form-group">
            <label htmlFor="maxUsers">Max Users</label>
            <div className="slider-container">
              <input
                id="maxUsers"
                type="range"
                min="2"
                max="100"
                value={roomData.maxUsers}
                onChange={(e) => setRoomData({ ...roomData, maxUsers: parseInt(e.target.value) })}
                className="slider"
              />
              <span className="slider-value">{roomData.maxUsers} users</span>
            </div>
            {errors.maxUsers && <span className="error-message">{errors.maxUsers}</span>}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CreateRoomModal;
