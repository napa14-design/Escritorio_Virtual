import React, { useState } from 'react';
import { FiX, FiSearch, FiBox, FiSun, FiSettings, FiSave, FiUpload, FiDownload } from 'react-icons/fi';
import useStore from '../../store/useStore';
import { objectLibrary, objectCategories, presetLayouts } from '../../utils/objectLibrary';
import './Sidebar.css';

const Sidebar = () => {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const sidebarTab = useStore((state) => state.sidebarTab);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const setSidebarTab = useStore((state) => state.setSidebarTab);
  const settings = useStore((state) => state.settings);

  const [searchQuery, setSearchQuery] = useState('');

  if (!sidebarOpen) return null;

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Control Panel</h2>
        <button className="sidebar-close" onClick={toggleSidebar}>
          <FiX size={20} />
        </button>
      </div>

      <div className="sidebar-tabs">
        <SidebarTab
          icon={<FiBox />}
          label="Objects"
          active={sidebarTab === 'objects'}
          onClick={() => setSidebarTab('objects')}
        />
        <SidebarTab
          icon={<FiSun />}
          label="Environment"
          active={sidebarTab === 'environment'}
          onClick={() => setSidebarTab('environment')}
        />
        <SidebarTab
          icon={<FiSettings />}
          label="Settings"
          active={sidebarTab === 'settings'}
          onClick={() => setSidebarTab('settings')}
        />
        <SidebarTab
          icon={<FiSave />}
          label="Layouts"
          active={sidebarTab === 'layouts'}
          onClick={() => setSidebarTab('layouts')}
        />
      </div>

      <div className="sidebar-content">
        {sidebarTab === 'objects' && (
          <ObjectsPanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}
        {sidebarTab === 'environment' && <EnvironmentPanel />}
        {sidebarTab === 'settings' && <SettingsPanel />}
        {sidebarTab === 'layouts' && <LayoutsPanel />}
      </div>
    </div>
  );
};

// Sidebar Tab Component
const SidebarTab = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`sidebar-tab ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="tab-icon">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  );
};

// Objects Panel
const ObjectsPanel = ({ searchQuery, setSearchQuery }) => {
  const addObject = useStore((state) => state.addObject);
  const [selectedCategory, setSelectedCategory] = useState('furniture');

  const handleAddObject = (objectDef) => {
    const newObj = {
      ...objectDef,
      position: [0, objectDef.defaultPosition?.[1] || 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    addObject(newObj);
  };

  const filteredObjects = objectLibrary[selectedCategory] || [];

  return (
    <div className="panel-content">
      <div className="search-box">
        <FiSearch size={16} />
        <input
          type="text"
          placeholder="Search objects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        {Object.entries(objectCategories).map(([key, label]) => (
          <button
            key={key}
            className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="objects-grid">
        {filteredObjects.map((obj) => (
          <div
            key={obj.type}
            className="object-card"
            onClick={() => handleAddObject(obj)}
            title={`Click to add ${obj.name}`}
          >
            <div className="object-icon">{obj.icon || '📦'}</div>
            <div className="object-name">{obj.name}</div>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <h3 className="section-title">Preset Layouts</h3>
        <div className="preset-list">
          {presetLayouts.map((preset) => (
            <PresetCard key={preset.name} preset={preset} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Environment Panel
const EnvironmentPanel = () => {
  const environment = useStore((state) => state.environment);
  const updateEnvironment = useStore((state) => state.updateEnvironment);
  const lights = useStore((state) => state.lights);
  const addLight = useStore((state) => state.addLight);

  return (
    <div className="panel-content">
      <div className="panel-section">
        <h3 className="section-title">Sky & Ceiling</h3>
        <div className="control-group">
          <label>Sky Color</label>
          <input
            type="color"
            value={environment.skyColor}
            onChange={(e) => updateEnvironment({ skyColor: e.target.value })}
          />
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Floor</h3>
        <div className="control-group">
          <label>Floor Color</label>
          <input
            type="color"
            value={environment.floorColor}
            onChange={(e) => updateEnvironment({ floorColor: e.target.value })}
          />
        </div>
        <div className="control-group">
          <label>Floor Pattern</label>
          <select
            value={environment.floorPattern}
            onChange={(e) => updateEnvironment({ floorPattern: e.target.value })}
          >
            <option value="solid">Solid</option>
            <option value="checkered">Checkered</option>
            <option value="striped">Striped</option>
          </select>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Ambient Lighting</h3>
        <div className="control-group">
          <label>Intensity</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={environment.ambientLightIntensity}
            onChange={(e) =>
              updateEnvironment({ ambientLightIntensity: parseFloat(e.target.value) })
            }
          />
          <span>{environment.ambientLightIntensity.toFixed(1)}</span>
        </div>
        <div className="control-group">
          <label>Color</label>
          <input
            type="color"
            value={environment.ambientLightColor}
            onChange={(e) => updateEnvironment({ ambientLightColor: e.target.value })}
          />
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Fog</h3>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={environment.fogEnabled}
              onChange={(e) => updateEnvironment({ fogEnabled: e.target.checked })}
            />
            Enable Fog
          </label>
        </div>
        {environment.fogEnabled && (
          <>
            <div className="control-group">
              <label>Density</label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={environment.fogDensity}
                onChange={(e) =>
                  updateEnvironment({ fogDensity: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="control-group">
              <label>Color</label>
              <input
                type="color"
                value={environment.fogColor}
                onChange={(e) => updateEnvironment({ fogColor: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      <div className="panel-section">
        <h3 className="section-title">Lights ({lights.length})</h3>
        <button
          className="btn-primary"
          onClick={() =>
            addLight({
              type: 'point',
              position: [0, 3, 0],
              intensity: 1,
              color: '#ffffff',
              castShadow: true,
            })
          }
        >
          + Add Point Light
        </button>
      </div>
    </div>
  );
};

// Settings Panel
const SettingsPanel = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const editMode = useStore((state) => state.editMode);
  const cameraMode = useStore((state) => state.cameraMode);
  const setCameraMode = useStore((state) => state.setCameraMode);

  return (
    <div className="panel-content">
      <div className="panel-section">
        <h3 className="section-title">Graphics Quality</h3>
        <div className="control-group">
          <label>Quality Preset</label>
          <select
            value={settings.graphicsQuality}
            onChange={(e) => updateSettings({ graphicsQuality: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.antialiasing}
              onChange={(e) => updateSettings({ antialiasing: e.target.checked })}
            />
            Anti-aliasing
          </label>
        </div>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableReflections}
              onChange={(e) => updateSettings({ enableReflections: e.target.checked })}
            />
            Reflections
          </label>
        </div>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.enableParticles}
              onChange={(e) => updateSettings({ enableParticles: e.target.checked })}
            />
            Particles
          </label>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Camera & Controls</h3>
        <div className="control-group">
          <label>Camera Mode</label>
          <select value={cameraMode} onChange={(e) => setCameraMode(e.target.value)}>
            <option value="firstPerson">First Person</option>
            <option value="thirdPerson">Third Person</option>
            <option value="aerial">Aerial View</option>
            <option value="free">Free Camera</option>
          </select>
        </div>
        <div className="control-group">
          <label>Movement Speed</label>
          <input
            type="range"
            min="1"
            max="20"
            value={settings.movementSpeed}
            onChange={(e) =>
              updateSettings({ movementSpeed: parseFloat(e.target.value) })
            }
          />
          <span>{settings.movementSpeed}</span>
        </div>
        <div className="control-group">
          <label>Mouse Sensitivity</label>
          <input
            type="range"
            min="0.001"
            max="0.01"
            step="0.001"
            value={settings.mouseSensitivity}
            onChange={(e) =>
              updateSettings({ mouseSensitivity: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Editor Mode</h3>
        <button
          className={`btn-primary ${editMode ? 'active' : ''}`}
          onClick={toggleEditMode}
        >
          {editMode ? '🔓 Disable Edit Mode' : '🔒 Enable Edit Mode'}
        </button>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Theme</h3>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => {
                updateSettings({ darkMode: e.target.checked });
                document.body.classList.toggle('dark-mode', e.target.checked);
              }}
            />
            Dark Mode
          </label>
        </div>
      </div>
    </div>
  );
};

// Layouts Panel
const LayoutsPanel = () => {
  const layouts = useStore((state) => state.layouts);
  const saveLayout = useStore((state) => state.saveLayout);
  const loadLayout = useStore((state) => state.loadLayout);
  const deleteLayout = useStore((state) => state.deleteLayout);
  const exportLayout = useStore((state) => state.exportLayout);
  const importLayout = useStore((state) => state.importLayout);
  const currentLayout = useStore((state) => state.currentLayout);

  const [layoutName, setLayoutName] = useState('');
  const [importData, setImportData] = useState('');

  const handleSave = () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }
    saveLayout(layoutName);
    setLayoutName('');
  };

  const handleExport = (name) => {
    const data = exportLayout(name);
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.json`;
      a.click();
    }
  };

  const handleImport = () => {
    if (importLayout(importData)) {
      alert('Layout imported successfully!');
      setImportData('');
    } else {
      alert('Failed to import layout. Please check the JSON data.');
    }
  };

  return (
    <div className="panel-content">
      <div className="panel-section">
        <h3 className="section-title">Save Current Layout</h3>
        <div className="control-group">
          <input
            type="text"
            placeholder="Layout name..."
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="text-input"
          />
          <button className="btn-primary" onClick={handleSave}>
            <FiSave /> Save
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Saved Layouts ({layouts.length})</h3>
        <div className="layout-list">
          {layouts.map((layout) => (
            <div
              key={layout.name}
              className={`layout-card ${currentLayout === layout.name ? 'active' : ''}`}
            >
              <div className="layout-info">
                <div className="layout-name">{layout.name}</div>
                <div className="layout-meta">
                  {layout.objects?.length || 0} objects
                </div>
              </div>
              <div className="layout-actions">
                <button
                  className="btn-icon"
                  onClick={() => loadLayout(layout.name)}
                  title="Load"
                >
                  <FiUpload />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleExport(layout.name)}
                  title="Export"
                >
                  <FiDownload />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => deleteLayout(layout.name)}
                  title="Delete"
                >
                  <FiX />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Import Layout</h3>
        <textarea
          placeholder="Paste JSON data here..."
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          className="textarea-input"
          rows={4}
        />
        <button className="btn-primary" onClick={handleImport}>
          <FiUpload /> Import
        </button>
      </div>
    </div>
  );
};

// Preset Card Component
const PresetCard = ({ preset }) => {
  const addObject = useStore((state) => state.addObject);

  const handleLoadPreset = () => {
    preset.objects.forEach((objData) => {
      const objDef = Object.values(objectLibrary)
        .flat()
        .find((o) => o.type === objData.type);

      if (objDef) {
        addObject({
          ...objDef,
          ...objData,
        });
      }
    });
  };

  return (
    <div className="preset-card" onClick={handleLoadPreset}>
      <div className="preset-name">{preset.name}</div>
      <div className="preset-description">{preset.description}</div>
      <div className="preset-meta">{preset.objects.length} objects</div>
    </div>
  );
};

export default Sidebar;
