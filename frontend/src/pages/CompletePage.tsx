import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Typography, Button, Paper } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'

export default function CompletePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    logout()
    navigate('/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          textAlign: 'center',
        }}
      >
        <CheckCircle sx={{ fontSize: 56, color: '#2E7D32', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} mb={1}>
          You're all set!
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Your application has been submitted successfully. Our team will review
          your details and get back to you shortly.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleLogout}
          sx={{ borderColor: 'grey.300', color: 'text.secondary' }}
        >
          Sign out
        </Button>
      </Paper>
    </Box>
  )
}
