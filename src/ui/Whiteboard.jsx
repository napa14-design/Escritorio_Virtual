import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Whiteboard.css';

/**
 * Whiteboard colaborativo com ferramentas de desenho
 * Sincroniza desenhos em tempo real via Socket.io
 */
export function Whiteboard({ isOpen, onClose, networkManager }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, eraser, clear
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const lastPointRef = useRef(null);

  /**
   * Inicializa canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Canvas branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurações
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [isOpen]);

  /**
   * Desenha linha no canvas
   */
  const drawLine = useCallback((x1, y1, x2, y2, drawColor, drawWidth, isEraser = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawWidth * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
    }

    ctx.stroke();
  }, []);

  /**
   * Limpa canvas
   */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Enviar ação de limpar para rede
    if (networkManager) {
      networkManager.sendWhiteboardAction({
        type: 'clear',
      });
    }
  }, [networkManager]);

  /**
   * Handle mouse down
   */
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y };
  }, []);

  /**
   * Handle mouse move
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (lastPointRef.current) {
      const isEraser = tool === 'eraser';

      // Desenhar localmente
      drawLine(
        lastPointRef.current.x,
        lastPointRef.current.y,
        x,
        y,
        color,
        lineWidth,
        isEraser
      );

      // Enviar para rede
      if (networkManager) {
        networkManager.sendWhiteboardAction({
          type: 'draw',
          x1: lastPointRef.current.x,
          y1: lastPointRef.current.y,
          x2: x,
          y2: y,
          color,
          lineWidth,
          isEraser,
        });
      }

      lastPointRef.current = { x, y };
    }
  }, [isDrawing, tool, color, lineWidth, networkManager, drawLine]);

  /**
   * Handle mouse up
   */
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  /**
   * Recebe ações do whiteboard da rede
   */
  useEffect(() => {
    if (!networkManager) return;

    const handleWhiteboardAction = (action) => {
      if (action.type === 'draw') {
        drawLine(
          action.x1,
          action.y1,
          action.x2,
          action.y2,
          action.color,
          action.lineWidth,
          action.isEraser
        );
      } else if (action.type === 'clear') {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    networkManager.on('whiteboardAction', handleWhiteboardAction);

    return () => {
      // Cleanup listener
      networkManager.callbacks.onWhiteboardAction = null;
    };
  }, [networkManager, drawLine]);

  if (!isOpen) return null;

  return (
    <div className="whiteboard-overlay">
      <div className="whiteboard-container">
        <div className="whiteboard-header">
          <h2>📝 Collaborative Whiteboard</h2>
          <button className="whiteboard-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="whiteboard-toolbar">
          {/* Ferramentas */}
          <div className="toolbar-group">
            <button
              className={`tool-button ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Pen"
            >
              ✏️
            </button>
            <button
              className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >
              🧹
            </button>
            <button
              className="tool-button"
              onClick={clearCanvas}
              title="Clear"
            >
              🗑️
            </button>
          </div>

          {/* Cor */}
          {tool === 'pen' && (
            <div className="toolbar-group">
              <label>Color:</label>
              {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((c) => (
                <button
                  key={c}
                  className={`color-button ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-picker"
              />
            </div>
          )}

          {/* Espessura */}
          <div className="toolbar-group">
            <label>Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="width-slider"
            />
            <span className="width-value">{lineWidth}px</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="whiteboard-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        <div className="whiteboard-footer">
          <p>💡 Draw with others in real-time!</p>
        </div>
      </div>
    </div>
  );
}

export default Whiteboard;
