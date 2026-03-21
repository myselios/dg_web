'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  questionKo: string
}

export function KoreanPanel({ questionKo }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-korean-bg border border-korean-border rounded-2xl overflow-hidden">
      {/* Mobile toggle header */}
      <button
        type="button"
        className={cn(
          'lg:hidden w-full flex items-center justify-between px-4 py-3',
          'text-sm font-semibold text-indigo-700',
          'hover:bg-indigo-50 transition-colors duration-150',
        )}
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <span>📘 한국어 번역</span>
        <span className="text-indigo-400 ml-2">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Desktop header (always shown) */}
      <div className="hidden lg:flex items-center px-5 pt-5 pb-3">
        <span className="text-sm font-semibold text-indigo-700">📘 한국어 번역</span>
      </div>

      {/* Content */}
      <div
        className={cn(
          'px-4 pb-4 lg:px-5 lg:pb-5',
          // Mobile: show/hide based on toggle
          isExpanded ? 'block' : 'hidden',
          // Desktop: always show
          'lg:block',
        )}
      >
        <p className="font-korean text-gray-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
          {questionKo}
        </p>
      </div>
    </div>
  )
}
