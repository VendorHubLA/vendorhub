import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import type { Milestone } from '@/types'

interface VHTimelineProps {
  milestones: Milestone[]
  className?: string
}

const STATUS_ICON = {
  pending:     { Icon: Circle,       color: 'text-gray-400' },
  in_progress: { Icon: Clock,        color: 'text-blue-500' },
  completed:   { Icon: CheckCircle2, color: 'text-[#2E5A40]' },
  approved:    { Icon: CheckCircle2, color: 'text-[#C4A35A]' },
  disputed:    { Icon: AlertCircle,  color: 'text-red-500' },
}

export function VHTimeline({ milestones, className }: VHTimelineProps) {
  return (
    <ol className={cn('relative', className)}>
      {milestones.map((milestone, index) => {
        const { Icon, color } = STATUS_ICON[milestone.status]
        const isLast = index === milestones.length - 1

        return (
          <li key={milestone.id} className="flex gap-4">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', color)} />
              {!isLast && <div className="w-px flex-1 bg-[#D6CCBC] my-1" />}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="text-sm font-semibold text-[#1E3829]">{milestone.title}</p>
              {milestone.description && (
                <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {milestone.due_date && (
                  <span className="text-xs text-gray-400">
                    Due {new Date(milestone.due_date).toLocaleDateString()}
                  </span>
                )}
                {milestone.amount && (
                  <span className="text-xs font-medium text-[#C4A35A]">
                    ${milestone.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
