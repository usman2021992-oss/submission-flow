import type { SubmissionStatus } from '@/types'

interface StatusBadgeProps {
  status: SubmissionStatus
}

const statusConfig: Record<SubmissionStatus, { bg: string; text: string; dot: string; label: string }> = {
  pending:  { bg: '#FEF3C7', text: '#92400E', dot: '#D97706', label: 'Pending' },
  approved: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Approved' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Rejected' },
  verified: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Verified' },
}

const fallback = { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF', label: 'Unknown' }

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, dot, label } = statusConfig[status] ?? fallback
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
