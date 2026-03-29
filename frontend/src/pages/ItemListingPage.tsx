import { useEffect, useState } from 'react'
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
  UploadFile,
  AutoFixHigh,
  CheckCircle,
  InfoOutlined,
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ItemListingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<'original' | 'transformed'>('transformed')

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
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* ── Content + Right Sidebar row ── */}
          <Box sx={{ flex: 1, display: 'flex', gap: 0 }}>

            {/* Main content */}
            <Box sx={{ flex: 1, px: { xs: 3, md: 4 }, py: 4, minWidth: 0 }}>

              {/* Breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
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
                  Item Setup
                </Typography>
              </Box>

              {/* Heading */}
              <Typography variant="h4" fontWeight={800} mb={0.75}>
                Select Data Version
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4} sx={{ maxWidth: 560 }}>
                Choose which version of your catalog data you want to proceed with for the final marketplace listing.
              </Typography>

              {/* ── Two cards ── */}
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>

                {/* Original Item Data */}
                <Paper
                  elevation={0}
                  onClick={() => setSelected('original')}
                  sx={{
                    flex: '1 1 280px',
                    p: 3,
                    border: '2px solid',
                    borderColor: selected === 'original' ? '#CC0000' : 'grey.200',
                    borderRadius: 3,
                    bgcolor: '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.18s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                  }}
                >
                  {/* Badge + Icon row */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UploadFile sx={{ fontSize: 24, color: 'text.secondary' }} />
                    </Box>
                    <Chip
                      label="USER UPLOAD"
                      size="small"
                      sx={{
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        letterSpacing: 0.6,
                        height: 20,
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} mb={0.75}>
                    Original Item Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.65} mb={3}>
                    Contains exactly the fields and formatting provided in your initial CSV submission. Best for manual validation.
                  </Typography>

                  {/* File specs row */}
                  <Paper
                    elevation={0}
                    sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 1.5, mb: 3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.58rem' }}>
                        File Specs
                      </Typography>
                      <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.58rem' }}>
                        Status
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                          catalog_v1_final.csv
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                          Uploaded Oct 24, 2:45 PM · 4.2 MB
                        </Typography>
                      </Box>
                      <Chip
                        label="READY"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(46,125,50,0.1)',
                          color: '#2e7d32',
                          fontWeight: 700,
                          fontSize: '0.6rem',
                          letterSpacing: 0.5,
                          height: 20,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Paper>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: '#CC0000',
                      color: '#CC0000',
                      fontWeight: 700,
                      letterSpacing: 1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(204,0,0,0.04)', borderColor: '#CC0000' },
                    }}
                  >
                    VIEW
                  </Button>
                </Paper>

                {/* Transformed Item Data */}
                <Paper
                  elevation={0}
                  onClick={() => setSelected('transformed')}
                  sx={{
                    flex: '1 1 280px',
                    p: 3,
                    border: '2px solid',
                    borderColor: selected === 'transformed' ? '#CC0000' : 'grey.200',
                    borderRadius: 3,
                    bgcolor: '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.18s',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Badge + Icon row */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'rgba(204,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutoFixHigh sx={{ fontSize: 24, color: '#CC0000' }} />
                    </Box>
                    <Chip
                      label="AI ENHANCED"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(204,0,0,0.08)',
                        color: '#CC0000',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        letterSpacing: 0.6,
                        height: 20,
                        borderRadius: 1,
                      }}
                    />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} mb={0.75}>
                    Transformed Item Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.65} mb={3}>
                    Optimized by our system. Includes SEO-friendly titles, standardized categories, and normalized currency formatting.
                  </Typography>

                  {/* Optimization score */}
                  <Paper
                    elevation={0}
                    sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 1.5, mb: 3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.58rem' }}>
                        Optimization Score
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="#CC0000" sx={{ fontSize: '0.7rem' }}>
                        98% Match
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={98}
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        mb: 1,
                        '& .MuiLinearProgress-bar': { bgcolor: '#CC0000', borderRadius: 3 },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Enriched 412 attributes · Mapped to Global Taxonomy
                    </Typography>
                  </Paper>

                  {selected === 'transformed' ? (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<CheckCircle sx={{ fontSize: '18px !important' }} />}
                      sx={{
                        bgcolor: '#CC0000',
                        '&:hover': { bgcolor: '#a00000' },
                        fontWeight: 700,
                        letterSpacing: 1,
                        borderRadius: 2,
                      }}
                    >
                      SELECTED
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderColor: '#CC0000',
                        color: '#CC0000',
                        fontWeight: 700,
                        letterSpacing: 1,
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(204,0,0,0.04)', borderColor: '#CC0000' },
                      }}
                    >
                      SELECT
                    </Button>
                  )}
                </Paper>
              </Box>
            </Box>

            {/* ── Right Sidebar ── */}
            <Box
              sx={{
                width: 300,
                flexShrink: 0,
                px: 3,
                py: 4,
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              {/* Submission Tips */}
              <Paper
                elevation={0}
                sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.primary"
                  letterSpacing={0.8}
                  sx={{ textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 2 }}
                >
                  Submission Tips
                </Typography>

                {[
                  {
                    n: 1,
                    text: (
                      <>
                        The <strong>Transformed Data</strong> typically goes live 40% faster due to fewer QA rejections.
                      </>
                    ),
                  },
                  {
                    n: 2,
                    text: (
                      <>
                        Check your <strong>image mappings</strong> in the original data to ensure URLs are still valid.
                      </>
                    ),
                  },
                  {
                    n: 3,
                    text: (
                      <>
                        Transformed data automatically creates <strong>Smart Tags</strong> for better discovery.
                      </>
                    ),
                  },
                ].map(tip => (
                  <Box key={tip.n} sx={{ display: 'flex', gap: 1.5, mb: tip.n < 3 ? 2 : 0 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: '#CC0000',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.1,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, lineHeight: 1 }}>
                        {tip.n}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.6} sx={{ fontSize: '0.8rem' }}>
                      {tip.text}
                    </Typography>
                  </Box>
                ))}
              </Paper>

              {/* Need Help */}
              <Paper
                elevation={0}
                sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={800}
                  color="text.primary"
                  mb={0.75}
                >
                  Need Help?
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6} mb={2} sx={{ fontSize: '0.8rem' }}>
                  Unsure which version to pick? Our technical team can provide a side-by-side comparison report.
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="#CC0000"
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    letterSpacing: 0.3,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  CONTACT SUPPORT →
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* ── Bottom sticky bar ── */}
          <Box
            sx={{
              px: { xs: 3, md: 4 },
              py: 2,
              bgcolor: '#fff',
              borderTop: '1px solid',
              borderColor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined sx={{ fontSize: 18, color: '#3366cc' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                You can re-sync data later from the Inventory Settings.
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
                fontWeight: 700,
                letterSpacing: 1,
                borderRadius: 2,
                px: 3.5,
                py: 1.1,
                fontSize: '0.82rem',
                flexShrink: 0,
              }}
            >
              SUBMIT SELECTION
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
