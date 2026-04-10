import type { SubmissionStatus } from '@/types'

interface StatusBadgeProps {
  status: SubmissionStatus
}

const statusStyles: Record<SubmissionStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  approved: { bg: '#D1FAE5', text: '#065F46', label: 'Approved' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' },
  verified: { bg: '#DBEAFE', text: '#1E40AF', label: 'Verified' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, label } = statusStyles[status]
  return (
    <span
      style={{
        backgroundColor: bg,
        color: text,
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontWeight: 500,
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  )
}
