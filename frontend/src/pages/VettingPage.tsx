import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle,
  FiberManualRecord,
  Public,
  Fingerprint,
  InfoOutlined,
  ArticleOutlined,
  LockOutlined,
  Download,
  Security as SecurityIcon,
  VerifiedUser,
  TaskAlt,
  HeadsetMic,
  HelpOutline,
  NotificationsNone,
} from '@mui/icons-material'

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'vetting' | 'bsa'

// ── Constants ─────────────────────────────────────────────────────────────────
const VETTING_DURATION_MS = 60_000

const CHECKLIST_ITEMS = [
  { label: 'Business License Validation' },
  { label: 'Tax Compliance (W-9 / VAT)' },
  { label: 'International Sanction List Check' },
]

const BSA_SECTIONS = [
  {
    title: '1. Introduction',
    content: `This Business Service Agreement ("Agreement") is entered into by and between Marketplace portal ("Company") and the undersigned Service Provider ("Provider"). This Agreement governs the Provider's access to and use of the Marketplace portal platform.`,
    bullets: [],
  },
  {
    title: '2. Scope of Services',
    content: `Provider agrees to offer services as described in their profile in a professional and timely manner. Marketplace portal provides the digital venue but is not a party to the transactions between Providers and Clients except as a payment facilitator.`,
    bullets: [
      'Providers must maintain active licensing where required by law.',
      'Marketplace portal reserves the right to audit service quality at any time.',
      'Transactions must be processed through the platform\u2019s proprietary escrow system.',
    ],
  },
  {
    title: '3. Fees & Compensation',
    content: `Marketplace portal charges a platform service fee on each completed transaction. Fees are subject to change with 30 days' written notice. Providers are solely responsible for applicable taxes on their earnings.`,
    bullets: [],
  },
  {
    title: '4. Data Privacy & Security',
    content: `Both parties agree to handle all shared data in accordance with applicable data protection laws, including GDPR and CCPA. Provider data is encrypted in transit and at rest using AES-256 standards.`,
    bullets: [],
  },
  {
    title: '5. Term & Termination',
    content: `This Agreement is effective upon acceptance and continues until terminated by either party with 14 days' written notice. Marketplace portal reserves the right to suspend or terminate access for material breach of this Agreement.`,
    bullets: [],
  },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ phase }: { phase: Phase }) {
  const steps = [
    {
      icon: <InfoOutlined fontSize="inherit" />,
      label: 'Basic Information',
      status: 'complete' as const,
    },
    {
      icon: <VerifiedUser fontSize="inherit" />,
      label: 'Vetting Progress',
      status: phase === 'vetting' ? ('active' as const) : ('complete' as const),
    },
    {
      icon: <ArticleOutlined fontSize="inherit" />,
      label: 'Business Service\nAgreement',
      status: phase === 'bsa' ? ('active' as const) : ('locked' as const),
    },
  ]

  return (
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
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#CC0000', letterSpacing: '-0.3px' }}>
          Marketplace portal
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Onboarding
        </Typography>
      </Box>

      {/* Steps */}
      <Box sx={{ px: 1, py: 2, flex: 1 }}>
        {steps.map((step) => {
          const isActive = step.status === 'active'
          const isDone = step.status === 'complete'
          const isLocked = step.status === 'locked'
          return (
            <Box
              key={step.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1.25,
                mb: 0.5,
                borderLeft: isActive ? '3px solid #CC0000' : '3px solid transparent',
                bgcolor: isActive ? 'rgba(204,0,0,0.05)' : 'transparent',
                borderRadius: '0 8px 8px 0',
                opacity: isLocked ? 0.45 : 1,
                cursor: isLocked ? 'not-allowed' : 'default',
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: isDone ? '#2e7d32' : isActive ? '#CC0000' : 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <CheckCircle sx={{ color: '#fff', fontSize: 16 }} />
                ) : (
                  <Box sx={{ color: isActive ? '#fff' : 'text.secondary', display: 'flex', fontSize: 16 }}>
                    {step.icon}
                  </Box>
                )}
              </Box>

              <Typography
                variant="body2"
                fontWeight={isActive ? 600 : 400}
                color={isActive ? '#CC0000' : isDone ? 'text.primary' : 'text.secondary'}
                sx={{ flex: 1, lineHeight: 1.3, whiteSpace: 'pre-line' }}
              >
                {step.label}
              </Typography>

              {isLocked && <LockOutlined sx={{ fontSize: 14, color: 'text.disabled' }} />}
            </Box>
          )
        })}
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
  )
}

// ── Vetting Content ───────────────────────────────────────────────────────────
function VettingContent({ progress, approvedCount }: { progress: number; approvedCount: number }) {
  const pct = Math.round(progress)

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100 }}>
      {/* Step label + title */}
      <Typography variant="caption" fontWeight={700} color="#CC0000" letterSpacing={1.5} display="block" mb={0.5}>
        STEP 2 OF 3
      </Typography>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Vetting Phase
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ── Left column ── */}
        <Box sx={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Background Verification card */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                Background Verification
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={800} color="#CC0000" lineHeight={1}>
                  {pct}%
                </Typography>
                <Typography variant="caption" color="text.secondary" letterSpacing={1}>
                  {pct < 100 ? 'IN PROGRESS' : 'COMPLETE'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Currently cross-referencing global databases
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                mb: 3,
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#CC0000',
                  borderRadius: 5,
                  transition: 'transform 0.2s linear',
                },
              }}
            />

            {/* Sub-info cards */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(51,102,204,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Public sx={{ color: '#3366cc', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} mb={0.25}>
                    International Registry
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Checking cross-border compliance and legal standing in over 140 jurisdictions.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(204,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Fingerprint sx={{ color: '#CC0000', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} mb={0.25}>
                    Identity Auth
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Real-time biometric and document authenticity protocols are active.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Verification Checklist */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}>
            <Typography variant="h6" fontWeight={700} mb={2.5}>
              Verification Checklist
            </Typography>

            {CHECKLIST_ITEMS.map((item, idx) => {
              const isApproved = idx < approvedCount
              return (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {isApproved ? (
                        <CheckCircle sx={{ color: '#2e7d32', fontSize: 22 }} />
                      ) : (
                        <FiberManualRecord sx={{ color: '#3366cc', fontSize: 12, ml: '5px', mr: '3px' }} />
                      )}
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={isApproved ? 'APPROVED' : 'PROCESSING'}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.5,
                        height: 22,
                        bgcolor: isApproved ? 'rgba(46,125,50,0.08)' : 'rgba(51,102,204,0.08)',
                        color: isApproved ? '#2e7d32' : '#3366cc',
                      }}
                    />
                  </Box>
                  {idx < CHECKLIST_ITEMS.length - 1 && <Divider />}
                </Box>
              )
            })}
          </Paper>
        </Box>

        {/* ── Right column ── */}
        <Box sx={{ flex: '0 1 260px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Why we vet */}
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}>
            <Typography variant="body2" fontWeight={700} mb={1}>
              Why we vet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.65} mb={2.5}>
              To maintain editorial excellence and platform integrity, every partner undergoes a
              rigorous screening process. This ensures that the Marketplace portal remains a curated
              authority for global commerce.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <FiberManualRecord sx={{ color: '#3366cc', fontSize: 10, mt: '5px', flexShrink: 0 }} />
              <Box>
                <Typography variant="body2" fontWeight={700} mb={0.25}>
                  Timeline
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verification typically concludes within 24–48 business hours.
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              size="small"
              sx={{
                mt: 1,
                borderColor: '#CC0000',
                color: '#CC0000',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(204,0,0,0.04)' },
              }}
            >
              Support Center
            </Button>
          </Paper>

          {/* Secure & Encrypted dark card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #1a1a2e 0%, #2d2d44 60%, #3a3a55 100%)',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
            }}
          >
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Box sx={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

            <SecurityIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 36, mb: 1.5 }} />
            <Typography variant="body2" fontWeight={700} color="#fff" mb={0.5}>
              Secure &amp; Encrypted
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>
              Your data is protected with military-grade encryption throughout the vetting lifecycle.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

// ── BSA Content ───────────────────────────────────────────────────────────────
function BSAContent({
  agreed,
  onAgreedChange,
  onAccept,
  onDownload,
}: {
  agreed: boolean
  onAgreedChange: (v: boolean) => void
  onAccept: () => void
  onDownload: () => void
}) {
  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Congratulations header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(204,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <TaskAlt sx={{ color: '#CC0000', fontSize: 34 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} mb={1.5}>
          Congratulations!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
          Your application to join the Marketplace portal has been pre-approved. To finalize your
          vendor status and begin listing services, please review and accept the Business Service
          Agreement (BSA).
        </Typography>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ── Left: BSA Document ── */}
        <Paper
          elevation={0}
          sx={{ flex: '1 1 440px', border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff', overflow: 'hidden' }}
        >
          {/* Doc header */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={700}>
              Business Service Agreement
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ bgcolor: 'grey.100', px: 1, py: 0.25, borderRadius: 1 }}>
              V2024.01.12
            </Typography>
          </Box>

          {/* Doc body */}
          <Box sx={{ px: 3, py: 3, maxHeight: 380, overflowY: 'auto' }}>
            {BSA_SECTIONS.map((section) => (
              <Box key={section.title} mb={2.5}>
                <Typography variant="body2" fontWeight={700} mb={0.75}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={section.bullets.length ? 1 : 0}>
                  {section.content}
                </Typography>
                {section.bullets.length > 0 && (
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {section.bullets.map((b) => (
                      <Typography key={b} component="li" variant="body2" color="text.secondary" lineHeight={1.7} mb={0.25}>
                        {b}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Accept row */}
          <Box sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onChange={(e) => onAgreedChange(e.target.checked)}
                  sx={{ color: 'grey.400', '&.Mui-checked': { color: '#CC0000' } }}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  I have read and agree to the Business Service Agreement terms
                </Typography>
              }
              sx={{ m: 0, flex: 1 }}
            />
            <Button
              variant="contained"
              disabled={!agreed}
              onClick={onAccept}
              sx={{
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
                '&.Mui-disabled': { bgcolor: 'grey.300' },
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                flexShrink: 0,
              }}
            >
              Accept &amp; Continue
            </Button>
          </Box>
        </Paper>

        {/* ── Right column ── */}
        <Box sx={{ flex: '0 1 260px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Next Steps */}
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <FiberManualRecord sx={{ color: '#3366cc', fontSize: 10 }} />
              <Typography variant="body2" fontWeight={700}>
                Next Steps
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" lineHeight={1.65}>
              Once accepted, you'll gain immediate access to the dashboard where you can set up your
              payment profile and list your first service package.
            </Typography>
          </Paper>

          {/* Need Help */}
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 3, bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HeadsetMic sx={{ color: '#fff', fontSize: 16 }} />
              </Box>
              <Typography variant="body2" fontWeight={700}>
                Need Help?
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} lineHeight={1.65}>
              Our compliance team is available 24/7 to answer questions about the BSA.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="small"
              sx={{
                bgcolor: '#CC0000',
                '&:hover': { bgcolor: '#a00000' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Chat with Support
            </Button>
          </Paper>

          {/* Download PDF */}
          <Paper
            elevation={0}
            onClick={onDownload}
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              bgcolor: '#fff',
              cursor: 'pointer',
              '&:hover': { borderColor: 'grey.400', bgcolor: 'grey.50' },
              transition: 'all 0.15s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Download sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" letterSpacing={0.5} fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Offline Copy
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  Download Agreement (PDF)
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" lineHeight={1.6}>
              Keep a copy of this agreement for your own business records.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VettingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('vetting')
  const [progress, setProgress] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const [snackbar, setSnackbar] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Resume: skip to BSA phase if vetting already passed, or to dashboard if agreement accepted
  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('seller_leads')
      .select('vetting_passed, agreement_accepted')
      .eq('seller', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.agreement_accepted) {
          navigate('/dashboard')
        } else if (data?.vetting_passed) {
          setPhase('bsa')
          setProgress(100)
        }
      })
  }, [user?.id, navigate])

  // Animate progress 0→100 over VETTING_DURATION_MS
  useEffect(() => {
    if (phase !== 'vetting') return
    const start = Date.now()

    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / VETTING_DURATION_MS) * 100, 100)
      setProgress(pct)

      if (pct >= 100) {
        clearInterval(id)
        setTimeout(async () => {
          if (user?.id) {
            const { error } = await supabase
              .from('seller_leads')
              .update({
                vetting_passed: true,
                vetting_passed_at: new Date().toISOString(),
                journey_step: 'bsa',
              })
              .eq('seller', user.id)
            if (error) {
              console.error('Failed to save vetting result:', error)
              setSaveError(`Failed to save vetting result: ${error.message}`)
              return
            }
          }
          setPhase('bsa')
        }, 700)
      }
    }, 200)

    return () => clearInterval(id)
  }, [phase])

  // approvedCount: 0→1 at 33%, 1→2 at 67%, 2→3 at 100%
  const approvedCount =
    progress >= 100 ? 3 : progress >= (200 / 3) ? 2 : progress >= (100 / 3) ? 1 : 0

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f5f5f7' }}>
      {/* ── Sidebar ── */}
      <Sidebar phase={phase} />

      {/* ── Right panel ── */}
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

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {phase === 'vetting' ? (
            <VettingContent progress={progress} approvedCount={approvedCount} />
          ) : (
            <BSAContent
              agreed={agreed}
              onAgreedChange={setAgreed}
              onAccept={async () => {
                if (user?.id) {
                  const { error } = await supabase
                    .from('seller_leads')
                    .update({
                      agreement_accepted: true,
                      agreement_accepted_at: new Date().toISOString(),
                      journey_step: 'complete',
                    })
                    .eq('seller', user.id)
                  if (error) {
                    console.error('Failed to save agreement acceptance:', error)
                    setSaveError(`Failed to save agreement: ${error.message}`)
                    return
                  }
                }
                navigate('/dashboard')
              }}
              onDownload={() => setSnackbar(true)}
            />
          )}
        </Box>
      </Box>

      {/* PDF snackbar */}
      <Snackbar
        open={snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnackbar(false)} sx={{ borderRadius: 2 }}>
          PDF download will be available once the agreement is signed.
        </Alert>
      </Snackbar>

      {/* Save error snackbar */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSaveError(null)} sx={{ borderRadius: 2 }}>
          {saveError}
        </Alert>
      </Snackbar>
    </Box>
  )
}
