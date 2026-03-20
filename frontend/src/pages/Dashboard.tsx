import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import type { SellerProfile, OnboardingTask, TaskStatus } from '../types'

function computeTasks(profile: SellerProfile | null, stripeConnected: boolean): OnboardingTask[] {
  const profileStatus = profile?.profile_status ?? 'yet_to_submit'

  // Profile progress: count filled fields across 6 tabs
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
    {
      key: 'integrations',
      label: 'Integrations',
      description: 'Third-party integrations',
      route: '/dashboard/integrations',
      progress: 0,
      status: 'yet_to_submit',
      optional: true,
    },
    {
      key: 'partners',
      label: 'Partner Services',
      description: 'Fulfillment and marketing partners',
      route: '/dashboard/partners',
      progress: 0,
      status: 'yet_to_submit',
      optional: true,
    },
  ]
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width="48" height="48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke="#CC0000" strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="24" y="28" textAnchor="middle" className="text-xs font-semibold" fontSize="10" fill="#1a1a1a">
        {percent}%
      </text>
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<SellerProfile | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('seller_profiles')
      .select('*')
      .eq('seller', user.id)
      .single()
      .then(({ data }) => setProfile(data as SellerProfile | null))
      .catch(() => setProfile(null))
  }, [user])

  const tasks = computeTasks(profile, profile?.stripe_connected ?? false)
  const completedCount = tasks.filter((t) => t.status === 'approved').length
  const overallProgress = Math.round(
    tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
  )

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Seller Onboarding</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete the steps below to get approved as a seller
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Overall Progress</p>
            <p className="text-xs text-gray-500">{completedCount} of {tasks.length} tasks completed</p>
          </div>
          <span className="text-lg font-semibold" style={{ color: '#CC0000' }}>{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%`, backgroundColor: '#CC0000' }}
          />
        </div>
      </div>

      {/* Task cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <button
            key={task.key}
            onClick={() => navigate(task.route)}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 truncate">
                    {task.label}
                  </h3>
                  {task.optional && (
                    <span className="text-xs text-gray-400 shrink-0">Optional</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{task.description}</p>
              </div>
              <ProgressRing percent={task.progress} />
            </div>
            <StatusBadge status={task.status} size="sm" />
          </button>
        ))}
      </div>
    </div>
  )
}
