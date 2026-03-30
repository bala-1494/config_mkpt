import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Person,
  Article,
  CreditCard,
  List,
  HelpOutline,
  NotificationsNone,
  Settings,
  LogoutOutlined,
  CheckCircle,
  Cancel,
  AccessTime,
  Add,
  FilterList,
  ArrowBack,
} from '@mui/icons-material'

// ── Sidebar nav item ───────────────────────────────────────────────────────────
function SideNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.1,
        mb: 0.25,
        borderRadius: 2,
        bgcolor: active ? 'rgba(204,0,0,0.06)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': { bgcolor: active ? 'rgba(204,0,0,0.08)' : 'rgba(0,0,0,0.04)' },
      }}
    >
      <Box sx={{ color: active ? '#CC0000' : 'text.secondary', display: 'flex', fontSize: 20 }}>
        {icon}
      </Box>
      <Typography
        variant="body2"
        fontWeight={active ? 600 : 400}
        color={active ? '#CC0000' : 'text.secondary'}
        sx={{ flex: 1 }}
      >
        {label}
      </Typography>
    </Box>
  )
}

// ── Mock product data ──────────────────────────────────────────────────────────
const MOCK_ITEMS = [
  { id: 1, name: 'Signature Essential Tee', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#8B4513' },
  { id: 2, name: 'Graphic Archive 01', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#1a1a1a' },
  { id: 3, name: 'Oversized Heavyweight', category: 'Fashion', itemType: 'Tshirts', status: 'PENDING', color: '#8B6914' },
  { id: 4, name: 'Classic Crew Neck', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#2c3e50' },
  { id: 5, name: 'Vintage Wash Tee', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#6d5c4e' },
  { id: 6, name: 'Relaxed Fit Basic', category: 'Fashion', itemType: 'Tshirts', status: 'PENDING', color: '#c0c0c0' },
  { id: 7, name: 'Premium Pima Tee', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#1b4f72' },
  { id: 8, name: 'Striped Essential', category: 'Fashion', itemType: 'Tshirts', status: 'REJECTED', color: '#922b21' },
  { id: 9, name: 'Long Sleeve Crew', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#145a32' },
  { id: 10, name: 'Pocket Tee Classic', category: 'Fashion', itemType: 'Tshirts', status: 'PENDING', color: '#7d6608' },
  { id: 11, name: 'V-Neck Essential', category: 'Fashion', itemType: 'Tshirts', status: 'LIVE', color: '#4a235a' },
  { id: 12, name: 'Athletic Performance', category: 'Fashion', itemType: 'Activewear', status: 'LIVE', color: '#1a5276' },
  { id: 13, name: 'Cargo Utility Shorts', category: 'Fashion', itemType: 'Bottoms', status: 'PENDING', color: '#4d5a2c' },
  { id: 14, name: 'Denim Relaxed Jean', category: 'Fashion', itemType: 'Bottoms', status: 'LIVE', color: '#1f3a5f' },
  { id: 15, name: 'Zip-Up Hoodie', category: 'Fashion', itemType: 'Outerwear', status: 'LIVE', color: '#212121' },
]

const TOTAL = MOCK_ITEMS.length
const LIVE_COUNT = MOCK_ITEMS.filter(i => i.status === 'LIVE').length
const REJECTED_COUNT = MOCK_ITEMS.filter(i => i.status === 'REJECTED').length
const PENDING_COUNT = MOCK_ITEMS.filter(i => i.status === 'PENDING').length

function StatusChip({ status }: { status: string }) {
  if (status === 'LIVE') {
    return (
      <Chip
        label="LIVE"
        size="small"
        icon={<CheckCircle sx={{ fontSize: '12px !important', color: '#2e7d32 !important' }} />}
        sx={{
          bgcolor: 'rgba(46,125,50,0.1)',
          color: '#2e7d32',
          fontWeight: 700,
          fontSize: '0.62rem',
          letterSpacing: 0.5,
          height: 22,
          '& .MuiChip-icon': { ml: '4px' },
        }}
      />
    )
  }
  if (status === 'REJECTED') {
    return (
      <Chip
        label="REJECTED"
        size="small"
        icon={<Cancel sx={{ fontSize: '12px !important', color: '#c62828 !important' }} />}
        sx={{
          bgcolor: 'rgba(198,40,40,0.1)',
          color: '#c62828',
          fontWeight: 700,
          fontSize: '0.62rem',
          letterSpacing: 0.5,
          height: 22,
          '& .MuiChip-icon': { ml: '4px' },
        }}
      />
    )
  }
  return (
    <Chip
      label="PENDING"
      size="small"
      icon={<AccessTime sx={{ fontSize: '12px !important', color: '#e65100 !important' }} />}
      sx={{
        bgcolor: 'rgba(230,81,0,0.1)',
        color: '#e65100',
        fontWeight: 700,
        fontSize: '0.62rem',
        letterSpacing: 0.5,
        height: 22,
        '& .MuiChip-icon': { ml: '4px' },
      }}
    />
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Redirect if not fully onboarded
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

  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  const approvedPct = Math.round((LIVE_COUNT / TOTAL) * 100)
  const rejectedPct = Math.round((REJECTED_COUNT / TOTAL) * 100)
  const pendingPct = Math.round((PENDING_COUNT / TOTAL) * 100)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f7' }}>

      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <Box
        sx={{
          width: 220,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{ color: '#CC0000', letterSpacing: '-0.3px', mb: 1.5, cursor: 'pointer' }}
            onClick={() => navigate('/complete')}
          >
            Marketplace portal
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={700}
            letterSpacing={0.8}
            sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}
          >
            Onboarding Support
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary" mt={0.25}>
            Seller Support
          </Typography>
        </Box>

        {/* Nav items */}
        <Box sx={{ px: 1.5, py: 1.5, flex: 1 }}>
          <SideNavItem
            icon={<Person fontSize="inherit" />}
            label="Partner Profile"
            onClick={() => navigate('/seller-details')}
          />
          <SideNavItem icon={<Article fontSize="inherit" />} label="Documentation & KYC" />
          <SideNavItem icon={<CreditCard fontSize="inherit" />} label="Stripe Account Enablement" />
          <SideNavItem
            icon={<List fontSize="inherit" />}
            label="Item Listing"
            active
          />
          <SideNavItem icon={<HelpOutline fontSize="inherit" />} label="Support" />
        </Box>

        {/* Footer */}
        <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
            <Typography variant="caption" color="text.disabled" sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}>
              Privacy
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}>
              Terms
            </Typography>
          </Box>
          <Box
            onClick={logout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': { color: '#CC0000' },
              transition: 'color 0.15s',
            }}
          >
            <LogoutOutlined sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={600}>Log out</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Main Panel ────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 1.25,
            bgcolor: '#fff',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ borderBottom: '2px solid #CC0000', pb: 0.5, cursor: 'pointer' }}
            onClick={() => navigate('/complete')}
          >
            <Typography variant="body2" fontWeight={700} color="#CC0000">
              Dashboard
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <NotificationsNone sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Settings sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.name ?? 'Profile'}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#CC0000', fontSize: 13, cursor: 'pointer' }}>
              {initials}
            </Avatar>
          </Tooltip>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, md: 4 }, py: 3.5 }}>

          {/* Breadcrumb + Back */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.disabled"
                letterSpacing={0.8}
                sx={{ textTransform: 'uppercase', fontSize: '0.65rem', cursor: 'pointer', '&:hover': { color: '#CC0000' } }}
                onClick={() => navigate('/complete')}
              >
                Dashboard
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>›</Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                letterSpacing={0.8}
                sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}
              >
                Product Inventory
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBack sx={{ fontSize: '16px !important' }} />}
              onClick={() => navigate('/complete')}
              sx={{
                borderColor: 'grey.300',
                color: 'text.secondary',
                fontWeight: 600,
                borderRadius: 2,
                fontSize: '0.75rem',
                '&:hover': { borderColor: '#CC0000', color: '#CC0000', bgcolor: 'rgba(204,0,0,0.03)' },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>

          {/* Page heading + CTA */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3.5 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} mb={0.5}>
                Product Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review your inventory performance and submission status.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/item-listing')}
              sx={{
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                flexShrink: 0,
              }}
            >
              Add New Listing
            </Button>
          </Box>

          {/* ── Stat cards ── */}
          <Box sx={{ display: 'flex', gap: 2.5, mb: 4, flexWrap: 'wrap' }}>

            {/* Approved */}
            <Paper
              elevation={0}
              sx={{
                flex: '1 1 200px',
                p: 2.5,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 20, color: '#2e7d32' }} />
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {approvedPct}%
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Approved Listings
              </Typography>
              <LinearProgress
                variant="determinate"
                value={approvedPct}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32', borderRadius: 2 },
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {LIVE_COUNT} items live in marketplace
              </Typography>
            </Paper>

            {/* Rejected */}
            <Paper
              elevation={0}
              sx={{
                flex: '1 1 200px',
                p: 2.5,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Cancel sx={{ fontSize: 20, color: '#c62828' }} />
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {rejectedPct}%
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Rejected Entries
              </Typography>
              <LinearProgress
                variant="determinate"
                value={rejectedPct}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': { bgcolor: '#c62828', borderRadius: 2 },
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {REJECTED_COUNT} items require editorial revisions
              </Typography>
            </Paper>

            {/* Pending */}
            <Paper
              elevation={0}
              sx={{
                flex: '1 1 200px',
                p: 2.5,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                bgcolor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 20, color: '#e65100' }} />
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  {pendingPct}%
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Pending Review
              </Typography>
              <LinearProgress
                variant="determinate"
                value={pendingPct}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  '& .MuiLinearProgress-bar': { bgcolor: '#e65100', borderRadius: 2 },
                }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                {PENDING_COUNT} items currently being curated
              </Typography>
            </Paper>
          </Box>

          {/* ── Product Inventory Table ── */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              bgcolor: '#fff',
              overflow: 'hidden',
              mb: 4,
            }}
          >
            {/* Table header row */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Product Inventory
              </Typography>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <FilterList sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: 'text.disabled',
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'grey.100',
                    }}
                  >
                    Product Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: 'text.disabled',
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'grey.100',
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: 'text.disabled',
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'grey.100',
                    }}
                  >
                    Item Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: 'text.disabled',
                      py: 1.25,
                      borderBottom: '1px solid',
                      borderColor: 'grey.100',
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_ITEMS.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                      borderBottom: idx < MOCK_ITEMS.length - 1 ? '1px solid' : 'none',
                      borderColor: 'grey.100',
                    }}
                  >
                    <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Color swatch thumbnail */}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: item.color,
                            flexShrink: 0,
                            border: '1px solid rgba(0,0,0,0.08)',
                          }}
                        />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {item.category}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {item.itemType}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: 'none' }}>
                      <StatusChip status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
