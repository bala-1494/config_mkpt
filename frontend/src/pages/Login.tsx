import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material'
import {
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material'

// ── Unified card: registration OR sign-in ─────────────────────────────────────
type CardMode = 'register' | 'signin'
type Step = 'form' | 'otp'

function AuthCard({
  mode,
  onSwitchMode,
}: {
  mode: CardMode
  onSwitchMode: (m: CardMode) => void
}) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('form')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = (nextMode: CardMode) => {
    setStep('form')
    setFullName('')
    setEmail('')
    setOtp('')
    setError('')
    onSwitchMode(nextMode)
  }

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) return
    if (mode === 'register' && !fullName.trim()) return
    setStep('otp')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, otp)
      if (mode === 'register') {
        navigate('/onboarding')
        return
      }
      // Returning sign-in: redirect to where user left off
      const userId = `mock-${email}`
      const { data } = await supabase
        .from('seller_profiles')
        .select('journey_step')
        .eq('seller', userId)
        .maybeSingle()
      const step = data?.journey_step
      if (step === 'complete') {
        navigate('/dashboard')
      } else if (step === 'vetting' || step === 'bsa') {
        navigate('/vetting')
      } else {
        navigate('/onboarding')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        width: '100%',
        maxWidth: 420,
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        {isRegister ? 'Create your account' : 'Sign in to your account'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {isRegister
          ? 'Enter your professional details to get started.'
          : 'Enter your email to receive a one-time passcode.'}
      </Typography>

      <Box component="form" onSubmit={step === 'form' ? handleGetOtp : handleSubmit}>
        {/* Full Name – registration only */}
        {isRegister && (
          <>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              letterSpacing={1}
              display="block"
              mb={0.5}
            >
              FULL NAME
            </Typography>
            <TextField
              fullWidth
              placeholder="Johnathan Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={step === 'otp'}
              inputProps={{ style: { fontSize: '0.95rem' } }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </>
        )}

        {/* Email */}
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          letterSpacing={1}
          display="block"
          mb={0.5}
        >
          EMAIL
        </Typography>
        <TextField
          fullWidth
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={step === 'otp'}
          autoFocus={!isRegister}
          inputProps={{ style: { fontSize: '0.95rem' } }}
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* OTP section */}
        {step === 'form' ? (
          <>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              letterSpacing={1}
              display="block"
              mb={0.5}
            >
              VERIFICATION
            </Typography>
            <Button
              type="submit"
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                mb: 0.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.9rem',
                borderColor: '#CC0000',
                color: '#CC0000',
                '&:hover': { borderColor: '#a00000', bgcolor: 'rgba(204,0,0,0.04)' },
              }}
            >
              Get OTP
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              We'll send a one-time passcode to your email.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              We've sent a one-time passcode to
            </Typography>
            <Typography variant="body2" fontWeight={700} color="text.primary" mb={2}>
              {email}
            </Typography>

            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              letterSpacing={1}
              display="block"
              mb={0.5}
            >
              ONE-TIME PASSCODE
            </Typography>
            <TextField
              fullWidth
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoFocus
              inputProps={{ maxLength: 6, style: { letterSpacing: '0.4em', fontWeight: 700, fontSize: '1.1rem' } }}
              helperText="Enter the 6-digit code sent to your email."
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'otp' && (
          <>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 1,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.95rem',
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
              }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading
                ? isRegister ? 'Creating Account...' : 'Signing in...'
                : isRegister ? 'Create Account →' : 'Sign In →'}
            </Button>
            <Button
              variant="text"
              fullWidth
              size="small"
              onClick={() => { setStep('form'); setOtp(''); setError('') }}
              sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 1 }}
            >
              ← Use a different email
            </Button>
          </>
        )}

        {step === 'form' && (
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              mb: 1,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.95rem',
              bgcolor: '#CC0000',
              '&:hover': { bgcolor: '#a00000' },
            }}
          >
            {isRegister ? 'Create Account →' : 'Sign In →'}
          </Button>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          letterSpacing={1}
          mb={2}
        >
          SECURE ACCESS
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" textAlign="center" color="text.secondary">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Box
                component="span"
                onClick={() => reset('signin')}
                sx={{ color: '#CC0000', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Box>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <Box
                component="span"
                onClick={() => reset('register')}
                sx={{ color: '#CC0000', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Create one
              </Box>
            </>
          )}
        </Typography>
      </Box>
    </Paper>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Login() {
  const [cardMode, setCardMode] = useState<CardMode>('register')

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f7f7fa' }}>
      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 6 },
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: '#CC0000', letterSpacing: '-0.5px' }}
        >
          Marketplace portal
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {['Process', 'Support', 'FAQ'].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {item}
            </Typography>
          ))}
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => setCardMode('signin')}
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            '&:hover': { borderColor: '#CC0000', color: '#CC0000' },
          }}
        >
          Sign In
        </Button>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
            maxWidth: 1100,
            width: '100%',
          }}
        >
          {/* Left column – marketing */}
          <Box sx={{ flex: 1, maxWidth: 520 }}>
            {/* Badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                border: '1px solid #CC0000',
                borderRadius: 99,
                mb: 3,
              }}
            >
              <Typography variant="caption" fontWeight={700} color="#CC0000" letterSpacing={1}>
                JOIN THE NETWORK
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              variant="h3"
              fontWeight={800}
              lineHeight={1.15}
              mb={2.5}
              sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              Curating the next generation of{' '}
              <Box component="span" sx={{ color: '#CC0000' }}>
                market
              </Box>
              <br />
              <Box component="span" sx={{ color: '#CC0000' }}>
                excellence.
              </Box>
            </Typography>

            {/* Subtext */}
            <Typography variant="body1" color="text.secondary" mb={4} lineHeight={1.7}>
              Begin your journey into our curated marketplace ecosystem. A streamlined onboarding
              process designed for professionals.
            </Typography>

            {/* Feature cards */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <VerifiedUserIcon sx={{ color: '#CC0000', mb: 1 }} />
                <Typography variant="body2" fontWeight={700} mb={0.5}>
                  Vetted Network
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quality over quantity.
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <TrendingUpIcon sx={{ color: '#CC0000', mb: 1 }} />
                <Typography variant="body2" fontWeight={700} mb={0.5}>
                  Premium Insights
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Data-driven growth.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right column – auth card */}
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <AuthCard mode={cardMode} onSwitchMode={setCardMode} />
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 6 },
          py: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          bgcolor: '#fff',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © 2024 MARKETPLACE PORTAL. EDITORIAL EXCELLENCE.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['TERMS OF SERVICE', 'PRIVACY POLICY', 'CONTACT'].map((item) => (
            <Typography
              key={item}
              variant="caption"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
            >
              {item}
            </Typography>
          ))}
        </Box>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: '#CC0000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SecurityIcon sx={{ color: '#fff', fontSize: 16 }} />
        </Box>
      </Box>
    </Box>
  )
}
