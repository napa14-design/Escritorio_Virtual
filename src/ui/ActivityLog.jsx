import React, { useState, useEffect } from 'react';
import './ActivityLog.css';

/**
 * ActivityLog - Mostra histórico de eventos do escritório
 */
export function ActivityLog({ events, onClose, maxEvents = 50 }) {
  const [filter, setFilter] = useState('all'); // all, users, messages, system

  const getEventIcon = (type) => {
    const icons = {
      'user-joined': '✅',
      'user-left': '👋',
      'user-moved': '🚶',
      'message': '💬',
      'emote': '😊',
      'knock': '🔔',
      'status-change': '🔄',
      'room-change': '🚪',
      'screen-share': '🖥️',
      'system': 'ℹ️',
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type) => {
    const colors = {
      'user-joined': '#10b981',
      'user-left': '#ef4444',
      'message': '#3b82f6',
      'emote': '#f59e0b',
      'knock': '#8b5cf6',
      'system': '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'users') return ['user-joined', 'user-left', 'user-moved'].includes(event.type);
    if (filter === 'messages') return ['message', 'emote'].includes(event.type);
    if (filter === 'system') return ['system', 'room-change', 'screen-share'].includes(event.type);
    return true;
  }).slice(-maxEvents).reverse();

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h3>📋 Activity Log</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="activity-log-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'users' ? 'active' : ''}`}
          onClick={() => setFilter('users')}
        >
          Users
        </button>
        <button
          className={`filter-btn ${filter === 'messages' ? 'active' : ''}`}
          onClick={() => setFilter('messages')}
        >
          Messages
        </button>
        <button
          className={`filter-btn ${filter === 'system' ? 'active' : ''}`}
          onClick={() => setFilter('system')}
        >
          System
        </button>
      </div>

      <div className="activity-log-list">
        {filteredEvents.length === 0 ? (
          <div className="empty-log">
            <span className="empty-icon">📭</span>
            <p>No recent activity</p>
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div key={`${event.timestamp}-${index}`} className="activity-item">
              <div
                className="activity-icon"
                style={{ backgroundColor: getEventColor(event.type) }}
              >
                {getEventIcon(event.type)}
              </div>
              <div className="activity-content">
                <div className="activity-text">{event.text}</div>
                <div className="activity-time">{formatTime(event.timestamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityLog;
