import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  label?: string
  showPercentage?: boolean
  className?: string
  color?: 'indigo' | 'green' | 'amber'
}

const colorStyles: Record<NonNullable<ProgressProps['color']>, string> = {
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
}

export function Progress({
  value,
  label,
  showPercentage = true,
  className,
  color = 'indigo',
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500 ml-auto">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            colorStyles[color],
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
