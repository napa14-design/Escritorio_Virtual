import React from 'react'
import { useStore } from '@/store'
import { EditorMode, EditorTool, CameraMode } from '@/types'
import './Toolbar.css'

/**
 * Toolbar principal com ferramentas de edição e controles
 */
export const Toolbar: React.FC = () => {
  const editorMode = useStore((state) => state.editor.mode)
  const editorTool = useStore((state) => state.editor.tool)
  const cameraMode = useStore((state) => state.camera.mode)
  const selectedObjects = useStore((state) => state.editor.selectedObjects)

  const setEditorMode = useStore((state) => state.setEditorMode)
  const setEditorTool = useStore((state) => state.setEditorTool)
  const setCameraMode = useStore((state) => state.setCameraMode)
  const toggleObjectLibrary = useStore((state) => state.toggleObjectLibrary)
  const toggleSettings = useStore((state) => state.toggleSettings)
  const toggleGrid = useStore((state) => state.toggleGrid)
  const toggleHelpers = useStore((state) => state.toggleHelpers)
  const showGrid = useStore((state) => state.editor.showGrid)
  const showHelpers = useStore((state) => state.editor.showHelpers)

  const copy = useStore((state) => state.copy)
  const paste = useStore((state) => state.paste)
  const undo = useStore((state) => state.undo)
  const redo = useStore((state) => state.redo)
  const removeObject = useStore((state) => state.removeObject)
  const duplicateObject = useStore((state) => state.duplicateObject)

  const handleDelete = () => {
    selectedObjects.forEach((id) => removeObject(id))
  }

  const handleDuplicate = () => {
    selectedObjects.forEach((id) => duplicateObject(id))
  }

  return (
    <div className="toolbar glass">
      {/* Modo de Editor */}
      <div className="toolbar-section">
        <span className="toolbar-label">Modo</span>
        <div className="button-group">
          <button
            className={`btn-icon tooltip ${editorMode === EditorMode.NAVIGATE ? 'active' : ''}`}
            onClick={() => setEditorMode(EditorMode.NAVIGATE)}
            data-tooltip="Navegar"
          >
            🚶
          </button>
          <button
            className={`btn-icon tooltip ${editorMode === EditorMode.BUILD ? 'active' : ''}`}
            onClick={() => setEditorMode(EditorMode.BUILD)}
            data-tooltip="Construir"
          >
            🏗️
          </button>
          <button
            className={`btn-icon tooltip ${editorMode === EditorMode.PHOTO ? 'active' : ''}`}
            onClick={() => setEditorMode(EditorMode.PHOTO)}
            data-tooltip="Foto"
          >
            📷
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Ferramentas de Editor (apenas no modo BUILD) */}
      {editorMode === EditorMode.BUILD && (
        <>
          <div className="toolbar-section">
            <span className="toolbar-label">Ferramenta</span>
            <div className="button-group">
              <button
                className={`btn-icon tooltip ${editorTool === EditorTool.SELECT ? 'active' : ''}`}
                onClick={() => setEditorTool(EditorTool.SELECT)}
                data-tooltip="Selecionar"
              >
                👆
              </button>
              <button
                className={`btn-icon tooltip ${editorTool === EditorTool.MOVE ? 'active' : ''}`}
                onClick={() => setEditorTool(EditorTool.MOVE)}
                data-tooltip="Mover"
              >
                ✋
              </button>
              <button
                className={`btn-icon tooltip ${editorTool === EditorTool.ROTATE ? 'active' : ''}`}
                onClick={() => setEditorTool(EditorTool.ROTATE)}
                data-tooltip="Rotacionar"
              >
                🔄
              </button>
              <button
                className={`btn-icon tooltip ${editorTool === EditorTool.SCALE ? 'active' : ''}`}
                onClick={() => setEditorTool(EditorTool.SCALE)}
                data-tooltip="Escalar"
              >
                ↔️
              </button>
              <button
                className={`btn-icon tooltip ${editorTool === EditorTool.PAINT ? 'active' : ''}`}
                onClick={() => setEditorTool(EditorTool.PAINT)}
                data-tooltip="Pintar"
              >
                🎨
              </button>
            </div>
          </div>

          <div className="toolbar-divider" />

          {/* Ações */}
          <div className="toolbar-section">
            <div className="button-group">
              <button
                className="btn-icon tooltip"
                onClick={undo}
                data-tooltip="Desfazer (Ctrl+Z)"
              >
                ↩️
              </button>
              <button
                className="btn-icon tooltip"
                onClick={redo}
                data-tooltip="Refazer (Ctrl+Y)"
              >
                ↪️
              </button>
            </div>
          </div>

          <div className="toolbar-divider" />

          {/* Clipboard */}
          <div className="toolbar-section">
            <div className="button-group">
              <button
                className="btn-icon tooltip"
                onClick={copy}
                disabled={selectedObjects.length === 0}
                data-tooltip="Copiar (Ctrl+C)"
              >
                📋
              </button>
              <button
                className="btn-icon tooltip"
                onClick={paste}
                data-tooltip="Colar (Ctrl+V)"
              >
                📄
              </button>
              <button
                className="btn-icon tooltip"
                onClick={handleDuplicate}
                disabled={selectedObjects.length === 0}
                data-tooltip="Duplicar (Ctrl+D)"
              >
                ➕
              </button>
              <button
                className="btn-icon tooltip danger"
                onClick={handleDelete}
                disabled={selectedObjects.length === 0}
                data-tooltip="Deletar (Del)"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="toolbar-divider" />
        </>
      )}

      {/* Câmera */}
      <div className="toolbar-section">
        <span className="toolbar-label">Câmera</span>
        <div className="button-group">
          <button
            className={`btn-icon tooltip ${cameraMode === CameraMode.FIRST_PERSON ? 'active' : ''}`}
            onClick={() => setCameraMode(CameraMode.FIRST_PERSON)}
            data-tooltip="Primeira Pessoa"
          >
            👁️
          </button>
          <button
            className={`btn-icon tooltip ${cameraMode === CameraMode.THIRD_PERSON ? 'active' : ''}`}
            onClick={() => setCameraMode(CameraMode.THIRD_PERSON)}
            data-tooltip="Terceira Pessoa"
          >
            👤
          </button>
          <button
            className={`btn-icon tooltip ${cameraMode === CameraMode.AERIAL ? 'active' : ''}`}
            onClick={() => setCameraMode(CameraMode.AERIAL)}
            data-tooltip="Visão Aérea"
          >
            🦅
          </button>
          <button
            className={`btn-icon tooltip ${cameraMode === CameraMode.FREE ? 'active' : ''}`}
            onClick={() => setCameraMode(CameraMode.FREE)}
            data-tooltip="Livre"
          >
            🎮
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Visualização */}
      <div className="toolbar-section">
        <div className="button-group">
          <button
            className={`btn-icon tooltip ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            data-tooltip="Grade"
          >
            #
          </button>
          <button
            className={`btn-icon tooltip ${showHelpers ? 'active' : ''}`}
            onClick={toggleHelpers}
            data-tooltip="Helpers"
          >
            📐
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Menu */}
      <div className="toolbar-section">
        <div className="button-group">
          <button
            className="btn-icon tooltip"
            onClick={toggleObjectLibrary}
            data-tooltip="Biblioteca"
          >
            📚
          </button>
          <button
            className="btn-icon tooltip"
            onClick={toggleSettings}
            data-tooltip="Configurações"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  )
}
