import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import AuthScreen from './AuthScreen.jsx'
import TodoCRUDApp from './TodoCRUDApp.jsx'

function Root() {
  const { currentUser } = useAuth()
  // Remount the todo app per user so its state resets cleanly on login switch.
  return currentUser ? <TodoCRUDApp key={currentUser} /> : <AuthScreen />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
