'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge, DifficultyBadge } from '@/components/ui/Badge'
import { getQuestionProgress } from '@/lib/progress'
import type { Question } from '@/types/question'

interface QuestionCardProps {
  question: Question
  index: number
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered')

  useEffect(() => {
    const progress = getQuestionProgress(question.id)
    if (progress?.answered) {
      setStatus(progress.correct ? 'correct' : 'wrong')
    } else {
      setStatus('unanswered')
    }
  }, [question.id])

  function handleClick() {
    router.push(`/quiz/${question.id}`)
  }

  return (
    <div role="button" tabIndex={0} onClick={handleClick} onKeyDown={e => e.key === 'Enter' && handleClick()} className="cursor-pointer">
      <Card hover className="flex flex-col gap-3 p-4">
        {/* 상단: 문제 번호 + 도메인 배지 */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
          <Badge variant="domain" className="truncate max-w-[70%] text-right">
            {question.domain}
          </Badge>
        </div>

        {/* 중간: 문제 텍스트 */}
        <p className="text-sm text-gray-800 leading-snug line-clamp-2 flex-1">
          {question.question_en}
        </p>

        {/* 하단: 난이도 + 완료 상태 */}
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={question.difficulty} />
          {status === 'correct' && (
            <Badge variant="correct">정답</Badge>
          )}
          {status === 'wrong' && (
            <Badge variant="wrong">오답</Badge>
          )}
          {status === 'unanswered' && (
            <Badge variant="pending">미완료</Badge>
          )}
        </div>
      </Card>
    </div>
  )
}
