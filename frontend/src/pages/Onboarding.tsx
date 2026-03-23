import { useState, useRef } from 'react'
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
  Chip,
  InputAdornment,
  Snackbar,
  Alert,
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
  WarningAmber,
  HeadsetMic,
} from '@mui/icons-material'
import type { SelectChangeEvent } from '@mui/material'

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

const INDUSTRIES = [
  'Technology & Software',
  'Retail & Consumer Goods',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Media & Entertainment',
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
    industryFocus: 'Technology & Software',
    leadExecutiveName: '',
    designation: '',
    orgStructure: 'partnership',
    websiteUrl: '',
  })

  const [attempted, setAttempted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)

  const identityRef = useRef<HTMLDivElement>(null)
  const leadershipRef = useRef<HTMLDivElement>(null)
  const digitalRef = useRef<HTMLDivElement>(null)

  const setField = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const setSelect = (field: keyof FormData) => (e: SelectChangeEvent) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

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

  const handleSaveDraft = () => {
    localStorage.setItem(`onboarding_draft_${user?.id}`, JSON.stringify(form))
    setDraftSaved(true)
  }

  const handleComplete = () => {
    setAttempted(true)
    if (totalMissing > 0) return
    localStorage.setItem(`onboarding_complete_${user?.id}`, 'true')
    localStorage.setItem(`onboarding_data_${user?.id}`, JSON.stringify(form))
    navigate('/dashboard')
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
      </Box>

      {/* ── Main content ──────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
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
                  Primary Industry Focus
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={form.industryFocus}
                    onChange={setSelect('industryFocus')}
                    sx={{ borderRadius: 2 }}
                  >
                    {INDUSTRIES.map((ind) => (
                      <MenuItem key={ind} value={ind}>
                        {ind}
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
                    minWidth: 200,
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
                    Verification of active LinkedIn &amp; Twitter profiles.
                  </Typography>
                  <Chip
                    label="LINKED VERIFIED"
                    size="small"
                    sx={{
                      bgcolor: '#e8f5e9',
                      color: '#2e7d32',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      letterSpacing: 0.5,
                      height: 22,
                    }}
                  />
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
                  <LinearProgress
                    variant="determinate"
                    value={78}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { bgcolor: '#3366cc', borderRadius: 3 },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                    Score: 78/100
                  </Typography>
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
              Complete Evaluation
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Floating support chat ─────────────────────────────── */}
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          width: 288,
          p: 2.5,
          borderRadius: 3,
          zIndex: 200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HeadsetMic sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              Need assistance?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Concierge v3.4 is online
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          Vetting typically takes 3–5 business days. Ensure your leadership documents are current.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          size="small"
          sx={{
            bgcolor: '#1a1a2e',
            '&:hover': { bgcolor: '#2d2d4e' },
            fontWeight: 600,
            borderRadius: 2,
            py: 1,
          }}
        >
          Open Support Chat
        </Button>
      </Paper>

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
