import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { MainScene } from './scenes/MainScene';
import Sidebar from './ui/Sidebar';
import HUD from './ui/HUD';
import './App.css';

function App() {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const [gameReady, setGameReady] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playerName, setPlayerName] = useState('Player');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (phaserGameRef.current) return;

    // Configuração do jogo com a cena
    const config = {
      ...GAME_CONFIG,
      scene: [MainScene],
    };

    // Criar jogo Phaser
    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    // Aguardar cena estar pronta
    game.scene.scenes[0].events.on('scene-ready', () => {
      setGameReady(true);
    });

    // Escutar eventos da cena
    game.scene.scenes[0].events.on('edit-mode-changed', (mode) => {
      setEditMode(mode);
    });

    game.scene.scenes[0].events.on('object-selected', (object) => {
      setSelectedObject(object);
    });

    return () => {
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  const handleStartGame = (name) => {
    setPlayerName(name || 'Player');
    setShowWelcome(false);

    // Atualizar nome do jogador na cena
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.scenes[0];
      if (scene.player) {
        scene.player.setName(name || 'Player');
      }
    }
  };

  const handleAddObject = (objectId) => {
    if (!phaserGameRef.current) return;

    const scene = phaserGameRef.current.scene.scenes[0];
    const playerPos = scene.player.getGridPosition();

    // Adicionar objeto próximo ao jogador
    scene.addObject(objectId, playerPos.x + 2, playerPos.y);
  };

  const handleToggleEditMode = () => {
    if (!phaserGameRef.current) return;
    const scene = phaserGameRef.current.scene.scenes[0];
    scene.toggleEditMode();
  };

  const handleLoadPreset = (preset) => {
    if (!phaserGameRef.current) return;
    const scene = phaserGameRef.current.scene.scenes[0];
    scene.loadRoom({ objects: preset.objects });
    setSidebarOpen(false);
  };

  const handleSaveRoom = () => {
    if (!phaserGameRef.current) return;
    const scene = phaserGameRef.current.scene.scenes[0];
    const roomData = scene.saveRoom();

    // Salvar no localStorage
    localStorage.setItem('virtual-office-room', JSON.stringify(roomData));

    // Download JSON
    const dataStr = JSON.stringify(roomData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `room-${Date.now()}.json`;
    link.click();
  };

  const handleLoadRoom = () => {
    const saved = localStorage.getItem('virtual-office-room');
    if (saved) {
      const roomData = JSON.parse(saved);
      if (phaserGameRef.current) {
        const scene = phaserGameRef.current.scene.scenes[0];
        scene.loadRoom(roomData);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Welcome Screen */}
      {showWelcome && (
        <div className="welcome-screen">
          <div className="welcome-card">
            <h1>🏢 Escritório Virtual 2D</h1>
            <p className="welcome-subtitle">Estilo Habbo Hotel • Isométrico • Retro</p>

            <div className="welcome-features">
              <div className="feature">
                <span className="feature-icon">🎮</span>
                <span>Click para mover</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🛠️</span>
                <span>Editor de móveis</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🎨</span>
                <span>Avatar customizável</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💾</span>
                <span>Salve seu escritório</span>
              </div>
            </div>

            <div className="name-input-group">
              <input
                type="text"
                placeholder="Digite seu nome..."
                defaultValue="Player"
                maxLength={15}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStartGame(e.target.value);
                  }
                }}
                id="player-name-input"
              />
              <button
                className="btn-primary"
                onClick={() => {
                  const input = document.getElementById('player-name-input');
                  handleStartGame(input.value);
                }}
              >
                Entrar
              </button>
            </div>

            <div className="welcome-controls">
              <h3>Controles:</h3>
              <ul>
                <li><kbd>Click</kbd> Mover avatar</li>
                <li><kbd>E</kbd> Toggle modo edição</li>
                <li><kbd>G</kbd> Mostrar grid</li>
                <li><kbd>Tab</kbd> Abrir menu</li>
                <li><kbd>Delete</kbd> Remover objeto selecionado</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div
        id="game-container"
        ref={gameRef}
        className={showWelcome ? 'hidden' : ''}
      />

      {/* HUD */}
      {gameReady && !showWelcome && (
        <HUD
          editMode={editMode}
          onToggleEditMode={handleToggleEditMode}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedObject={selectedObject}
          playerName={playerName}
        />
      )}

      {/* Sidebar */}
      {gameReady && !showWelcome && sidebarOpen && (
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onAddObject={handleAddObject}
          onLoadPreset={handleLoadPreset}
          onSaveRoom={handleSaveRoom}
          onLoadRoom={handleLoadRoom}
          editMode={editMode}
        />
      )}

      {/* FAB Button */}
      {gameReady && !showWelcome && (
        <button
          className="fab"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Menu (Tab)"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Status Indicator */}
      {gameReady && !showWelcome && (
        <div className="status-indicator">
          {editMode ? '🛠️ Modo Edição' : '🚶 Modo Navegação'}
        </div>
      )}
    </div>
  );
}

export default App;
