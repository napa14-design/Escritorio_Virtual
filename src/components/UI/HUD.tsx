import React from 'react'
import { useStore } from '@/store'
import { formatVec3 } from '@/utils/helpers'
import './HUD.css'

/**
 * HUD - Heads Up Display
 * Mostra informações em tempo real na tela
 */
export const HUD: React.FC = () => {
  const player = useStore((state) => state.player)
  const fps = useStore((state) => state.fps)
  const objectCount = useStore((state) => state.objectCount)
  const settings = useStore((state) => state.settings)
  const cameraMode = useStore((state) => state.camera.mode)
  const editorMode = useStore((state) => state.editor.mode)

  if (!settings.ui.showHUD) return null

  return (
    <div className="hud">
      {/* Info Superior Esquerda */}
      <div className="hud-section hud-top-left glass">
        <div className="hud-item">
          <span className="hud-label">Modo:</span>
          <span className="hud-value">{editorMode}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Câmera:</span>
          <span className="hud-value">{cameraMode}</span>
        </div>
        {settings.ui.showFPS && (
          <div className="hud-item">
            <span className="hud-label">FPS:</span>
            <span className={`hud-value ${fps < 30 ? 'fps-low' : fps < 50 ? 'fps-medium' : 'fps-high'}`}>
              {fps}
            </span>
          </div>
        )}
      </div>

      {/* Info Superior Direita */}
      <div className="hud-section hud-top-right glass">
        <div className="hud-item">
          <span className="hud-label">Objetos:</span>
          <span className="hud-value">{objectCount}</span>
        </div>
        {settings.ui.showCoordinates && (
          <div className="hud-item">
            <span className="hud-label">Posição:</span>
            <span className="hud-value">{formatVec3(player.position, 1)}</span>
          </div>
        )}
      </div>

      {/* Indicadores de Estado */}
      <div className="hud-section hud-center">
        {player.isRunning && (
          <div className="hud-indicator running">
            <span>🏃 Correndo</span>
          </div>
        )}
        {player.isJumping && (
          <div className="hud-indicator jumping">
            <span>⬆️ Pulando</span>
          </div>
        )}
        {player.isSitting && (
          <div className="hud-indicator sitting">
            <span>💺 Sentado</span>
          </div>
        )}
      </div>

      {/* Controles (quando não em pointer lock) */}
      {editorMode === 'navigate' && (
        <div className="hud-section hud-bottom-center glass">
          <div className="hud-controls">
            <div className="control-hint">
              <kbd>WASD</kbd> Mover
            </div>
            <div className="control-hint">
              <kbd>Shift</kbd> Correr
            </div>
            <div className="control-hint">
              <kbd>Space</kbd> Pular
            </div>
            <div className="control-hint">
              <kbd>Mouse</kbd> Olhar
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
