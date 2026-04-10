import { cn } from '@/lib/utils'
import type { ProjectStatus, ComplianceStatus, VendorStatus, MilestoneStatus } from '@/types'

type BadgeVariant =
  | ProjectStatus
  | ComplianceStatus
  | VendorStatus
  | MilestoneStatus
  | 'info'

const VARIANT_STYLES: Record<string, string> = {
  // Project status
  draft:          'bg-gray-100 text-gray-700 border-gray-200',
  active:         'bg-[#2E5A40]/10 text-[#2E5A40] border-[#2E5A40]/20',
  on_hold:        'bg-amber-50 text-amber-700 border-amber-200',
  completed:      'bg-[#1E3829]/10 text-[#1E3829] border-[#1E3829]/20',
  cancelled:      'bg-red-50 text-red-700 border-red-200',

  // Compliance status
  valid:          'bg-[#2E5A40]/10 text-[#2E5A40] border-[#2E5A40]/20',
  expiring_soon:  'bg-amber-50 text-amber-700 border-amber-200',
  expired:        'bg-red-50 text-red-700 border-red-200',
  missing:        'bg-gray-100 text-gray-500 border-gray-200',

  // Vendor status
  pending:        'bg-amber-50 text-amber-700 border-amber-200',
  vetted:         'bg-[#C4A35A]/10 text-[#A8893E] border-[#C4A35A]/30',
  suspended:      'bg-red-50 text-red-700 border-red-200',

  // Milestone status
  in_progress:    'bg-blue-50 text-blue-700 border-blue-200',
  approved:       'bg-[#2E5A40]/10 text-[#2E5A40] border-[#2E5A40]/20',
  disputed:       'bg-red-50 text-red-700 border-red-200',

  // Generic
  info:           'bg-blue-50 text-blue-700 border-blue-200',
}

const LABEL_MAP: Record<string, string> = {
  on_hold:       'On Hold',
  expiring_soon: 'Expiring Soon',
  in_progress:   'In Progress',
  asset_manager: 'Asset Manager',
}

interface VHBadgeProps {
  variant: BadgeVariant
  className?: string
}

export function VHBadge({ variant, className }: VHBadgeProps) {
  const label = LABEL_MAP[variant] ?? variant.charAt(0).toUpperCase() + variant.slice(1)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.info,
        className
      )}
    >
      {label}
    </span>
  )
}
