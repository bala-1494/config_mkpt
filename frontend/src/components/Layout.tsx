import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Tooltip,
  Button,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Person,
  Description,
  CreditCard,
  Logout,
  Store,
} from '@mui/icons-material'

const DRAWER_WIDTH = 240

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, exact: true },
  { to: '/dashboard/profile', label: 'Profile Details', icon: <Person /> },
  { to: '/dashboard/documentation', label: 'Documentation', icon: <Description /> },
  { to: '/dashboard/stripe', label: 'Stripe Setup', icon: <CreditCard /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'grey.200',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Brand header */}
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: '#CC0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(204,0,0,0.3)',
              }}
            >
              <Store sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" lineHeight={1.2}>
                Seller Portal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Onboarding
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1.5, py: 1.5, gap: 0.5, display: 'flex', flexDirection: 'column' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    bgcolor: isActive ? '#CC0000' : 'transparent',
                    color: isActive ? 'white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isActive ? '#b00000' : 'grey.100',
                      color: isActive ? 'white' : 'text.primary',
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'white' : 'text.secondary',
                      minWidth: 36,
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon sx={{ '& svg': { fontSize: 20 } }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          ))}
        </List>

        <Divider />

        {/* User footer */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#CC0000',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={user?.email ?? ''} placement="right">
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.primary"
                  noWrap
                  display="block"
                >
                  {user?.email}
                </Typography>
              </Tooltip>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Logout fontSize="small" />}
            onClick={handleLogout}
            sx={{
              borderColor: 'grey.300',
              color: 'text.secondary',
              fontSize: '0.78rem',
              '&:hover': { borderColor: '#CC0000', color: '#CC0000', bgcolor: '#fff5f5' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}
