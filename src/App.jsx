import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from './config/gameConfig';
import { MainScene } from './scenes/MainScene';
import Sidebar from './ui/Sidebar';
import HUD from './ui/HUD';
import VoiceManager from './components/VoiceManager';
import AvatarCustomization from './ui/AvatarCustomization';
import { ToastProvider } from './ui/Toast';
import { loadAvatarCustomization, saveAvatarCustomization } from './utils/avatarStorage';
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
  const [currentUserPosition, setCurrentUserPosition] = useState({ x: 10, y: 10 });
  const [avatarCustomization, setAvatarCustomization] = useState(() => loadAvatarCustomization());
  const [isAvatarCustomizationOpen, setIsAvatarCustomizationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    // Escutar mudanças de posição do jogador
    const positionUpdateInterval = setInterval(() => {
      if (game.scene.scenes[0]?.player) {
        const pos = game.scene.scenes[0].player.getGridPosition();
        setCurrentUserPosition(pos);
      }
    }, 100);

    return () => {
      clearInterval(positionUpdateInterval);
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  // Dados do usuário atual para o VoiceManager
  const currentUser = {
    id: 'local-user',
    name: playerName,
    position: currentUserPosition,
    customization: avatarCustomization,
  };

  const handleStartGame = (name) => {
    setPlayerName(name || 'Player');
    setShowWelcome(false);

    // Atualizar nome e customização do jogador na cena
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.scenes[0];
      if (scene.player) {
        scene.player.setName(name || 'Player');
        scene.player.updateCustomization(avatarCustomization);
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

  const handleApplyAvatarCustomization = (customization) => {
    // Salvar no localStorage
    saveAvatarCustomization(customization);
    setAvatarCustomization(customization);

    // Atualizar avatar do jogador no Phaser
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.scenes[0];
      if (scene.player) {
        scene.player.updateCustomization(customization);
      }
    }
  };

  return (
    <ToastProvider>
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
          onOpenAvatarCustomization={() => setIsAvatarCustomizationOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
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

      {/* Voice Manager */}
      {gameReady && !showWelcome && (
        <VoiceManager
          phaserGame={phaserGameRef.current}
          currentUser={currentUser}
          serverUrl="http://localhost:3001"
        />
      )}

      {/* Avatar Customization */}
      <AvatarCustomization
        isOpen={isAvatarCustomizationOpen}
        onClose={() => setIsAvatarCustomizationOpen(false)}
        onApplyCustomization={handleApplyAvatarCustomization}
        currentCustomization={avatarCustomization}
      />
    </div>
    </ToastProvider>
  );
}

export default App;
