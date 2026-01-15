import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Montar a aplicação
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Service Worker para PWA (opcional) - desabilitado temporariamente
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').catch(() => {
//       // Service worker registration failed
//     })
//   })
// }
