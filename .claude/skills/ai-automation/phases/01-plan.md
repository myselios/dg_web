# Phase 1: PLAN (계획)

## 목적

PRD를 분석하여 실행 가능한 태스크 리스트와 의존성 그래프를 생성한다.

---

## 입력

- PRD 파일 (JSON 또는 Markdown)
- 프로젝트 기존 코드베이스 (있는 경우)

## 출력

- `.ai-auto/plan.json` — 태스크 리스트 + 의존성 그래프 (waves 구조)
- 아키텍처 설계 문서
- 규모 판정 (S/M/L)

---

## 실행 단계

### Step 1: PRD 읽기 및 분석

```
1. PRD 파일 로드
2. 핵심 요구사항 추출
   - 기능 요구사항 (functional requirements)
   - 비기능 요구사항 (non-functional requirements)
   - 제약 조건 (constraints)
3. 스토리 수 카운트 → 규모 판정
   - 1-3개: S (Small)
   - 4-8개: M (Medium)
   - 9개 이상: L (Large)
```

### Step 2: OpenSpec 스펙 생성

```bash
# OpenSpec으로 PRD에서 기술 스펙 자동 생성
/opsx:new <prd-path>

# 생성된 스펙 검토 및 보완
# - API 인터페이스 정의
# - 데이터 모델 정의
# - 상태 전이 다이어그램
```

### Step 3: planner 에이전트 호출

planner 에이전트가 태스크를 분해한다.

```
planner 에이전트 입력:
  - PRD 요약
  - OpenSpec 스펙
  - 기존 코드베이스 구조

planner 에이전트 출력:
  - 태스크 리스트 (각 태스크에 포함):
    - task_id (T-001 형식)
    - story_id (S1 형식)
    - title
    - description
    - complexity (S/M/L/XL)
    - depends_on: [task_id]
    - files: [수정 대상 파일]
    - acceptance_criteria: [완료 조건]
    - test_strategy
```

### Step 4: architect 에이전트 호출

architect 에이전트가 아키텍처를 설계한다.

```
architect 에이전트 입력:
  - PRD 요약
  - planner의 태스크 리스트
  - Clean Architecture 규칙 참조

architect 에이전트 출력:
  - 디렉토리 구조
  - 레이어 정의 (Domain, Application, Infrastructure, Presentation)
  - 모듈 간 의존성
  - 기술 스택 결정
  - 인터페이스(포트) 설계
```

### Step 5: 의존성 그래프 생성

```
태스크 간 의존성을 DAG(방향 비순환 그래프)로 구성:

Task A (독립) ─┐
               ├─→ Task D (A, B 의존)
Task B (독립) ─┘         │
                         ├─→ Task F (D, E 의존)
Task C (독립) ─→ Task E ─┘

병렬 실행 가능 웨이브:
  Wave 1: [A, B, C]  (독립, 병렬 가능)
  Wave 2: [D, E]     (Wave 1 완료 후, 병렬 가능)
  Wave 3: [F]        (Wave 2 완료 후)
```

### Step 6: Human Checkpoint (M/L 규모, S는 건너뜀)

```
출력 형식:
  ┌────────────────────────────────────┐
  │ [Phase 1 완료] 계획 확인 요청       │
  ├────────────────────────────────────┤
  │ 규모: M (5개 스토리)               │
  │ 태스크: 12개 (3개 그룹)            │
  │ 예상 복잡도: 중간                  │
  │                                    │
  │ 태스크 리스트:                     │
  │  1. [독립] 도메인 모델 정의        │
  │  2. [독립] API 스키마 정의         │
  │  3. [1→] 유스케이스 구현           │
  │  ...                               │
  │                                    │
  │ 아키텍처: Clean Architecture        │
  │ 디렉토리 구조: (첨부)              │
  │                                    │
  │ 계속 진행하시겠습니까? (Y/N)        │
  └────────────────────────────────────┘
```


### Step 7: 확인

Feature 브랜치는 `/ai-auto` Step 2.5에서 이미 생성되었으므로, 현재 브랜치가 `feature/*`인지만 확인합니다.

```bash
# 현재 브랜치가 feature/* 인지 확인
git branch --show-current | grep -q "^feature/" || echo "WARNING: feature 브랜치가 아닙니다"
```

---

## 에러 처리

| 상황 | 대응 |
|------|------|
| PRD 파일 없음 | 에러 메시지 + PRD 템플릿 생성 안내 |
| PRD 형식 오류 | 파싱 가능한 부분 추출 + 사용자 확인 요청 |
| 기존 코드와 충돌 | architect에게 마이그레이션 전략 요청 |
| 규모 판정 불확실 | 사용자에게 규모 확인 요청 |

---

## 산출물 형식

### .ai-auto/plan.json (예시)

```json
{
  "project": "my-project",
  "scale": "M",
  "created_at": "2026-02-23T10:00:00Z",
  "waves": [
    {
      "wave_id": 1,
      "tasks": [
        {
          "task_id": "T-001",
          "story_id": "S1",
          "title": "도메인 엔티티 정의",
          "description": "Order, OrderItem, Money 값 객체 생성",
          "files": ["src/domain/entities/order.py", "src/domain/value_objects/money.py"],
          "complexity": "M",
          "depends_on": [],
          "acceptance_criteria": ["Order 생성/검증 테스트 통과", "Money 값 객체 비교 테스트 통과"],
          "test_strategy": "단위 테스트: 엔티티 생성, 값 객체 비교, 비즈니스 로직"
        },
        {
          "task_id": "T-002",
          "story_id": "S1",
          "title": "API 스키마 정의",
          "description": "REST API 요청/응답 스키마",
          "files": ["src/presentation/api/schemas.py"],
          "complexity": "S",
          "depends_on": [],
          "acceptance_criteria": ["스키마 검증 테스트 통과"],
          "test_strategy": "단위 테스트: 스키마 직렬화/역직렬화"
        }
      ]
    },
    {
      "wave_id": 2,
      "tasks": [
        {
          "task_id": "T-003",
          "story_id": "S1",
          "title": "유스케이스 구현",
          "description": "CreateOrder, CancelOrder 유스케이스",
          "files": ["src/application/use_cases/create_order.py"],
          "complexity": "M",
          "depends_on": ["T-001"],
          "acceptance_criteria": ["주문 생성 유스케이스 테스트 통과"],
          "test_strategy": "단위 테스트 + 포트 mock"
        }
      ]
    }
  ],
  "total_tasks": 3,
  "total_waves": 2
}
```
