'use client'
import { cn } from '@/lib/utils'

type BadgeVariant = 'domain' | 'difficulty' | 'correct' | 'wrong' | 'pending'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  domain: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  difficulty: 'bg-gray-100 text-gray-600 border border-gray-200',
  correct: 'bg-green-100 text-green-700 border border-green-200',
  wrong: 'bg-red-100 text-red-700 border border-red-200',
  pending: 'bg-gray-100 text-gray-600 border border-gray-200',
}

export function Badge({ children, variant = 'domain', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

const difficultyStyles: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  HARD: 'bg-red-100 text-red-700 border border-red-200',
}

const difficultyLabels: Record<string, string> = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const style = difficultyStyles[difficulty] ?? 'bg-gray-100 text-gray-600 border border-gray-200'
  const label = difficultyLabels[difficulty] ?? difficulty

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full',
        style,
      )}
    >
      {label}
    </span>
  )
}
