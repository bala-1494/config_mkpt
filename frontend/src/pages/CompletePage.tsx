import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
} from '@mui/material'
import {
  CheckCircle,
  HeadsetMic,
} from '@mui/icons-material'

export default function CompletePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Redirect users who haven't finished the flow yet
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_leads')
      .select('journey_step')
      .eq('seller', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const step = data?.journey_step
        if (step === 'onboarding' || step === null || step === undefined) {
          navigate('/onboarding')
        } else if (step === 'vetting' || step === 'bsa') {
          navigate('/vetting')
        }
      })
  }, [user?.id, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f7',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#CC0000', letterSpacing: '-0.3px' }}>
          Marketplace portal
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: 'grey.300',
              color: 'text.secondary',
              fontSize: '0.78rem',
              '&:hover': { borderColor: '#CC0000', color: '#CC0000' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 4 },
          py: 6,
        }}
      >
        <Box sx={{ maxWidth: 600, width: '100%' }}>
          {/* Success icon */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(46,125,50,0.1)',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircle sx={{ color: '#2e7d32', fontSize: 48 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={800} mb={1.5}>
              You're all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7} sx={{ maxWidth: 480, mx: 'auto' }}>
              Your application has been approved and your Business Service Agreement has been accepted.
              Our team will be in touch with next steps shortly.
            </Typography>
          </Box>

          {/* Status card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              border: '1px solid',
              borderColor: 'rgba(46,125,50,0.3)',
              borderRadius: 3,
              bgcolor: 'rgba(46,125,50,0.04)',
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="#2e7d32" mb={1.5}>
              Onboarding Complete
            </Typography>
            {[
              'Identity & Business Information',
              'Background Verification',
              'Business Service Agreement',
            ].map((step) => (
              <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <CheckCircle sx={{ color: '#2e7d32', fontSize: 18 }} />
                <Typography variant="body2" color="text.primary">
                  {step}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Support card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HeadsetMic sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} mb={0.5}>
                Need help?
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.65}>
                Our team is available 24/7. Reach out if you have any questions about your application status.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
