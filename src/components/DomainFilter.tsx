'use client'

import { useState } from 'react'
import { QuestionCard } from '@/components/QuestionCard'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/question'

interface DomainFilterProps {
  domains: string[]
  questions: Question[]
}

export function DomainFilter({ domains, questions }: DomainFilterProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('all')

  const filteredQuestions =
    selectedDomain === 'all'
      ? questions
      : questions.filter(q => q.domain === selectedDomain)

  const tabs = [{ key: 'all', label: '전체' }, ...domains.map(d => ({ key: d, label: d }))]

  return (
    <div className="space-y-6">
      {/* 도메인 탭 필터 */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedDomain(tab.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                selectedDomain === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 필터된 문제 수 */}
      <p className="text-sm text-gray-500">{filteredQuestions.length}개 문제</p>

      {/* 문제 그리드 */}
      {filteredQuestions.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          해당 도메인의 문제가 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => {
            const originalIndex = questions.findIndex(q => q.id === question.id)
            return (
              <QuestionCard
                key={question.id}
                question={question}
                index={originalIndex}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
