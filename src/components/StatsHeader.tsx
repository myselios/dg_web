'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { getProgress, resetProgress } from '@/lib/progress'

interface StatsHeaderProps {
  totalCount: number
}

interface Stats {
  completed: number
  correct: number
  accuracy: number
}

export function StatsHeader({ totalCount }: StatsHeaderProps) {
  const [stats, setStats] = useState<Stats>({ completed: 0, correct: 0, accuracy: 0 })
  const [mounted, setMounted] = useState(false)

  function loadStats() {
    const progress = getProgress()
    const entries = Object.values(progress)
    const completed = entries.filter(p => p.answered).length
    const correct = entries.filter(p => p.correct).length
    const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0
    setStats({ completed, correct, accuracy })
  }

  useEffect(() => {
    setMounted(true)
    loadStats()
  }, [])

  function handleReset() {
    if (window.confirm('진행 상황을 초기화할까요?')) {
      resetProgress()
      loadStats()
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">
        완료 {stats.completed}/{totalCount} | 정답률 {stats.accuracy}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="text-xs min-h-[32px] min-w-0 px-2 py-1"
      >
        초기화
      </Button>
    </div>
  )
}
