'use client'

import type { ProgressStore, QuestionProgress } from '@/types/question'

const STORAGE_KEY = 'pcse-quiz-progress'

// localStorage 안전 접근 (SSR 환경 대응)
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

// 전체 진행 상황 조회
export function getProgress(): ProgressStore {
  const storage = getStorage()
  if (!storage) return {}
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressStore) : {}
  } catch {
    return {}
  }
}

// 단건 진행 상황 저장 (불변 업데이트)
export function saveProgress(questionId: string, progress: QuestionProgress): void {
  const storage = getStorage()
  if (!storage) return
  const current = getProgress()
  const updated = { ...current, [questionId]: progress }
  storage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// 전체 초기화
export function resetProgress(): void {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(STORAGE_KEY)
}

// 단건 조회
export function getQuestionProgress(questionId: string): QuestionProgress | undefined {
  return getProgress()[questionId]
}

// 특정 문제가 완료됐는지 확인
export function isAnswered(questionId: string): boolean {
  return getProgress()[questionId]?.answered ?? false
}
