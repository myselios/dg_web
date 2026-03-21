'use client'

import { cn } from '@/lib/utils'
import type { QuestionOption } from '@/types/question'

interface Props {
  options: QuestionOption[]
  selectedAnswers: string[]
  submitted: boolean
  correctAnswers: string[]
  isMultiple: boolean
  onSelect: (key: string) => void
}

function getOptionStyle(
  key: string,
  selectedAnswers: string[],
  submitted: boolean,
  correctAnswers: string[],
): string {
  const isSelected = selectedAnswers.includes(key)
  const isCorrect = correctAnswers.includes(key)

  if (!submitted) {
    if (isSelected) {
      return 'border-indigo-500 bg-indigo-50'
    }
    return 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
  }

  // After submission
  if (isCorrect) {
    return 'border-green-500 bg-green-50'
  }
  if (isSelected && !isCorrect) {
    return 'border-red-500 bg-red-50'
  }
  return 'border-gray-200 bg-gray-50 opacity-60'
}

export function AnswerOptions({
  options,
  selectedAnswers,
  submitted,
  correctAnswers,
  isMultiple,
  onSelect,
}: Props) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedAnswers.includes(option.key)
        const optionStyle = getOptionStyle(option.key, selectedAnswers, submitted, correctAnswers)

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => !submitted && onSelect(option.key)}
            disabled={submitted}
            className={cn(
              'border-2 rounded-xl p-4 text-left w-full',
              'transition-all duration-150 ease-out',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2',
              submitted && 'pointer-events-none',
              optionStyle,
            )}
            aria-pressed={isSelected}
            aria-label={`${isMultiple ? '체크박스' : '라디오'} ${option.key}: ${option.text_en}`}
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5">
                {isMultiple ? (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-5 h-5 rounded border-2 text-xs font-bold',
                      isSelected
                        ? submitted
                          ? correctAnswers.includes(option.key)
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-red-500 bg-red-500 text-white'
                          : 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-300 bg-white',
                    )}
                  >
                    {isSelected && '✓'}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-5 h-5 rounded-full border-2',
                      isSelected
                        ? submitted
                          ? correctAnswers.includes(option.key)
                            ? 'border-green-500 bg-green-500'
                            : 'border-red-500 bg-red-500'
                          : 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300 bg-white',
                    )}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                )}
              </span>
              <span className="text-sm sm:text-base text-gray-900 font-sans">
                <span className="font-semibold text-gray-500 mr-1">{option.key})</span>
                {option.text_en}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
