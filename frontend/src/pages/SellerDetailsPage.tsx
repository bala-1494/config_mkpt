import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SectionKey, SectionStatusRow, SellerLead } from '../types'
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material'
import {
  Person,
  LocationOn,
  Brush,
  Policy,
  Undo,
  Business,
  NotificationsNone,
  HelpOutline,
  CheckCircle,
  RadioButtonUnchecked,
  Cancel,
  HourglassEmpty,
  PendingOutlined,
  LogoutOutlined,
} from '@mui/icons-material'
import BasicInfoSection from './seller-details/BasicInfoSection'
import AddressesSection from './seller-details/AddressesSection'
import BrandingSection from './seller-details/BrandingSection'
import PrivacyPolicySection from './seller-details/PrivacyPolicySection'
import ReturnPolicySection from './seller-details/ReturnPolicySection'
import BusinessDetailsSection from './seller-details/BusinessDetailsSection'

// ── Section config ─────────────────────────────────────────────────────────────
const SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: 'basic_info', label: 'Basic Information', icon: <Person fontSize="inherit" /> },
  { key: 'addresses', label: 'Addresses & Warehouses', icon: <LocationOn fontSize="inherit" /> },
  { key: 'branding', label: 'Branding', icon: <Brush fontSize="inherit" /> },
  { key: 'privacy_policy', label: 'Privacy Policy', icon: <Policy fontSize="inherit" /> },
  { key: 'return_policy', label: 'Return Policy', icon: <Undo fontSize="inherit" /> },
  { key: 'business_details', label: 'Business Details', icon: <Business fontSize="inherit" /> },
]

const DEFAULT_STATUS: SectionStatusRow = { section: 'basic_info', status: 'yet_to_be_added' }

// ── Status dot indicator ───────────────────────────────────────────────────────
function StatusDot({ status }: { status: SectionStatusRow['status'] }) {
  if (status === 'approved') {
    return <CheckCircle sx={{ fontSize: 14, color: '#2e7d32' }} />
  }
  if (status === 'rejected') {
    return <Cancel sx={{ fontSize: 14, color: '#c62828' }} />
  }
  if (status === 'submitted') {
    return <HourglassEmpty sx={{ fontSize: 13, color: '#3366cc' }} />
  }
  if (status === 'draft') {
    return <PendingOutlined sx={{ fontSize: 14, color: '#9e9e9e' }} />
  }
  // yet_to_be_added
  return <RadioButtonUnchecked sx={{ fontSize: 14, color: '#d0d0d0' }} />
}

// ── Sidebar nav item ───────────────────────────────────────────────────────────
function SideNavItem({
  icon,
  label,
  active,
  status,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  status: SectionStatusRow['status']
  onClick: () => void
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
        sx={{ flex: 1, lineHeight: 1.3 }}
      >
        {label}
      </Typography>
      <StatusDot status={status} />
    </Box>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SellerDetailsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SectionKey>('basic_info')
  const [statuses, setStatuses] = useState<Record<SectionKey, SectionStatusRow>>({
    basic_info: { ...DEFAULT_STATUS, section: 'basic_info' },
    addresses: { ...DEFAULT_STATUS, section: 'addresses' },
    branding: { ...DEFAULT_STATUS, section: 'branding' },
    privacy_policy: { ...DEFAULT_STATUS, section: 'privacy_policy' },
    return_policy: { ...DEFAULT_STATUS, section: 'return_policy' },
    business_details: { ...DEFAULT_STATUS, section: 'business_details' },
  })
  const [leadData, setLeadData] = useState<SellerLead | null>(null)

  // Redirect if not fully onboarded
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_leads')
      .select('*')
      .eq('seller', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const step = data?.journey_step
        if (step === 'onboarding' || step === null || step === undefined) {
          navigate('/onboarding')
        } else if (step === 'vetting' || step === 'bsa') {
          navigate('/vetting')
        } else {
          setLeadData(data as SellerLead)
        }
      })
  }, [user?.id, navigate])

  // Load all section statuses
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_section_status')
      .select('*')
      .eq('seller', user.id)
      .then(({ data }) => {
        if (!data) return
        const updated = { ...statuses }
        for (const row of data) {
          const key = row.section as SectionKey
          if (key in updated) {
            updated[key] = row as SectionStatusRow
          }
        }
        setStatuses(updated)
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (section: SectionKey, updated: SectionStatusRow) => {
    setStatuses(s => ({ ...s, [section]: updated }))
  }

  const initials = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  const renderSection = () => {
    if (!user?.id) return null
    const statusRow = statuses[activeSection]

    switch (activeSection) {
      case 'basic_info':
        return (
          <BasicInfoSection
            sellerId={user.id}
            statusRow={statusRow}
            leadData={leadData}
            onStatusChange={handleStatusChange}
          />
        )
      case 'addresses':
        return (
          <AddressesSection
            sellerId={user.id}
            statusRow={statusRow}
            onStatusChange={handleStatusChange}
          />
        )
      case 'branding':
        return (
          <BrandingSection
            sellerId={user.id}
            statusRow={statusRow}
            onStatusChange={handleStatusChange}
          />
        )
      case 'privacy_policy':
        return (
          <PrivacyPolicySection
            sellerId={user.id}
            statusRow={statusRow}
            onStatusChange={handleStatusChange}
          />
        )
      case 'return_policy':
        return (
          <ReturnPolicySection
            sellerId={user.id}
            statusRow={statusRow}
            onStatusChange={handleStatusChange}
          />
        )
      case 'business_details':
        return (
          <BusinessDetailsSection
            sellerId={user.id}
            statusRow={statusRow}
            onStatusChange={handleStatusChange}
          />
        )
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f7' }}>
      {/* ── Left Sidebar ──────────────────────────────────────── */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand + section title */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{ color: '#CC0000', letterSpacing: '-0.3px', mb: 0.5, cursor: 'pointer' }}
            onClick={() => navigate('/complete')}
          >
            Marketplace portal
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" mt={1.5}>
            Seller Profile
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manage your editorial presence
          </Typography>
        </Box>

        {/* Nav items */}
        <Box sx={{ px: 1.5, py: 1.5, flex: 1 }}>
          {SECTIONS.map(s => (
            <SideNavItem
              key={s.key}
              icon={s.icon}
              label={s.label}
              active={activeSection === s.key}
              status={statuses[s.key].status}
              onClick={() => setActiveSection(s.key)}
            />
          ))}
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
          {(['Dashboard', 'Orders', 'Inventory', 'Analytics'] as const).map((tab, i) => (
            <Box
              key={tab}
              onClick={() => i === 0 && navigate('/complete')}
              sx={{
                borderBottom: i === 0 ? '2px solid #CC0000' : '2px solid transparent',
                pb: 0.5,
                cursor: 'pointer',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={i === 0 ? 700 : 400}
                color={i === 0 ? '#CC0000' : 'text.secondary'}
              >
                {tab}
              </Typography>
            </Box>
          ))}

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <NotificationsNone sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <HelpOutline sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.name ?? 'Profile'}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#CC0000', fontSize: 13, cursor: 'pointer' }}>
              {initials}
            </Avatar>
          </Tooltip>
        </Box>

        {/* Scrollable section content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, md: 5 }, py: 4 }}>
          {renderSection()}
        </Box>
      </Box>
    </Box>
  )
}
