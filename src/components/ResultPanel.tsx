'use client'

import { cn } from '@/lib/utils'

interface Props {
  isCorrect: boolean
  correctAnswers: string[]
  selectedAnswers: string[]
  explanationKo: string
  onNext?: () => void
}

function parseMarkdownBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>
    }
    return part
  })
}

export function ResultPanel({
  isCorrect,
  correctAnswers,
  explanationKo,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 animate-slide-up',
        'border',
        isCorrect
          ? 'bg-correct-bg border-correct-border'
          : 'bg-wrong-bg border-wrong-border',
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Result header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" aria-hidden="true">
          {isCorrect ? '✅' : '❌'}
        </span>
        <span
          className={cn(
            'font-bold text-lg',
            isCorrect ? 'text-correct-text' : 'text-wrong-text',
          )}
        >
          {isCorrect ? '정답입니다!' : '오답입니다'}
        </span>
      </div>

      {/* Show correct answer if wrong */}
      {!isCorrect && (
        <p className="text-sm text-gray-700 mb-3 font-medium">
          정답: <span className="font-bold text-correct-text">{correctAnswers.join(', ')}</span>
        </p>
      )}

      {/* Explanation */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">해설</p>
        <p className="font-korean text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {parseMarkdownBold(explanationKo)}
        </p>
      </div>
    </div>
  )
}
