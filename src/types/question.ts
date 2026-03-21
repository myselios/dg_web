export interface QuestionOption {
  key: string
  text_en: string
  text_ko?: string
}

export interface Question {
  id: string
  question_en: string
  question_ko: string
  options: QuestionOption[]
  correct_answers: string[]
  explanation_ko: string
  domain: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export interface QuestionProgress {
  answered: boolean
  correct: boolean
  selectedAnswers: string[]
  answeredAt: string
}

export type ProgressStore = Record<string, QuestionProgress>

export interface QuizStats {
  total: number
  answered: number
  correct: number
  accuracy: number
}
