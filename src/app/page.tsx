import { getAllQuestions, getDomains } from '@/lib/questions'
import { StatsHeader } from '@/components/StatsHeader'
import { DomainFilter } from '@/components/DomainFilter'
import type { Question } from '@/types/question'

export default function Home() {
  const questions = getAllQuestions()
  const domains = getDomains()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-sans">
                PCSE 연습 문제
              </h1>
              <p className="text-sm text-gray-500">
                Google Professional Cloud Security Engineer
              </p>
            </div>
            {/* StatsHeader는 Client Component (localStorage 접근) */}
            <StatsHeader totalCount={questions.length} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 도메인 필터 + 문제 목록 */}
        <DomainFilter
          domains={domains}
          questions={questions as Question[]}
        />
      </main>
    </div>
  )
}
