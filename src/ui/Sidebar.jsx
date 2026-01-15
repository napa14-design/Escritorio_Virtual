import React, { useState } from 'react';
import { OBJECTS_LIBRARY, OBJECT_CATEGORIES, ROOM_PRESETS } from '../config/objectsLibrary';
import './Sidebar.css';

const Sidebar = ({ onClose, onAddObject, onLoadPreset, onSaveRoom, onLoadRoom, editMode }) => {
  const [activeTab, setActiveTab] = useState('objects');
  const [selectedCategory, setSelectedCategory] = useState('furniture');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredObjects = OBJECTS_LIBRARY[selectedCategory] || [];

  const filteredBySearch = searchQuery
    ? filteredObjects.filter(obj =>
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredObjects;

  return (
    <div className="sidebar-overlay" onClick={onClose}>
      <div className="sidebar-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">🏢 Escritório Virtual</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="sidebar-tabs">
          <button
            className={`tab ${activeTab === 'objects' ? 'active' : ''}`}
            onClick={() => setActiveTab('objects')}
          >
            📦 Objetos
          </button>
          <button
            className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            🎨 Presets
          </button>
          <button
            className={`tab ${activeTab === 'save' ? 'active' : ''}`}
            onClick={() => setActiveTab('save')}
          >
            💾 Salvar
          </button>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* Objects Tab */}
          {activeTab === 'objects' && (
            <div className="tab-content">
              {/* Search */}
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar objetos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="category-tabs">
                {Object.entries(OBJECT_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Objects Grid */}
              <div className="objects-grid">
                {filteredBySearch.map((obj) => (
                  <div
                    key={obj.id}
                    className="object-card"
                    onClick={() => {
                      onAddObject(obj.id);
                      if (!editMode) {
                        onClose();
                      }
                    }}
                    title={obj.description}
                  >
                    <div className="object-icon">{obj.icon}</div>
                    <div className="object-name">{obj.name}</div>
                    <div className="object-size">{obj.width}x{obj.height}</div>
                  </div>
                ))}
              </div>

              {filteredBySearch.length === 0 && (
                <div className="empty-state">
                  <p>Nenhum objeto encontrado</p>
                </div>
              )}
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div className="tab-content">
              <h3 className="section-title">Salas Prontas</h3>
              <div className="presets-list">
                {ROOM_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="preset-card"
                    onClick={() => onLoadPreset(preset)}
                  >
                    <div className="preset-header">
                      <h4 className="preset-name">{preset.name}</h4>
                      <span className="preset-count">{preset.objects.length} objetos</span>
                    </div>
                    <p className="preset-description">{preset.description}</p>
                    <button className="btn-load">Carregar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className="tab-content">
              <h3 className="section-title">Gerenciar Sala</h3>

              <div className="save-section">
                <h4>💾 Salvar Configuração</h4>
                <p className="help-text">
                  Salva a sala atual no localStorage e faz download de um arquivo JSON.
                </p>
                <button className="btn-action" onClick={onSaveRoom}>
                  <span>💾</span> Salvar Sala
                </button>
              </div>

              <div className="save-section">
                <h4>📂 Carregar Configuração</h4>
                <p className="help-text">
                  Carrega a última sala salva do localStorage.
                </p>
                <button className="btn-action" onClick={onLoadRoom}>
                  <span>📂</span> Carregar Sala
                </button>
              </div>

              <div className="save-section">
                <h4>📤 Importar JSON</h4>
                <p className="help-text">
                  Carregue um arquivo JSON de sala salvo anteriormente.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const roomData = JSON.parse(event.target.result);
                          onLoadPreset({ objects: roomData.objects });
                        } catch (error) {
                          alert('Erro ao carregar arquivo JSON');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="btn-action">
                  <span>📤</span> Selecionar Arquivo
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
