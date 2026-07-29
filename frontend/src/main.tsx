import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initTheme } from './lib/theme'
import './index.css'

// Runs before the first paint so a dark-mode user never sees a light flash.
initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
