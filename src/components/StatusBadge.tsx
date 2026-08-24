import type { MemberStatus } from '../types'

interface StatusBadgeProps {
  status: MemberStatus
  size?: 'sm' | 'md'
}

const config: Record<MemberStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  },
  expiring: {
    label: 'Expiring Soon',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { label, className, dot } = config[status]
  const textSize = size === 'md' ? 'text-sm' : 'text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${textSize} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} aria-hidden="true" />
      {label}
    </span>
  )
}
