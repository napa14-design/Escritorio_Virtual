import React, { useEffect } from 'react'
import { MainScene } from './components/Scene/MainScene'
import { HUD } from './components/UI/HUD'
import { Toolbar } from './components/UI/Toolbar'
import { ObjectLibrary } from './components/UI/ObjectLibrary'
import { useStore } from './store'
import './styles/globals.css'

/**
 * Componente principal da aplicação
 * Escritório Virtual 3D
 */
const App: React.FC = () => {
  const setFPS = useStore((state) => state.setFPS)
  const settings = useStore((state) => state.settings)

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        useStore.getState().undo()
      }

      // Ctrl/Cmd + Shift + Z ou Ctrl/Cmd + Y - Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault()
        useStore.getState().redo()
      }

      // Ctrl/Cmd + C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        useStore.getState().copy()
      }

      // Ctrl/Cmd + V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault()
        useStore.getState().paste()
      }

      // Ctrl/Cmd + D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        const selectedObjects = useStore.getState().editor.selectedObjects
        selectedObjects.forEach((id) => useStore.getState().duplicateObject(id))
      }

      // Delete ou Backspace - Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedObjects = useStore.getState().editor.selectedObjects
        if (selectedObjects.length > 0 && e.target === document.body) {
          e.preventDefault()
          selectedObjects.forEach((id) => useStore.getState().removeObject(id))
        }
      }

      // Escape - Deselect
      if (e.key === 'Escape') {
        useStore.getState().clearSelection()
      }

      // Ctrl/Cmd + A - Select All
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        useStore.getState().selectAll()
      }

      // L - Toggle Object Library
      if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
        useStore.getState().toggleObjectLibrary()
      }

      // G - Toggle Grid
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        useStore.getState().toggleGrid()
      }

      // H - Toggle Helpers
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        useStore.getState().toggleHelpers()
      }

      // 1-4 - Camera Modes
      if (e.key === '1') {
        useStore.getState().setCameraMode('first_person' as any)
      }
      if (e.key === '2') {
        useStore.getState().setCameraMode('third_person' as any)
      }
      if (e.key === '3') {
        useStore.getState().setCameraMode('aerial' as any)
      }
      if (e.key === '4') {
        useStore.getState().setCameraMode('free' as any)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // FPS Counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const updateFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setFPS(fps)
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(updateFPS)
    }

    requestAnimationFrame(updateFPS)
  }, [setFPS])

  // Auto-save
  useEffect(() => {
    if (!settings.autoSave) return

    const interval = setInterval(() => {
      const layoutName = `Auto-save ${new Date().toLocaleTimeString('pt-BR')}`
      useStore.getState().saveLayout(layoutName, 'Salvamento automático')
    }, settings.autoSaveInterval)

    return () => clearInterval(interval)
  }, [settings.autoSave, settings.autoSaveInterval])

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.ui.theme)
  }, [settings.ui.theme])

  return (
    <>
      {/* Cena 3D */}
      <MainScene />

      {/* UI Overlay */}
      <HUD />
      <Toolbar />
      <ObjectLibrary />

      {/* Loading Screen (se necessário) */}
      {/* <LoadingScreen /> */}

      {/* Tutorial (se ativo) */}
      {/* <Tutorial /> */}

      {/* Settings Panel (se aberto) */}
      {/* <SettingsPanel /> */}
    </>
  )
}

export default App
