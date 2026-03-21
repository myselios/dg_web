'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Question } from '@/types/question'
import { Badge, DifficultyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnswerOptions } from '@/components/AnswerOptions'
import { KoreanPanel } from '@/components/KoreanPanel'
import { ResultPanel } from '@/components/ResultPanel'
import { Navigation } from '@/components/Navigation'
import { getQuestionProgress, saveProgress } from '@/lib/progress'

interface Props {
  question: Question
  prevId: string | null
  nextId: string | null
}

export function QuizLayout({ question, prevId, nextId }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const isMultiple = question.correct_answers.length > 1

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = getQuestionProgress(question.id)
    if (saved?.answered) {
      setSelectedAnswers(saved.selectedAnswers)
      setSubmitted(true)
      setIsCorrect(saved.correct)
    }
  }, [question.id])

  function handleSelect(key: string) {
    if (submitted) return

    if (isMultiple) {
      setSelectedAnswers((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      )
    } else {
      setSelectedAnswers([key])
    }
  }

  function handleSubmit() {
    if (selectedAnswers.length === 0 || submitted) return

    const sortedSelected = [...selectedAnswers].sort()
    const sortedCorrect = [...question.correct_answers].sort()
    const correct =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((k, i) => k === sortedCorrect[i])

    setSubmitted(true)
    setIsCorrect(correct)

    saveProgress(question.id, {
      answered: true,
      correct,
      selectedAnswers,
      answeredAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 shrink-0"
          >
            ← 목록으로
          </Link>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-sm font-semibold text-gray-700 shrink-0">
            문제 {question.id}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="domain">{question.domain}</Badge>
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Korean panel (mobile: top, desktop: right side) */}
          <div className="block lg:hidden">
            <KoreanPanel questionKo={question.question_ko} />
          </div>

          {/* Left main area */}
          <div className="flex-1 min-w-0 lg:w-[65%]">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              {/* English question */}
              <p className="text-gray-900 font-sans leading-relaxed text-base sm:text-lg mb-4">
                {question.question_en}
              </p>

              {/* Multiple answer notice */}
              {isMultiple && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  ※ 복수 정답 ({question.correct_answers.length}개 선택)
                </p>
              )}

              {/* Answer options */}
              <AnswerOptions
                options={question.options}
                selectedAnswers={selectedAnswers}
                submitted={submitted}
                correctAnswers={question.correct_answers}
                isMultiple={isMultiple}
                onSelect={handleSelect}
              />

              {/* Submit button */}
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedAnswers.length === 0 || submitted}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto"
                >
                  {submitted ? '제출 완료' : '정답 제출'}
                </Button>
              </div>

              {/* Result panel */}
              {submitted && isCorrect !== null && (
                <div className="mt-5">
                  <ResultPanel
                    isCorrect={isCorrect}
                    correctAnswers={question.correct_answers}
                    selectedAnswers={selectedAnswers}
                    explanationKo={question.explanation_ko}
                  />
                </div>
              )}

              {/* Navigation */}
              <Navigation prevId={prevId} nextId={nextId} />
            </div>
          </div>

          {/* Right Korean panel (desktop only) */}
          <aside className="hidden lg:block lg:w-[35%] shrink-0">
            <div className="sticky top-24">
              <KoreanPanel questionKo={question.question_ko} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
