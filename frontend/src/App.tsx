import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, CircularProgress } from '@mui/material'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import VettingPage from './pages/VettingPage'
import CompletePage from './pages/CompletePage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#CC0000',
      dark: '#a00000',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
  },
})

function LoadingScreen() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#CC0000' }} />
    </Box>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/complete" replace /> : <Login />}
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vetting"
        element={
          <ProtectedRoute>
            <VettingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complete"
        element={
          <ProtectedRoute>
            <CompletePage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/complete" replace />} />
      <Route path="*" element={<Navigate to="/complete" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
