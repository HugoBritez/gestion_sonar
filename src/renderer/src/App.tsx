/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import LoginView from "./features/Login/LoginView"
import { isAuthenticated, getCurrentUser } from "./repos/AuthRepo"
import { User } from '@supabase/supabase-js'
import { Box, Typography } from '@mui/joy'
import ProductosDashboard from './features/Productos/Productos'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = new QueryClient()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async (): Promise<void> => {
    try {
      if (isAuthenticated()) {
        const currentUser = await getCurrentUser()
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Box >
      <ProductosDashboard onLoggout = {}>
      </ProductosDashboard>
    </Box>
    </QueryClientProvider>
  )
}

export default App
