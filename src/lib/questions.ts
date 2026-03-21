import questionsData from '../../public/questions.json'
import type { Question, QuizStats } from '@/types/question'

// 전체 문제 반환 (불변)
export function getAllQuestions(): readonly Question[] {
  return questionsData as Question[]
}

// ID로 단건 조회
export function getQuestionById(id: string): Question | undefined {
  return (questionsData as Question[]).find(q => q.id === id)
}

// 도메인 목록 반환 (중복 제거, 정렬)
export function getDomains(): string[] {
  const domains = new Set((questionsData as Question[]).map(q => q.domain))
  return Array.from(domains).sort()
}

// 도메인으로 필터링
export function getQuestionsByDomain(domain: string): readonly Question[] {
  if (domain === 'all') return getAllQuestions()
  return (questionsData as Question[]).filter(q => q.domain === domain)
}

// 이전/다음 문제 ID 반환
export function getAdjacentIds(currentId: string): { prevId: string | null; nextId: string | null } {
  const questions = getAllQuestions()
  const idx = questions.findIndex(q => q.id === currentId)
  return {
    prevId: idx > 0 ? (questions[idx - 1]?.id ?? null) : null,
    nextId: idx < questions.length - 1 ? (questions[idx + 1]?.id ?? null) : null,
  }
}

// 통계 계산 (progress 기반)
export function calculateStats(progress: Record<string, { answered: boolean; correct: boolean }>): QuizStats {
  const total = getAllQuestions().length
  const answered = Object.values(progress).filter(p => p.answered).length
  const correct = Object.values(progress).filter(p => p.correct).length
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0
  return { total, answered, correct, accuracy }
}
