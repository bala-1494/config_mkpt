import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SellerProfile, SellerLead, SellerDetails, OnboardingTask, TaskStatus } from '../types'
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  Paper,
} from '@mui/material'
import {
  Person,
  Description,
  Inventory,
  CreditCard,
  CheckCircle,
  RadioButtonUnchecked,
  HourglassTop,
  Warning,
  ArrowForward,
} from '@mui/icons-material'

const STATUS_CONFIG: Record<string, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error'; icon: React.ReactElement }> = {
  yet_to_submit: { label: 'Not Started', color: 'default', icon: <RadioButtonUnchecked fontSize="small" /> },
  in_progress: { label: 'In Progress', color: 'info', icon: <HourglassTop fontSize="small" /> },
  verification_pending: { label: 'Pending Review', color: 'warning', icon: <HourglassTop fontSize="small" /> },
  approved: { label: 'Approved', color: 'success', icon: <CheckCircle fontSize="small" /> },
  action_needed: { label: 'Action Needed', color: 'error', icon: <Warning fontSize="small" /> },
  rejected: { label: 'Rejected', color: 'error', icon: <Warning fontSize="small" /> },
}

const TASK_ICONS: Record<string, React.ReactElement> = {
  profile: <Person />,
  documentation: <Description />,
  item_setup: <Inventory />,
  stripe: <CreditCard />,
}

const TASK_COLORS: Record<string, string> = {
  profile: '#CC0000',
  documentation: '#1565C0',
  item_setup: '#2E7D32',
  stripe: '#6A1B9A',
}

function computeTasks(profile: SellerProfile | null, stripeConnected: boolean): OnboardingTask[] {
  const profileStatus = profile?.profile_status ?? 'yet_to_submit'

  let profileProgress = 0
  if (profile) {
    const checks = [
      profile.business_name, profile.ein, profile.contact_number,
      profile.admin_name, profile.business_type,
      profile.business_address?.street,
      profile.brands && profile.brands.length > 0,
      profile.privacy_policy,
      profile.return_window_days != null,
      profile.duns_number,
    ]
    const filled = checks.filter(Boolean).length
    profileProgress = Math.round((filled / checks.length) * 100)
  }

  return [
    {
      key: 'profile',
      label: 'Profile Details',
      description: 'Business info and store policies',
      route: '/dashboard/profile',
      progress: profileProgress,
      status: profileStatus,
    },
    {
      key: 'documentation',
      label: 'Documentation',
      description: 'Business licenses and tax forms',
      route: '/dashboard/documentation',
      progress: 0,
      status: 'yet_to_submit',
    },
    {
      key: 'item_setup',
      label: 'Item Setup',
      description: 'Product inventory import',
      route: '/dashboard/items',
      progress: 0,
      status: 'yet_to_submit',
    },
    {
      key: 'stripe',
      label: 'Stripe Setup',
      description: 'Payment processing configuration',
      route: '/dashboard/stripe',
      progress: stripeConnected ? 100 : 0,
      status: (stripeConnected ? 'approved' : 'yet_to_submit') as TaskStatus,
    },
  ]
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<SellerProfile | null>(null)

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const [leadRes, detailsRes] = await Promise.all([
        supabase.from('seller_leads').select('business_name, ein, admin_name, business_type, website').eq('seller', user.id).maybeSingle(),
        supabase.from('seller_details').select('*').eq('seller', user.id).maybeSingle(),
      ])
      const lead = leadRes.data as Pick<SellerLead, 'business_name' | 'ein' | 'admin_name' | 'business_type' | 'website'> | null
      const details = detailsRes.data as SellerDetails | null
      if (lead || details) {
        setProfile({ ...(lead ?? {}), ...(details ?? {}) } as SellerProfile)
      } else {
        setProfile(null)
      }
    }
    void fetchProfile()
  }, [user])

  const tasks = computeTasks(profile, profile?.stripe_connected ?? false)
  const completedCount = tasks.filter((t) => t.status === 'approved').length
  const overallProgress = Math.round(
    tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
  )

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Seller Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Complete the steps below to get approved as a seller
        </Typography>
      </Box>

      {/* Overall Progress Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completedCount} of {tasks.length} tasks completed
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight={700} color="#CC0000">
              {overallProgress}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={overallProgress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': { bgcolor: '#CC0000', borderRadius: 5 },
          }}
        />
      </Paper>

      {/* Task Cards */}
      <Grid container spacing={2.5}>
        {tasks.map((task) => {
          const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.yet_to_submit
          const taskColor = TASK_COLORS[task.key] ?? '#CC0000'
          const taskIcon = TASK_ICONS[task.key]

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={task.key}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: taskColor,
                    boxShadow: `0 4px 20px ${taskColor}22`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(task.route)}
                  sx={{ height: '100%', p: 0 }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Icon + optional badge */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: `${taskColor}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: taskColor,
                        }}
                      >
                        {taskIcon}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {task.optional && (
                          <Chip label="Optional" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: 'grey.100', color: 'text.secondary' }} />
                        )}
                        <ArrowForward sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Box>
                    </Box>

                    <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                      {task.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      {task.description}
                    </Typography>

                    {/* Progress */}
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight={600} color={taskColor}>
                          {task.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={task.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.100',
                          '& .MuiLinearProgress-bar': { bgcolor: taskColor, borderRadius: 3 },
                        }}
                      />
                    </Box>

                    {/* Status */}
                    <Chip
                      icon={statusCfg.icon}
                      label={statusCfg.label}
                      color={statusCfg.color}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.72rem', height: 24 }}
                    />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
