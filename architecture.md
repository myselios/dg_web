# PCSE Korean Quiz — Architecture

## Overview

GCP PCSE 시험 문제를 cloudpass.pro와 동일한 UX로 제공하되, 문제 영역 오른쪽에 **한국어 번역 패널**을 추가한 나만의 시험 학습 앱.

- **데이터**: Python Playwright 스크래퍼로 수집한 `public/questions.json` (정적 파일)
- **프레임워크**: Next.js 15 App Router (서버 컴포넌트 기반, 추가 백엔드 없음)
- **배포**: Vercel (정적 + SSR 혼합)

---

## Screen Layout (핵심 설계)

### 시험 화면 분할 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  Header: PCSE 연습 문제        [진행률: 3/50] [점수: 66%]    │
├──────────────────────────────────┬──────────────────────────┤
│  [문제 번호] Domain / Difficulty │  📘 한국어 번역           │
│                                  │                          │
│  Question text in English...     │  한국어 문제 텍스트...    │
│  (full scenario)                 │                          │
│                                  │  (question_ko 필드만)    │
│  ○ A) Option A                  │                          │
│  ○ B) Option B                  │                          │
│  ○ C) Option C                  │                          │
│  ○ D) Option D                  │                          │
│                                  │                          │
│  [← 이전]         [Submit →]    │                          │
│                                  │                          │
│  ── 제출 후 ──                  │                          │
│  ✅ 정답! / ❌ 오답 (정답: B)   │                          │
│  [한국어 해설 펼침]              │                          │
│  [다음 문제 →]                  │                          │
└──────────────────────────────────┴──────────────────────────┘

모바일(768px 이하): 한국어 패널 → 문제 하단 접기/펼치기 토글
```

---

## Directory Structure

```
pcse-korean-quiz/
├── scraper/
│   ├── scrape.py              # Playwright 스크래퍼 (1회 실행)
│   └── requirements.txt       # playwright, httpx, beautifulsoup4
│
├── public/
│   └── questions.json         # 수집된 문제 데이터 (정적 서빙)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root Layout (Space Grotesk + Noto Sans KR)
│   │   ├── page.tsx           # 홈: 문제 목록 + 통계 (Server Component)
│   │   ├── quiz/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # 시험 화면 (Server Component shell)
│   │   ├── error.tsx          # 에러 바운더리 (Client)
│   │   ├── loading.tsx        # 로딩 스켈레톤
│   │   └── not-found.tsx      # 404 페이지
│   │
│   ├── components/
│   │   ├── ui/                # 재사용 순수 UI
│   │   │   ├── Badge.tsx      # 도메인/난이도/상태 배지
│   │   │   ├── Button.tsx     # 버튼 (primary/secondary/ghost)
│   │   │   ├── Card.tsx       # 카드 컨테이너
│   │   │   └── Progress.tsx   # 진행 바
│   │   │
│   │   ├── QuestionCard.tsx   # 홈 목록용 카드 (번호/도메인/상태)
│   │   ├── QuizLayout.tsx     # 분할 레이아웃 래퍼 (Client)
│   │   ├── AnswerOptions.tsx  # 선택지 라디오/체크박스 (Client)
│   │   ├── KoreanPanel.tsx    # 오른쪽 한국어 번역 패널
│   │   ├── ResultPanel.tsx    # 정답/오답 결과 + 해설 (Client)
│   │   ├── StatsHeader.tsx    # 진행률/정답률 요약 (Client)
│   │   ├── DomainFilter.tsx   # 도메인 필터 탭 (Client)
│   │   └── Navigation.tsx     # 이전/다음 네비게이션
│   │
│   ├── lib/
│   │   ├── questions.ts       # questions.json 로드 유틸
│   │   └── progress.ts        # localStorage 진행 상황 관리
│   │
│   └── types/
│       └── question.ts        # Question, QuestionOption, Progress 타입
│
├── next.config.ts
├── tailwind.config.ts
├── vercel.json                # 보안 헤더
└── package.json
```

---

## Data Schema (questions.json)

```typescript
interface QuestionOption {
  key: string        // "A" | "B" | "C" | "D" | "E"
  text_en: string    // 영어 선택지
  text_ko?: string   // 한국어 선택지 (있는 경우)
}

interface Question {
  id: string                   // "24009"
  question_en: string          // 영어 문제 텍스트 (전체)
  question_ko: string          // 한국어 문제 텍스트 (오른쪽 패널용)
  options: QuestionOption[]    // 선택지 배열
  correct_answers: string[]    // ["B"] or ["B", "D"]
  explanation_ko: string       // 한국어 해설
  domain: string               // "Logging & Audit"
  difficulty: "EASY" | "MEDIUM" | "HARD"
}
```

## Progress Schema (localStorage)

```typescript
interface QuestionProgress {
  answered: boolean
  correct: boolean
  selectedAnswers: string[]
  answeredAt: string           // ISO timestamp
}

// localStorage key: "pcse-quiz-progress"
type ProgressStore = Record<string, QuestionProgress>
```

---

## Component Architecture

### Server Components (데이터 로딩)
- `app/page.tsx` — questions.json 직접 import → 정적 목록 렌더링
- `app/quiz/[id]/page.tsx` — 해당 문제 데이터 로딩 → QuizLayout에 전달

### Client Components (인터랙션)
- `QuizLayout` — 분할 레이아웃 상태 관리 (제출 여부)
- `AnswerOptions` — 선택지 클릭 상태 (useState)
- `ResultPanel` — 제출 후 결과 표시 (조건부 렌더링)
- `StatsHeader` — localStorage 읽어 통계 표시
- `DomainFilter` — 필터 탭 상태 관리
- `KoreanPanel` — 모바일 토글 상태 (접기/펼치기)

---

## Design System

### Colors (Semantic Tokens)
```css
--color-primary: #4f46e5       /* Indigo-600 - 주 CTA */
--color-correct: #16a34a       /* Green-600 - 정답 */
--color-wrong: #dc2626         /* Red-600 - 오답 */
--color-korean-bg: #f8faff     /* 한국어 패널 배경 (연한 파랑) */
--color-korean-border: #e0e7ff /* 한국어 패널 구분선 */
```

### Typography
```css
font-family: 'Space Grotesk', sans-serif   /* 영어 헤딩/UI */
font-family: 'Noto Sans KR', sans-serif    /* 한국어 콘텐츠 */
```

### Breakpoints
- 모바일: < 768px → 단일 컬럼, 한국어 패널 토글
- 태블릿: 768px–1024px → 70/30 분할
- 데스크탑: > 1024px → 65/35 분할 (한국어 패널 고정)

---

## Key Design Decisions

1. **정적 데이터 (no API)**: questions.json을 public/에 두고 정적 서빙. 백엔드 불필요.
2. **한국어 패널 위치**: 오른쪽 고정 패널 (문제 텍스트만, 보기는 포함 안 함)
3. **진행 상황 localStorage**: 서버 없이 브라우저에서만 상태 유지
4. **스크래퍼 분리**: scraper/ 폴더는 독립 Python 스크립트. 앱과 무관하게 단독 실행.
5. **Server Component 우선**: 데이터 로딩은 서버에서, 인터랙션만 Client로 최소화
