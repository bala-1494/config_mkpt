import type { TaskStatus, DocStatus } from '../types'

type AnyStatus = TaskStatus | DocStatus

const config: Record<AnyStatus, { label: string; classes: string }> = {
  yet_to_submit: { label: 'Yet to submit', classes: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In progress', classes: 'bg-blue-50 text-blue-700' },
  verification_pending: { label: 'Verification pending', classes: 'bg-yellow-50 text-yellow-700' },
  approved: { label: 'Approved', classes: 'bg-green-50 text-green-700' },
  action_needed: { label: 'Action needed', classes: 'bg-red-50 text-red-700' },
  not_uploaded: { label: 'Not uploaded', classes: 'bg-gray-100 text-gray-500' },
  pending: { label: 'Pending review', classes: 'bg-yellow-50 text-yellow-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700' },
}

interface Props {
  status: AnyStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, classes } = config[status] ?? config.yet_to_submit
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${classes}`}>
      {label}
    </span>
  )
}
