import { useEffect, useState } from 'react';
import MainScene from './components/Scene/MainScene';
import HUD from './components/UI/HUD';
import Sidebar from './components/UI/Sidebar';
import useStore from './store/useStore';
import './App.css';

function App() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleEditMode = useStore((state) => state.toggleEditMode);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const deleteObject = useStore((state) => state.deleteObject);
  const selectedObject = useStore((state) => state.selectedObject);
  const duplicateObject = useStore((state) => state.duplicateObject);
  const settings = useStore((state) => state.settings);
  const sidebarOpen = useStore((state) => state.sidebarOpen);

  const [showTutorial, setShowTutorial] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle sidebar with Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        toggleSidebar();
      }

      // Toggle edit mode with E
      if (e.key === 'e' || e.key === 'E') {
        if (!sidebarOpen && document.activeElement === document.body) {
          toggleEditMode();
        }
      }

      // Undo with Ctrl+Z
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Redo with Ctrl+Y
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Delete selected object with Delete
      if (e.key === 'Delete' && selectedObject) {
        e.preventDefault();
        deleteObject(selectedObject);
      }

      // Duplicate with Ctrl+D
      if (e.ctrlKey && e.key === 'd' && selectedObject) {
        e.preventDefault();
        duplicateObject(selectedObject);
      }

      // Screenshot with F12
      if (e.key === 'F12') {
        e.preventDefault();
        takeScreenshot();
      }

      // Hide tutorial with Escape
      if (e.key === 'Escape' && showTutorial) {
        setShowTutorial(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleSidebar,
    toggleEditMode,
    undo,
    redo,
    deleteObject,
    duplicateObject,
    selectedObject,
    sidebarOpen,
    showTutorial,
  ]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Save to localStorage is handled by zustand persist middleware
      console.log('Auto-saved');
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings.darkMode]);

  // Screenshot function
  const takeScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `virtual-office-${Date.now()}.png`;
        a.click();
      });
    }
  };

  // Tutorial overlay
  const Tutorial = () => {
    if (!showTutorial) return null;

    return (
      <div className="tutorial-overlay">
        <div className="tutorial-content">
          <h2>🏢 Welcome to Your Virtual Office!</h2>
          <div className="tutorial-section">
            <h3>Navigation Controls</h3>
            <ul>
              <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> - Move around</li>
              <li><kbd>Mouse</kbd> - Look around (click to lock)</li>
              <li><kbd>Shift</kbd> - Run</li>
              <li><kbd>Space</kbd> - Jump</li>
            </ul>
          </div>
          <div className="tutorial-section">
            <h3>Editor Controls</h3>
            <ul>
              <li><kbd>Tab</kbd> - Open/Close menu</li>
              <li><kbd>E</kbd> - Toggle edit mode</li>
              <li><kbd>Click</kbd> - Select objects</li>
              <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> - Undo/Redo</li>
              <li><kbd>Ctrl</kbd>+<kbd>D</kbd> - Duplicate object</li>
              <li><kbd>Delete</kbd> - Remove object</li>
              <li><kbd>F12</kbd> - Take screenshot</li>
            </ul>
          </div>
          <div className="tutorial-section">
            <h3>Getting Started</h3>
            <p>1. Press <kbd>Tab</kbd> to open the menu</p>
            <p>2. Browse the Objects tab to add furniture</p>
            <p>3. Toggle Edit Mode to customize your space</p>
            <p>4. Save your layout when you're done!</p>
          </div>
          <button className="tutorial-close" onClick={() => setShowTutorial(false)}>
            Got it! Let's start
          </button>
        </div>
      </div>
    );
  };

  // Loading screen
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Virtual Office...</h2>
          <p>Preparing your 3D workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <MainScene />
      <HUD />
      <Sidebar />
      <Tutorial />

      {/* Quick action button */}
      <button
        className="fab"
        onClick={toggleSidebar}
        title="Open Menu (Tab)"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Auto-save indicator */}
      <div className="auto-save-indicator">
        💾 Auto-save enabled
      </div>
    </div>
  );
}

export default App;
