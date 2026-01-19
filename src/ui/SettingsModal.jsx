import React, { useState, useEffect, useCallback } from 'react';
import './SettingsModal.css';

/**
 * Settings Modal - Configurações de áudio/vídeo
 */
export function SettingsModal({
  isOpen,
  onClose,
  onApplySettings,
  currentSettings = {},
  localStream = null,
  testAudioLevel = 0,
}) {
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState({
    audioInput: [],
    audioOutput: [],
    videoInput: [],
  });

  const [settings, setSettings] = useState({
    audioInputId: currentSettings.audioInputId || 'default',
    audioOutputId: currentSettings.audioOutputId || 'default',
    videoInputId: currentSettings.videoInputId || 'default',
    echoCancellation: currentSettings.echoCancellation !== false,
    noiseSuppression: currentSettings.noiseSuppression !== false,
    autoGainControl: currentSettings.autoGainControl !== false,
    vadThreshold: currentSettings.vadThreshold || 0.02,
    vadSmoothingFrames: currentSettings.vadSmoothingFrames || 5,
    vadSilenceDelay: currentSettings.vadSilenceDelay || 500,
    videoQuality: currentSettings.videoQuality || 'medium',
  });

  /**
   * Enumera dispositivos de mídia disponíveis
   */
  const enumerateDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      setDevices({
        audioInput: deviceList.filter(d => d.kind === 'audioinput'),
        audioOutput: deviceList.filter(d => d.kind === 'audiooutput'),
        videoInput: deviceList.filter(d => d.kind === 'videoinput'),
      });
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  }, []);

  /**
   * Carregar dispositivos quando modal abre
   */
  useEffect(() => {
    if (isOpen) {
      enumerateDevices();
    }
  }, [isOpen, enumerateDevices]);

  /**
   * Atualizar configuração
   */
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Aplicar configurações
   */
  const handleApply = () => {
    onApplySettings(settings);
    onClose();
  };

  /**
   * Resetar para padrão
   */
  const handleReset = () => {
    setSettings({
      audioInputId: 'default',
      audioOutputId: 'default',
      videoInputId: 'default',
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      vadThreshold: 0.02,
      vadSmoothingFrames: 5,
      vadSilenceDelay: 500,
      videoQuality: 'medium',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <h2>⚙️ Configurações</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            🎤 Dispositivos
          </button>
          <button
            className={`settings-tab ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            🔊 Áudio
          </button>
          <button
            className={`settings-tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            📹 Vídeo
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Tab: Dispositivos */}
          {activeTab === 'devices' && (
            <div className="settings-section">
              <h3>Selecionar Dispositivos</h3>

              {/* Microfone */}
              <div className="setting-group">
                <label>Microfone</label>
                <select
                  value={settings.audioInputId}
                  onChange={(e) => updateSetting('audioInputId', e.target.value)}
                >
                  <option value="default">Padrão do sistema</option>
                  {devices.audioInput.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alto-falante */}
              <div className="setting-group">
                <label>Alto-falante</label>
                <select
                  value={settings.audioOutputId}
                  onChange={(e) => updateSetting('audioOutputId', e.target.value)}
                >
                  <option value="default">Padrão do sistema</option>
                  {devices.audioOutput.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Alto-falante ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Câmera */}
              <div className="setting-group">
                <label>Câmera</label>
                <select
                  value={settings.videoInputId}
                  onChange={(e) => updateSetting('videoInputId', e.target.value)}
                >
                  <option value="default">Padrão do sistema</option>
                  {devices.videoInput.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Câmera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Audio Level */}
              {localStream && (
                <div className="setting-group">
                  <label>Nível do Microfone</label>
                  <div className="audio-level-bar">
                    <div
                      className="audio-level-fill"
                      style={{ width: `${testAudioLevel * 100}%` }}
                    />
                  </div>
                  <small className="setting-hint">
                    Fale para testar o microfone
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Tab: Áudio */}
          {activeTab === 'audio' && (
            <div className="settings-section">
              <h3>Qualidade de Áudio</h3>

              {/* Echo Cancellation */}
              <div className="setting-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.echoCancellation}
                    onChange={(e) => updateSetting('echoCancellation', e.target.checked)}
                  />
                  <span>Cancelamento de Eco</span>
                </label>
                <small className="setting-hint">
                  Remove eco da sua voz
                </small>
              </div>

              {/* Noise Suppression */}
              <div className="setting-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.noiseSuppression}
                    onChange={(e) => updateSetting('noiseSuppression', e.target.checked)}
                  />
                  <span>Supressão de Ruído</span>
                </label>
                <small className="setting-hint">
                  Reduz ruídos de fundo
                </small>
              </div>

              {/* Auto Gain Control */}
              <div className="setting-group">
                <label className="setting-toggle">
                  <input
                    type="checkbox"
                    checked={settings.autoGainControl}
                    onChange={(e) => updateSetting('autoGainControl', e.target.checked)}
                  />
                  <span>Controle Automático de Volume</span>
                </label>
                <small className="setting-hint">
                  Ajusta volume automaticamente
                </small>
              </div>

              <hr className="setting-divider" />

              <h3>Detecção de Voz (VAD)</h3>

              {/* VAD Threshold */}
              <div className="setting-group">
                <label>
                  Sensibilidade
                  <span className="setting-value">{(settings.vadThreshold * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0.005"
                  max="0.1"
                  step="0.005"
                  value={settings.vadThreshold}
                  onChange={(e) => updateSetting('vadThreshold', parseFloat(e.target.value))}
                />
                <small className="setting-hint">
                  {settings.vadThreshold < 0.015 && '🟢 Muito sensível (capta sussurros)'}
                  {settings.vadThreshold >= 0.015 && settings.vadThreshold < 0.035 && '🟡 Sensibilidade média'}
                  {settings.vadThreshold >= 0.035 && '🔴 Pouco sensível (apenas voz alta)'}
                </small>
              </div>

              {/* Smoothing Frames */}
              <div className="setting-group">
                <label>
                  Suavização
                  <span className="setting-value">{settings.vadSmoothingFrames}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={settings.vadSmoothingFrames}
                  onChange={(e) => updateSetting('vadSmoothingFrames', parseInt(e.target.value))}
                />
                <small className="setting-hint">
                  Suaviza detecção de voz (menos "piscar")
                </small>
              </div>

              {/* Silence Delay */}
              <div className="setting-group">
                <label>
                  Delay de Silêncio
                  <span className="setting-value">{settings.vadSilenceDelay}ms</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.vadSilenceDelay}
                  onChange={(e) => updateSetting('vadSilenceDelay', parseInt(e.target.value))}
                />
                <small className="setting-hint">
                  Tempo antes de marcar como "parou de falar"
                </small>
              </div>
            </div>
          )}

          {/* Tab: Vídeo */}
          {activeTab === 'video' && (
            <div className="settings-section">
              <h3>Qualidade de Vídeo</h3>

              {/* Video Quality */}
              <div className="setting-group">
                <label>Qualidade</label>
                <select
                  value={settings.videoQuality}
                  onChange={(e) => updateSetting('videoQuality', e.target.value)}
                >
                  <option value="low">Baixa (160x120 @ 10fps)</option>
                  <option value="medium">Média (320x240 @ 15fps)</option>
                  <option value="high">Alta (640x480 @ 30fps)</option>
                </select>
                <small className="setting-hint">
                  Qualidade maior usa mais banda e CPU
                </small>
              </div>

              {/* Preview */}
              {localStream && (
                <div className="setting-group">
                  <label>Pré-visualização</label>
                  <video
                    className="video-preview"
                    autoPlay
                    muted
                    playsInline
                    ref={(video) => {
                      if (video && localStream) {
                        video.srcObject = localStream;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Resetar Padrão
          </button>
          <div className="settings-footer-right">
            <button className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleApply}>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
