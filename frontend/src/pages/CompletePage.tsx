import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  NotificationsNone,
  Settings,
  Person,
  Article,
  CreditCard,
  List,
  HelpOutline,
  SwapHoriz,
  LocalShipping,
  TrendingUp,
  LogoutOutlined,
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
      <Box
        sx={{
          color: active ? '#CC0000' : 'text.secondary',
          display: 'flex',
          fontSize: 20,
        }}
      >
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

// ── Mandatory task card ────────────────────────────────────────────────────────
function TaskCard({
  icon,
  title,
  description,
  status,
  progressLabel,
  progressValue,
  linkLabel,
  buttonLabel,
  onLinkClick,
  onButtonClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: 'completed' | 'in_progress'
  progressLabel?: string
  progressValue?: number
  linkLabel?: string
  buttonLabel?: string
  onLinkClick?: () => void
  onButtonClick?: () => void
}) {
  const isCompleted = status === 'completed'
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 44%',
        minWidth: 260,
        position: 'relative',
      }}
    >
      {/* Status badge */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        {isCompleted ? (
          <Chip
            icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#2e7d32 !important' }} />}
            label="COMPLETED"
            size="small"
            sx={{
              bgcolor: 'rgba(46,125,50,0.08)',
              color: '#2e7d32',
              fontWeight: 700,
              fontSize: '0.63rem',
              letterSpacing: 0.5,
              height: 22,
              '& .MuiChip-icon': { ml: '6px' },
            }}
          />
        ) : (
          <Chip
            label="IN PROGRESS"
            size="small"
            sx={{
              bgcolor: 'rgba(51,102,204,0.1)',
              color: '#3366cc',
              fontWeight: 700,
              fontSize: '0.63rem',
              letterSpacing: 0.5,
              height: 22,
            }}
          />
        )}
      </Box>

      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: isCompleted ? 'rgba(46,125,50,0.1)' : 'rgba(51,102,204,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ color: isCompleted ? '#2e7d32' : '#3366cc', display: 'flex', fontSize: 22 }}>
          {icon}
        </Box>
      </Box>

      <Typography variant="subtitle1" fontWeight={700} mb={0.5} pr={10}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" lineHeight={1.6} display="block" mb={2}>
        {description}
      </Typography>

      {/* Bottom action area */}
      <Box sx={{ mt: 'auto' }}>
        {isCompleted && linkLabel && (
          <Typography
            variant="body2"
            fontWeight={600}
            color="#3366cc"
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
            onClick={onLinkClick}
          >
            {linkLabel} &rsaquo;
          </Typography>
        )}

        {!isCompleted && progressLabel !== undefined && progressValue !== undefined && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {progressLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {progressValue}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                mb: 2,
                '& .MuiLinearProgress-bar': { bgcolor: '#CC0000', borderRadius: 3 },
              }}
            />
            {buttonLabel && (
              <Button
                variant="contained"
                fullWidth
                onClick={onButtonClick}
                sx={{
                  bgcolor: '#CC0000',
                  '&:hover': { bgcolor: '#a00000' },
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  letterSpacing: 0.5,
                }}
              >
                {buttonLabel}
              </Button>
            )}
          </>
        )}
      </Box>
    </Paper>
  )
}

// ── Optional growth tool card ──────────────────────────────────────────────────
function GrowthCard({
  icon,
  title,
  description,
  linkLabel,
}: {
  icon: React.ReactNode
  title: string
  description: string
  linkLabel: string
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        bgcolor: '#fff',
        flex: '1 1 28%',
        minWidth: 200,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Optional badge */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600} letterSpacing={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
          OPTIONAL
        </Typography>
      </Box>

      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <Box sx={{ color: 'text.secondary', display: 'flex', fontSize: 22 }}>
          {icon}
        </Box>
      </Box>

      <Typography variant="subtitle2" fontWeight={700} mb={0.5} pr={8}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" lineHeight={1.6} display="block" mb={2}>
        {description}
      </Typography>

      <Box sx={{ mt: 'auto' }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="#3366cc"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
          onClick={() => {}}
        >
          {linkLabel} &rsaquo;
        </Typography>
      </Box>
    </Paper>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CompletePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [progressAngle, setProgressAngle] = useState(0)
  const [sectionStatuses, setSectionStatuses] = useState<{ section: string; status: string }[]>([])
  const [statusesLoaded, setStatusesLoaded] = useState(false)

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

  // Fetch real section statuses for partner profile
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_section_status')
      .select('section, status')
      .eq('seller', user.id)
      .then(({ data }) => {
        setSectionStatuses(data ?? [])
        setStatusesLoaded(true)
      })
  }, [user?.id])

  // Derive partner profile progress from real data
  // Weight per section: yet_to_be_added=0, draft/rejected=1, submitted=2, approved=3
  const sectionStatusWeight: Record<string, number> = {
    yet_to_be_added: 0,
    draft: 1,
    rejected: 1,
    submitted: 2,
    approved: 3,
  }
  const profileWeightTotal = sectionStatuses.reduce(
    (sum, s) => sum + (sectionStatusWeight[s.status] ?? 0),
    0,
  )
  const approvedSections = sectionStatuses.filter(s => s.status === 'approved').length
  const submittedSections = sectionStatuses.filter(
    s => s.status === 'submitted' || s.status === 'approved',
  ).length
  const savedSections = sectionStatuses.filter(s => s.status !== 'yet_to_be_added').length
  const partnerProfileComplete = approvedSections === 6
  // Max weight = 6 sections × 3 = 18
  const partnerProfileProgress = Math.round((profileWeightTotal / 18) * 100)
  const partnerProfileLabel =
    submittedSections > 0
      ? `${submittedSections} of 6 sections submitted`
      : savedSections > 0
        ? `${savedSections} of 6 sections saved`
        : '0 of 6 sections completed'

  // Static placeholders for tasks without real tables yet
  const kycProgress = 30
  const stripeComplete = false
  const itemProgress = 15

  const completedCount =
    (partnerProfileComplete ? 1 : 0) + (stripeComplete ? 1 : 0)

  const globalProgress = statusesLoaded
    ? Math.round((partnerProfileProgress + kycProgress + (stripeComplete ? 100 : 0) + itemProgress) / 4)
    : 0

  // Animate circular progress once data is loaded
  useEffect(() => {
    if (!statusesLoaded) return
    const target = globalProgress
    const duration = 900
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * target, target)
      setProgressAngle(pct)
      if (pct < target) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [statusesLoaded, globalProgress])

  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f7' }}>
      {/* ── Left sidebar ──────────────────────────────────────── */}
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
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#CC0000', letterSpacing: '-0.3px', mb: 1.5 }}>
            Marketplace portal
          </Typography>
          <Typography variant="caption" color="text.disabled" fontWeight={700} letterSpacing={0.8} sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
            Onboarding Support
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.primary" mt={0.25}>
            Seller Support
          </Typography>
        </Box>

        <Box sx={{ px: 1.5, py: 1.5, flex: 1 }}>
          <SideNavItem icon={<Person fontSize="inherit" />} label="Partner Profile" active onClick={() => navigate('/seller-details')} />
          <SideNavItem icon={<Article fontSize="inherit" />} label="Documentation & KYC" />
          <SideNavItem icon={<CreditCard fontSize="inherit" />} label="Stripe Account Enablement" />
          <SideNavItem icon={<List fontSize="inherit" />} label="Item Listing" />
          <SideNavItem icon={<HelpOutline fontSize="inherit" />} label="Support" />
        </Box>

        {/* Footer links */}
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
            <Typography variant="caption" fontWeight={600}>
              Log out
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Main panel ────────────────────────────────────────── */}
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
          {/* Dashboard tab */}
          <Box sx={{ borderBottom: '2px solid #CC0000', pb: 0.5 }}>
            <Typography variant="body2" fontWeight={700} color="#CC0000">
              Dashboard
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Icons */}
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

          {/* Page title */}
          <Typography variant="h4" fontWeight={800} mb={0.5}>
            Seller onboarding
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Welcome back. Keep going to finalize your store launch.
          </Typography>

          {/* ── Progress banner ── */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              mb: 4,
              overflow: 'hidden',
              background: 'linear-gradient(130deg, #1e7a3c 0%, #2a9e50 55%, #38b865 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 3.5 },
              gap: 3,
            }}
          >
            <Box>
              {/* Badge */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 20,
                  px: 1.5,
                  py: 0.4,
                  mb: 1.5,
                }}
              >
                <CheckCircle sx={{ color: '#fff', fontSize: 14 }} />
                <Typography variant="caption" fontWeight={700} color="#fff" letterSpacing={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                  No Critical Actions Pending
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight={800} color="#fff" mb={1}>
                You're on track!
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 460, lineHeight: 1.65 }}>
                Complete the remaining tasks to start listing your inventory. Our team is currently reviewing your submitted details.
              </Typography>
            </Box>

            {/* Circular progress */}
            <Box sx={{ flexShrink: 0, textAlign: 'center' }}>
              <Typography variant="caption" fontWeight={700} color="rgba(255,255,255,0.75)" letterSpacing={1} display="block" mb={0.5} sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
                Global Progress
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                {/* Background ring */}
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={80}
                  thickness={5}
                  sx={{ color: 'rgba(255,255,255,0.2)', position: 'absolute', top: 0, left: 0 }}
                />
                {/* Foreground ring */}
                <CircularProgress
                  variant="determinate"
                  value={progressAngle}
                  size={80}
                  thickness={5}
                  sx={{ color: '#fff' }}
                />
                <Box
                  sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fff',
                    borderRadius: '50%',
                    m: '9px',
                  }}
                >
                  <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ fontSize: '1rem', lineHeight: 1 }}>
                    {Math.round(progressAngle)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* ── Mandatory Setup Tasks ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>
              Mandatory Setup Tasks
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {completedCount} / 4 Completed
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, mb: 4 }}>
            <TaskCard
              icon={<Person fontSize="inherit" />}
              title="Partner Profile"
              description="Basic partner information, contact details, and brand identity for the marketplace."
              status={partnerProfileComplete ? 'completed' : 'in_progress'}
              progressLabel={partnerProfileLabel}
              progressValue={partnerProfileProgress}
              linkLabel="View details"
              buttonLabel="CONTINUE SETUP"
              onLinkClick={() => navigate('/seller-details')}
              onButtonClick={() => navigate('/seller-details')}
            />
            <TaskCard
              icon={<Article fontSize="inherit" />}
              title="Documentation & KYC"
              description="Upload business registry and Know Your Customer documents for verification."
              status="in_progress"
              progressLabel="Verification Progress"
              progressValue={30}
              buttonLabel="CONTINUE VERIFICATION"
            />
            <TaskCard
              icon={<CreditCard fontSize="inherit" />}
              title="Stripe Account Enablement"
              description="Payment processing setup through Stripe for secure, automated global payouts."
              status={stripeComplete ? 'completed' : 'in_progress'}
              progressLabel="Account setup"
              progressValue={0}
              linkLabel="Manage Stripe settings"
              buttonLabel="CONNECT STRIPE"
            />
            <TaskCard
              icon={<List fontSize="inherit" />}
              title="Item Listing"
              description="Start adding your product catalog. High-quality imagery and detailed descriptions required."
              status="in_progress"
              progressLabel="Catalog Ready"
              progressValue={15}
              buttonLabel="ADD ITEMS"
            />
          </Box>

          {/* ── Optional Growth Tools ── */}
          <Typography variant="h6" fontWeight={700} mb={2.5}>
            Optional Growth Tools
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, pb: 4 }}>
            <GrowthCard
              icon={<SwapHoriz fontSize="inherit" />}
              title="Integrations (Channel/Direct)"
              description="Connect your existing warehouse or external sales channels for automatic updates."
              linkLabel="Explore Connections"
            />
            <GrowthCard
              icon={<LocalShipping fontSize="inherit" />}
              title="Partner Services"
              description="Access discounted shipping rates and logistics support from our vetted network."
              linkLabel="View Partners"
            />
            <GrowthCard
              icon={<TrendingUp fontSize="inherit" />}
              title="Market Insights"
              description="Get early access to trending category data and localized buyer demand forecasts."
              linkLabel="Unlock Data"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
