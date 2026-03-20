import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Email, ArrowBack, Lock, Store } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#CC0000',
      dark: '#a00000',
      contrastText: '#fff',
    },
  },
  shape: { borderRadius: 10 },
})

type Step = 'email' | 'otp'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setStep('otp')
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, otp)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #f5f5ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: 'primary.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 20px rgba(204,0,0,0.25)',
              }}
            >
              <Store sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Seller Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Onboarding &amp; Management
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            {step === 'email' ? (
              <Box component="form" onSubmit={handleEmailSubmit}>
                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Sign in to your account
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Enter your email to receive a one-time passcode
                </Typography>

                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ py: 1.5, fontWeight: 600, fontSize: '0.95rem' }}
                >
                  Continue with Email
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleOtpSubmit}>
                <IconButton
                  onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  size="small"
                  sx={{ mb: 2, color: 'text.secondary' }}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>

                <Typography variant="h6" fontWeight={600} mb={0.5}>
                  Check your email
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  We&apos;ve sent a one-time passcode to
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary" mb={3}>
                  {email}
                </Typography>

                <TextField
                  fullWidth
                  label="One-time passcode"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  inputProps={{ maxLength: 6 }}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& input': { letterSpacing: '0.35em', fontWeight: 600, fontSize: '1.1rem' },
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 600, fontSize: '0.95rem' }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </Box>
            )}
          </Paper>

          <Typography variant="caption" color="text.secondary" textAlign="center" display="block" mt={3}>
            Secure seller onboarding platform
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
