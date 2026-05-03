import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { validateEnv } from './config/env'
import './index.css'

validateEnv()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
