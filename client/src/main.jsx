import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from "sonner"
import { SocketProvider } from './store/socket-context.jsx'
import { StudentSessionProvider } from './store/student-session.jsx'
import { LibraryProvider } from './store/libaray-session.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster
        toastOptions={{
          style: {
            background: '#009688',
            color: '#FFFFFF',
            borderRadius: '0.5rem',
            fontWeight: 500,
          },
          iconTheme: {
            primary: '#FFFFFF',
            secondary: '#9A3412',
          },
        }}
      />
      <LibraryProvider>
        <SocketProvider>
          <StudentSessionProvider>
            <App />
          </StudentSessionProvider>
        </SocketProvider>
      </LibraryProvider>
    </BrowserRouter>
  </StrictMode>,
)
