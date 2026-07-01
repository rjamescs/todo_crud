import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TodoCRUDApp from './TodoCRUDApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TodoCRUDApp />
  </StrictMode>,
)
