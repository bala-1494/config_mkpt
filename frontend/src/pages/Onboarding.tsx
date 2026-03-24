import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  LinearProgress,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material'
import {
  InfoOutlined,
  LockOutlined,
  Business,
  PeopleAlt,
  Language,
  Security as SecurityIcon,
  VerifiedUser,
  ArticleOutlined,
  HeadsetMic,
  WarningAmber,
  Instagram,
  LinkedIn,
  Twitter,
  CheckCircle,
  HelpOutline,
  NotificationsNone,
} from '@mui/icons-material'
import type { SelectChangeEvent } from '@mui/material'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  legalBusinessName: string
  taxId: string
  industryFocus: string
  leadExecutiveName: string
  designation: string
  orgStructure: string
  websiteUrl: string
}

const CATEGORIES = [
  'Beauty & Personal Care',
  'Fashion & Apparel',
  'Electronics & Hardware',
  'Home & Living',
  'Food & Grocery',
  'Sports & Outdoors',
  'Health & Wellness',
  'Toys & Games',
  'Automotive',
  'Books & Media',
]

const ORG_STRUCTURES = [
  { value: 'sole_prop', label: 'Sole Prop' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
]

// ── Left sidebar nav item ─────────────────────────────────────────────────────
function SideNavItem({
  icon,
  label,
  active,
  locked,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  locked?: boolean
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        mb: 0.5,
        borderLeft: active ? '3px solid #CC0000' : '3px solid transparent',
        bgcolor: active ? 'rgba(204,0,0,0.05)' : 'transparent',
        borderRadius: '0 8px 8px 0',
        opacity: locked ? 0.45 : 1,
        cursor: locked ? 'not-allowed' : 'default',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: active ? '#CC0000' : 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box sx={{ color: active ? '#fff' : 'text.secondary', display: 'flex', fontSize: 16 }}>
          {icon}
        </Box>
      </Box>
      <Typography
        variant="body2"
        fontWeight={active ? 600 : 400}
        color={active ? '#CC0000' : 'text.secondary'}
        sx={{ flex: 1, lineHeight: 1.3 }}
      >
        {label}
      </Typography>
      {locked && <LockOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />}
    </Box>
  )
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  children,
  sectionRef,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  children: React.ReactNode
  sectionRef?: React.RefObject<HTMLDivElement>
}) {
  return (
    <Paper
      ref={sectionRef}
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        bgcolor: '#fff',
        scrollMarginTop: 64,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: iconColor, display: 'flex', fontSize: 20 }}>{icon}</Box>
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState<FormData>({
    legalBusinessName: '',
    taxId: '',
    industryFocus: 'Beauty & Personal Care',
    leadExecutiveName: '',
    designation: '',
    orgStructure: 'partnership',
    websiteUrl: '',
  })

  const [attempted, setAttempted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [securityScore, setSecurityScore] = useState(0)
  const [socialImports, setSocialImports] = useState<Record<string, boolean>>({
    instagram: false,
    linkedin: false,
    twitter: false,
  })

  const identityRef = useRef<HTMLDivElement>(null)
  const leadershipRef = useRef<HTMLDivElement>(null)
  const digitalRef = useRef<HTMLDivElement>(null)

  // Load persisted draft from Supabase on mount
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_profiles')
      .select('business_name, ein, onboarding_industry, admin_name, onboarding_designation, business_type, website')
      .eq('seller', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setForm((prev) => ({
          ...prev,
          legalBusinessName: data.business_name ?? prev.legalBusinessName,
          taxId: data.ein ?? prev.taxId,
          industryFocus: data.onboarding_industry ?? prev.industryFocus,
          leadExecutiveName: data.admin_name ?? prev.leadExecutiveName,
          designation: data.onboarding_designation ?? prev.designation,
          orgStructure: data.business_type ?? prev.orgStructure,
          websiteUrl: data.website ?? prev.websiteUrl,
        }))
      })
  }, [user?.id])

  const setField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const setSelect = (field: keyof FormData) => (e: SelectChangeEvent) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // Animate security score to 85 when URL is entered
  useEffect(() => {
    if (!form.websiteUrl.trim()) {
      setSecurityScore(0)
      return
    }
    setSecurityScore(0)
    const TARGET = 85
    const DURATION = 1200
    const STEPS = 60
    const interval = DURATION / STEPS
    let current = 0
    const timer = setInterval(() => {
      current += TARGET / STEPS
      if (current >= TARGET) {
        setSecurityScore(TARGET)
        clearInterval(timer)
      } else {
        setSecurityScore(Math.round(current))
      }
    }, interval)
    return () => clearInterval(timer)
  }, [form.websiteUrl])

  // Required fields per section
  const missingIdentity = [form.legalBusinessName, form.taxId].filter((v) => !v.trim()).length
  const missingLeadership = [form.leadExecutiveName, form.designation].filter((v) => !v.trim()).length
  const totalMissing = missingIdentity + missingLeadership
  const warningSection = missingIdentity > 0 ? 'Identity' : 'Leadership'
  const warningCount = missingIdentity > 0 ? missingIdentity : missingLeadership

  const tabs = [
    { label: '01 IDENTITY', ref: identityRef },
    { label: '02 LEADERSHIP', ref: leadershipRef },
    { label: '03 DIGITAL', ref: digitalRef },
  ]

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, idx: number) => {
    setActiveTab(idx)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSaveDraft = async () => {
    if (!user?.id) return
    await supabase.from('seller_profiles').upsert({
      seller: user.id,
      business_name: form.legalBusinessName,
      ein: form.taxId,
      onboarding_industry: form.industryFocus,
      admin_name: form.leadExecutiveName,
      onboarding_designation: form.designation,
      business_type: form.orgStructure,
      website: form.websiteUrl,
      journey_step: 'onboarding',
    }, { onConflict: 'seller' })
    setDraftSaved(true)
  }

  const handleComplete = async () => {
    setAttempted(true)
    if (totalMissing > 0) return
    if (!user?.id) return
    await supabase.from('seller_profiles').upsert({
      seller: user.id,
      business_name: form.legalBusinessName,
      ein: form.taxId,
      onboarding_industry: form.industryFocus,
      admin_name: form.leadExecutiveName,
      onboarding_designation: form.designation,
      business_type: form.orgStructure,
      website: form.websiteUrl,
      journey_step: 'vetting',
    }, { onConflict: 'seller' })
    navigate('/vetting')
  }

  const fieldError = (val: string) => attempted && !val.trim()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f7' }}>
      {/* ── Left sidebar ──────────────────────────────────────── */}
      <Box
        sx={{
          width: 248,
          flexShrink: 0,
          bgcolor: '#fff',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand header */}
        <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#CC0000', letterSpacing: '-0.3px' }}>
            Marketplace portal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Onboarding
          </Typography>
        </Box>

        {/* Nav items */}
        <Box sx={{ px: 1, py: 2, flex: 1 }}>
          <SideNavItem icon={<InfoOutlined fontSize="inherit" />} label="Basic Information" active />
          <SideNavItem icon={<VerifiedUser fontSize="inherit" />} label="Vetting Progress" locked />
          <SideNavItem
            icon={<ArticleOutlined fontSize="inherit" />}
            label={'Business Service\nAgreement'}
            locked
          />
        </Box>

        {/* Support – pinned at sidebar bottom */}
        <Box sx={{ px: 1.5, py: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1.25,
              bgcolor: 'rgba(26,26,46,0.04)',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(26,26,46,0.08)' },
              transition: 'background 0.15s ease',
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HeadsetMic sx={{ color: '#fff', fontSize: 15 }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                Support
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                We're online
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Main content ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Panel header */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 1.25,
            bgcolor: '#fff',
            borderBottom: '1px solid',
            borderColor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          <Tooltip title="Help">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <HelpOutline sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
                <NotificationsNone sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.name ?? 'Profile'}>
            <Avatar
              sx={{ width: 30, height: 30, bgcolor: '#1a1a2e', fontSize: 13, cursor: 'pointer', ml: 0.75 }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
          </Tooltip>
        </Box>

        {/* Scrollable area */}
        <Box sx={{ flex: 1, overflowY: 'auto', pb: 12 }}>
          {/* Page header */}
          <Box sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 2 }}>
            <Typography variant="h4" fontWeight={800} mb={0.75}>
              Lead Evaluation Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please provide comprehensive details for vetting your business potential for the
              Marketplace portal.
            </Typography>
          </Box>

          {/* Tab bar – sticky */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              bgcolor: '#f5f5f7',
              zIndex: 10,
              px: { xs: 3, md: 5 },
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'grey.200' }}>
              {tabs.map((tab, i) => (
                <Box
                  key={tab.label}
                  onClick={() => scrollToSection(tab.ref, i)}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    cursor: 'pointer',
                    borderBottom: '2px solid',
                    borderColor: activeTab === i ? '#CC0000' : 'transparent',
                    mb: '-1px',
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.75 },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    letterSpacing={1}
                    color={activeTab === i ? '#CC0000' : 'text.secondary'}
                  >
                    {tab.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Section cards */}
          <Box sx={{ px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 01 – Business Identity */}
            <SectionCard
              sectionRef={identityRef}
              icon={<Business fontSize="inherit" />}
              iconBg="rgba(204,0,0,0.08)"
              iconColor="#CC0000"
              title="Business Identity"
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Legal Business Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. Acme Corp Industries"
                    value={form.legalBusinessName}
                    onChange={setField('legalBusinessName')}
                    error={fieldError(form.legalBusinessName)}
                    helperText={fieldError(form.legalBusinessName) ? 'Required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Tax Identification Number
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="XX-XXXXXXX"
                    value={form.taxId}
                    onChange={setField('taxId')}
                    error={fieldError(form.taxId)}
                    helperText={fieldError(form.taxId) ? 'Required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Primary Category Focus
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={form.industryFocus}
                    onChange={setSelect('industryFocus')}
                    sx={{ borderRadius: 2 }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </SectionCard>

            {/* 02 – Leadership & Governance */}
            <SectionCard
              sectionRef={leadershipRef}
              icon={<PeopleAlt fontSize="inherit" />}
              iconBg="rgba(51,102,204,0.08)"
              iconColor="#3366cc"
              title="Leadership & Governance"
            >
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Lead Executive Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Full legal name"
                    value={form.leadExecutiveName}
                    onChange={setField('leadExecutiveName')}
                    error={fieldError(form.leadExecutiveName)}
                    helperText={fieldError(form.leadExecutiveName) ? 'Required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Designation
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. CEO, Managing Director"
                    value={form.designation}
                    onChange={setField('designation')}
                    error={fieldError(form.designation)}
                    helperText={fieldError(form.designation) ? 'Required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Organizational Structure
                </Typography>
                <ToggleButtonGroup
                  value={form.orgStructure}
                  exclusive
                  onChange={(_, v) => v && setForm((prev) => ({ ...prev, orgStructure: v }))}
                  fullWidth
                  sx={{
                    gap: 1,
                    '& .MuiToggleButton-root': {
                      flex: 1,
                      borderRadius: '8px !important',
                      border: '1px solid !important',
                      borderColor: 'grey.300 !important',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      py: 1.25,
                      textTransform: 'none',
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        bgcolor: '#CC0000',
                        color: '#fff',
                        borderColor: '#CC0000 !important',
                        '&:hover': { bgcolor: '#a00000' },
                      },
                    },
                  }}
                >
                  {ORG_STRUCTURES.map((s) => (
                    <ToggleButton key={s.value} value={s.value}>
                      {s.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </SectionCard>

            {/* 03 – Digital Presence */}
            <SectionCard
              sectionRef={digitalRef}
              icon={<Language fontSize="inherit" />}
              iconBg="rgba(46,125,50,0.08)"
              iconColor="#2e7d32"
              title="Digital Presence"
            >
              <Box mb={3}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="#CC0000"
                  display="block"
                  mb={0.5}
                >
                  Corporate Website URL
                </Typography>
                <TextField
                  fullWidth
                  placeholder="www.yourbusiness.com"
                  value={form.websiteUrl}
                  onChange={setField('websiteUrl')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            pr: 1.5,
                            mr: 0.5,
                            borderRight: '1px solid',
                            borderColor: 'grey.300',
                          }}
                        >
                          https://
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Social Audit */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 220,
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Language sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={700}>
                      Social Audit
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    Import your social profiles for verification.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { key: 'instagram', label: 'Instagram', icon: <Instagram sx={{ fontSize: 16 }} />, color: '#E1306C' },
                      { key: 'linkedin', label: 'LinkedIn', icon: <LinkedIn sx={{ fontSize: 16 }} />, color: '#0077B5' },
                      { key: 'twitter', label: 'Twitter / X', icon: <Twitter sx={{ fontSize: 16 }} />, color: '#1DA1F2' },
                    ].map(({ key, label, icon, color }) =>
                      socialImports[key] ? (
                        <Box
                          key={key}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
                        >
                          <CheckCircle sx={{ fontSize: 16, color: '#2e7d32' }} />
                          <Typography variant="caption" fontWeight={600} color="#2e7d32">
                            {label} imported for verification
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          key={key}
                          size="small"
                          variant="outlined"
                          startIcon={icon}
                          onClick={() => setSocialImports((prev) => ({ ...prev, [key]: true }))}
                          sx={{
                            justifyContent: 'flex-start',
                            borderColor: color,
                            color: color,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            py: 0.5,
                            textTransform: 'none',
                            '&:hover': { bgcolor: `${color}10`, borderColor: color },
                          }}
                        >
                          Import {label}
                        </Button>
                      )
                    )}
                  </Box>
                </Paper>

                {/* Security Rating */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <SecurityIcon sx={{ fontSize: 18, color: '#CC0000' }} />
                    <Typography variant="body2" fontWeight={700}>
                      Security Rating
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    SSL &amp; Domain authority score assessment.
                  </Typography>
                  {form.websiteUrl.trim() ? (
                    <>
                      <LinearProgress
                        variant="determinate"
                        value={securityScore}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          transition: 'none',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: securityScore >= 80 ? '#2e7d32' : '#3366cc',
                            borderRadius: 3,
                            transition: 'transform 0.02s linear',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">
                          Score: {securityScore}/100
                        </Typography>
                        {securityScore === 85 && (
                          <Typography variant="caption" fontWeight={700} color="#2e7d32">
                            Good
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.disabled" display="block">
                      Enter a URL above to scan
                    </Typography>
                  )}
                </Paper>
              </Box>
            </SectionCard>
          </Box>
        </Box>

        {/* ── Sticky footer ────────────────────────────────────── */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            borderTop: '1px solid',
            borderColor: 'grey.200',
            bgcolor: '#fff',
            px: { xs: 3, md: 5 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            zIndex: 10,
          }}
        >
          {/* Validation warning */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 24 }}>
            {totalMissing > 0 && (
              <>
                <WarningAmber sx={{ color: '#CC0000', fontSize: 18 }} />
                <Typography variant="caption" color="#CC0000" fontWeight={500}>
                  {warningCount} mandatory field{warningCount > 1 ? 's' : ''} remaining in&nbsp;
                  <strong>'{warningSection}'</strong>
                </Typography>
              </>
            )}
          </Box>

          {/* CTAs */}
          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                fontWeight: 600,
                px: 3,
                borderRadius: 2,
                '&:hover': { borderColor: '#CC0000', color: '#CC0000', bgcolor: 'transparent' },
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              onClick={handleComplete}
              sx={{
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
                fontWeight: 700,
                px: 3,
                borderRadius: 2,
              }}
            >
              Proceed to Vetting
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Draft saved snackbar */}
      <Snackbar
        open={draftSaved}
        autoHideDuration={3000}
        onClose={() => setDraftSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setDraftSaved(false)} sx={{ borderRadius: 2 }}>
          Draft saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  )
}
