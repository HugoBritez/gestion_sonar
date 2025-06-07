/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginView from "./features/Login/LoginView"
import { isAuthenticated, getCurrentUser } from "./repos/AuthRepo"
import { User } from '@supabase/supabase-js'
import { Box, useColorScheme, CssVarsProvider, extendTheme } from '@mui/joy'
import ProductosDashboard from './features/Productos/Productos'
import HomeView from './features/Home/HomeView'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoadingState from './shared/UI/LoadingState'
import CssBaseline from '@mui/joy/CssBaseline'

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#f5f5f5',
          surface: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#0a0a0a',
          surface: '#1a1a1a',
        },
      },
    },
  },
});

function AppContent(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = new QueryClient()
  const { mode } = useColorScheme()

  useEffect(() => {
    console.log('AppContent montado')
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('Verificando estado de autenticación...')
      if (isAuthenticated()) {
        console.log('Usuario autenticado, obteniendo datos...')
        const currentUser = await getCurrentUser()
        console.log('Datos del usuario:', currentUser)
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
        setUser(currentUser)
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (): void => {
    checkAuthStatus()
  }

   const handleLogout = async (): Promise<void> => {
     const { signOut } = await import('./repos/AuthRepo')
     try {
       await signOut()
       setIsLoggedIn(false)
       setUser(null)
     } catch (error) {
       console.error('Error signing out:', error)
     }
   }

  // Agregar logs para cada estado de renderizado
  console.log('Estado actual:', { loading, isLoggedIn, user: !!user })

  if (loading) {
    console.log('Renderizando estado de carga')
    return (
      <Box
        sx={{
          bgcolor: mode === 'dark' ? 'background.surface' : 'background.body',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LoadingState message="Iniciando aplicación..." />
      </Box>
    )
  }

  if (!isLoggedIn) {
    console.log('Renderizando vista de login')
    return <LoginView onLoginSuccess={handleLoginSuccess} />
  }

  console.log('Renderizando contenido principal')
  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route 
            path="/" 
            element={
              <React.Suspense fallback={<LoadingState message="Cargando..." />}>
                <HomeView onLogout={handleLogout} />
              </React.Suspense>
            } 
          />
          <Route 
            path="/productos" 
            element={
              <React.Suspense fallback={<LoadingState message="Cargando..." />}>
                <ProductosDashboard onLogout={handleLogout} />
              </React.Suspense>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </HashRouter>
  )
}

export default function App(): React.JSX.Element {
  return (
    <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline />
      <AppContent />
    </CssVarsProvider>
  )
}
