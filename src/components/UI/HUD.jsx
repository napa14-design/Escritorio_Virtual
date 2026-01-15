import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import './HUD.css';

const HUD = () => {
  const showHUD = useStore((state) => state.showHUD);
  const showMinimap = useStore((state) => state.showMinimap);
  const showFPS = useStore((state) => state.showFPS);
  const playerPosition = useStore((state) => state.playerPosition);
  const editMode = useStore((state) => state.editMode);
  const cameraMode = useStore((state) => state.cameraMode);
  const objectCount = useStore((state) => state.objectCount);
  const settings = useStore((state) => state.settings);

  const [fps, setFps] = useState(60);
  const [lastTime, setLastTime] = useState(Date.now());
  const [frameCount, setFrameCount] = useState(0);

  // FPS Counter
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      const currentFPS = Math.round(frameCount / delta);

      setFps(currentFPS);
      setFrameCount(0);
      setLastTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTime, frameCount]);

  useEffect(() => {
    const animate = () => {
      setFrameCount((prev) => prev + 1);
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  if (!showHUD) return null;

  return (
    <div className="hud-container">
      {/* Top Left - FPS and Stats */}
      {showFPS && (
        <div className="hud-panel hud-top-left">
          <div className="hud-stat">
            <span className="hud-label">FPS:</span>
            <span className={`hud-value ${fps < 30 ? 'hud-warning' : ''}`}>
              {fps}
            </span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Objects:</span>
            <span className="hud-value">{objectCount}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Quality:</span>
            <span className="hud-value">{settings.graphicsQuality}</span>
          </div>
        </div>
      )}

      {/* Top Center - Mode Indicator */}
      <div className="hud-panel hud-top-center">
        <div className={`mode-badge ${editMode ? 'edit-mode' : 'nav-mode'}`}>
          {editMode ? '🛠️ Edit Mode' : '🚶 Navigation Mode'}
        </div>
        <div className="camera-mode-badge">
          📷 {cameraMode.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </div>

      {/* Top Right - Position */}
      <div className="hud-panel hud-top-right">
        <div className="hud-stat">
          <span className="hud-label">Position:</span>
        </div>
        <div className="hud-coordinates">
          <span>X: {playerPosition[0].toFixed(1)}</span>
          <span>Y: {playerPosition[1].toFixed(1)}</span>
          <span>Z: {playerPosition[2].toFixed(1)}</span>
        </div>
      </div>

      {/* Minimap */}
      {showMinimap && (
        <div className="hud-panel hud-minimap">
          <Minimap playerPosition={playerPosition} />
        </div>
      )}

      {/* Bottom Center - Controls Help */}
      <div className="hud-panel hud-bottom-center">
        <div className="controls-hint">
          {editMode ? (
            <>
              <kbd>Click</kbd> Select • <kbd>Drag</kbd> Move • <kbd>Del</kbd> Delete •{' '}
              <kbd>Ctrl+Z</kbd> Undo • <kbd>Ctrl+Y</kbd> Redo
            </>
          ) : (
            <>
              <kbd>WASD</kbd> Move • <kbd>Shift</kbd> Run • <kbd>Space</kbd> Jump •{' '}
              <kbd>E</kbd> Interact • <kbd>Tab</kbd> Menu
            </>
          )}
        </div>
      </div>

      {/* Toolbar - Bottom Left */}
      <div className="hud-panel hud-toolbar">
        <ToolbarButton icon="🏠" label="Home" />
        <ToolbarButton icon="📦" label="Objects" />
        <ToolbarButton icon="💡" label="Lights" />
        <ToolbarButton icon="🎨" label="Materials" />
        <ToolbarButton icon="💾" label="Save" />
        <ToolbarButton icon="📸" label="Screenshot" />
      </div>
    </div>
  );
};

// Minimap Component
const Minimap = ({ playerPosition }) => {
  const objects = useStore((state) => state.objects);

  const scale = 5; // Scale factor for minimap
  const mapSize = 150;

  return (
    <div className="minimap">
      <div className="minimap-title">Map</div>
      <svg
        width={mapSize}
        height={mapSize}
        viewBox={`${-mapSize / 2} ${-mapSize / 2} ${mapSize} ${mapSize}`}
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x={-mapSize / 2}
          y={-mapSize / 2}
          width={mapSize}
          height={mapSize}
          fill="url(#grid)"
        />

        {/* Objects */}
        {objects.map((obj) => (
          <circle
            key={obj.id}
            cx={obj.position[0] * scale}
            cy={obj.position[2] * scale}
            r={2}
            fill="rgba(100, 200, 255, 0.8)"
          />
        ))}

        {/* Player position */}
        <g transform={`translate(${playerPosition[0] * scale}, ${playerPosition[2] * scale})`}>
          <circle cx={0} cy={0} r={4} fill="#00ff00" />
          <path d="M 0,-6 L 3,3 L 0,0 L -3,3 Z" fill="#00ff00" />
        </g>
      </svg>
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton = ({ icon, label, onClick }) => {
  return (
    <button className="toolbar-button" onClick={onClick} title={label}>
      <span className="toolbar-icon">{icon}</span>
      <span className="toolbar-label">{label}</span>
    </button>
  );
};

export default HUD;
