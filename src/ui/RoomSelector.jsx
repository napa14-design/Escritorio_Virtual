import React, { useState } from 'react';
import './RoomSelector.css';

/**
 * RoomSelector - Lista e troca entre salas do escritório virtual
 */
export function RoomSelector({ rooms, currentRoom, onSelectRoom, onCreateRoom, onClose }) {
  const [filter, setFilter] = useState('all'); // all, public, private

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    if (filter === 'public') return room.type === 'public';
    if (filter === 'private') return room.type === 'private';
    return true;
  });

  const getRoomIcon = (room) => {
    if (room.type === 'private') return '🔒';
    if (room.id === 'default-room') return '🏢';
    if (room.name.toLowerCase().includes('meeting')) return '📊';
    return '🚪';
  };

  return (
    <>
      <div className="room-selector-overlay" onClick={onClose} />
      <div className="room-selector-modal">
        <div className="room-selector-header">
          <h2>🚪 Rooms</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="room-selector-toolbar">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'public' ? 'active' : ''}`}
              onClick={() => setFilter('public')}
            >
              Public
            </button>
            <button
              className={`filter-btn ${filter === 'private' ? 'active' : ''}`}
              onClick={() => setFilter('private')}
            >
              Private
            </button>
          </div>
          <button className="create-room-btn" onClick={onCreateRoom}>
            + Create Room
          </button>
        </div>

        <div className="room-list">
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏢</span>
              <p>No rooms found</p>
              <button className="create-first-btn" onClick={onCreateRoom}>
                Create your first room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => {
              const isCurrent = room.id === currentRoom;
              const isFull = room.maxUsers && room.userCount >= room.maxUsers;
              const canJoin = !isFull || isCurrent;

              return (
                <div
                  key={room.id}
                  className={`room-item ${isCurrent ? 'current' : ''} ${!canJoin ? 'disabled' : ''}`}
                  onClick={() => canJoin && !isCurrent && onSelectRoom(room)}
                >
                  <div className="room-icon">{getRoomIcon(room)}</div>
                  <div className="room-info">
                    <div className="room-name">
                      {room.name}
                      {isCurrent && <span className="current-badge">Current</span>}
                      {room.type === 'private' && <span className="private-badge">🔒</span>}
                    </div>
                    <div className="room-meta">
                      <span className="user-count">
                        👥 {room.userCount || 0}
                        {room.maxUsers && ` / ${room.maxUsers}`}
                      </span>
                      {room.description && (
                        <span className="room-description">{room.description}</span>
                      )}
                    </div>
                  </div>
                  {isFull && !isCurrent && (
                    <div className="full-badge">Full</div>
                  )}
                  {!isCurrent && canJoin && (
                    <div className="join-arrow">→</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="room-selector-footer">
          <div className="current-room-info">
            <span className="footer-label">Current Room:</span>
            <span className="footer-value">
              {rooms.find(r => r.id === currentRoom)?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoomSelector;
