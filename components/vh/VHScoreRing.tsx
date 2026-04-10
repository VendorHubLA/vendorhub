'use client'

import { cn } from '@/lib/utils'

interface VHScoreRingProps {
  score: number // 0–100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

export function VHScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  className,
  showLabel = true,
}: VHScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#C4A35A' :
    score >= 60 ? '#2E5A40' :
    score >= 40 ? '#F59E0B' :
    '#EF4444'

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE6D8"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <span
          className="absolute text-xs font-bold"
          style={{ color }}
        >
          {score}
        </span>
      )}
    </div>
  )
}
