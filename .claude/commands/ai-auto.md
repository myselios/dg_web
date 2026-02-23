---
name: ai-auto
description: "AI Automation 메인 엔트리포인트. prd.json을 읽어 규모를 분석하고 6-Phase 파이프라인(PLAN -> TDD RED -> IMPLEMENT -> REFACTOR -> REVIEW & VERIFY -> DELIVER)을 오케스트레이션합니다."
---

# /ai-auto - AI Automation Pipeline Orchestrator

당신은 AI Automation 프레임워크의 메인 오케스트레이터입니다. `prd.json`을 기반으로 전체 개발 파이프라인을 자동으로 실행합니다.

---

## Step 1: PRD 로드 및 검증

현재 프로젝트 디렉토리에서 `prd.json`을 읽으세요.

```
필수 필드 검증:
- $schema: "ai_automation PRD v1" (필수)
- project_name: string (필수)
- goal: string (필수)
- tech_stack: object (필수)
  - language: string (필수)
  - framework: string (선택)
  - database: string (선택)
  - infrastructure: array (선택)
- stories: array (필수, 1개 이상)
  - 각 story: { id, title, description, acceptance_criteria[], priority, dependencies[] }
- non_functional: object (선택, 기본값 적용)
- scale_override: string|null (선택)
```

**prd.json이 없는 경우:**
1. 사용자에게 PRD 파일 경로를 요청
2. 경로가 제공되면 해당 파일을 로드
3. 파일이 없으면 대화형으로 최소 PRD를 생성하고 `prd.json`으로 저장

**검증 실패 시:**
- 누락된 필수 필드를 명시하고 사용자에게 수정을 요청
- 자동 수정 가능한 항목(빈 배열 초기화 등)은 경고 후 진행

---

## Step 2: 규모 분석 및 리소스 계획

스토리 수와 복잡도를 기반으로 프로젝트 규모를 분류합니다.

### 규모 분류 기준

| 규모 | 스토리 수 | 에이전트 수 | 최대 루프 | 특성 |
|------|-----------|-------------|-----------|------|
| **Small (S)** | 1-3 | 1 | 5 | 단일 에이전트 순차 실행 |
| **Medium (M)** | 4-8 | 3 | 15 | 3-에이전트 병렬 실행 |
| **Large (L)** | 9+ | 5+ | 25 | 5+ 에이전트 웨이브 병렬 실행 |

### 복잡도 조정 요소

다음 요소의 **해당 개수**에 따라 규모 내 리소스를 상향 조정합니다.
규모 자체(S→M→L)는 **스토리 수로만** 결정하며, 복잡도 조정은 규모 내 루프 수와 에이전트 수를 증가시킵니다.

- 외부 API 통합 3개 이상 → 루프 +3, 에이전트 +1
- DB 스키마 마이그레이션 포함 → 루프 +2
- 인증/권한 시스템 변경 → 루프 +2
- 실시간 처리(WebSocket, streaming) 포함 → 루프 +3, 에이전트 +1
- 다국어/i18n 요구사항 → 루프 +2

**예시:** M 규모(기본 3 에이전트, 15 루프) + 외부 API 3개 → 4 에이전트, 18 루프
**상한:** 에이전트는 규모 상한을 넘지 않음 (M: 최대 4, L: 최대 7)

### 출력 형식

```
[AI-AUTO] 규모 분석 결과
---
프로젝트: {project_name}
스토리 수: {count}
복잡도 조정: {있음/없음} ({조정 사유})
최종 규모: {S/M/L}
에이전트 수: {N}
최대 루프: {N}
---
```

**사용자에게 규모 분석 결과를 보고하고 계속 진행할지 확인합니다.**

---

## Step 2.5: 사전 환경 점검

파이프라인 실행 전에 필수 조건을 확인합니다.

### Git 초기화 확인

```
git rev-parse --git-dir 2>/dev/null
```

- git이 초기화되지 않은 경우 → `git init` 실행 후 초기 커밋 생성
- 이미 초기화된 경우 → 현재 브랜치 확인

### Feature 브랜치 생성

```bash
# main/master에서 직접 작업하지 않음
BRANCH_NAME="feature/$(echo ${project_name} | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"
git checkout -b "${BRANCH_NAME}"
```

### 플러그인 의존성 확인 (선택)

다음 플러그인이 설치되어 있으면 해당 기능을 활용합니다.
설치되지 않은 경우 **자체 구현으로 대체**합니다.

| 플러그인 | 사용처 | 미설치 시 대체 |
|----------|--------|----------------|
| OpenSpec | Phase 1, 6 | 자체 스펙 문서 생성/검증 |
| Superpowers | Phase 3 병렬 디스패치 | Task tool 병렬 실행 |
| TDD Workflows | Phase 2 | 자체 TDD 가이드 |

### .env 미완성 항목 확인

`.env` 파일에 `TODO_REPLACE` 값이 있는지 확인합니다.

```
TODO 항목이 있으면 사용자에게 알림:

"⚠️ .env에 아직 설정되지 않은 항목이 있습니다:
  - NEWS_API_KEY (라인 5)
  - TELEGRAM_BOT_TOKEN (라인 8)

이 항목은 mock을 사용하여 개발/테스트를 진행합니다.
해당 기능의 실제 연동 테스트는 키 입력 후 가능합니다.
계속 진행할까요?"
```

→ 파이프라인은 중단하지 않음 (mock으로 진행 가능)
→ Phase 5에서 TODO_REPLACE 항목을 WARN으로 보고

### 기술 스택 감지 및 도구 매핑

`prd.json`의 `tech_stack.language`를 기반으로 도구를 결정합니다.

```
tech_stack_tools = {
  "python": {
    "test": "pytest -q",
    "lint": "ruff check src/",
    "typecheck": "mypy src/",
    "formatter": "ruff format src/",
    "coverage": "pytest --cov=src --cov-report=term"
  },
  "typescript": {
    "test": "npm test",
    "lint": "npx eslint src/",
    "typecheck": "npx tsc --noEmit",
    "formatter": "npx prettier --write src/",
    "coverage": "npx jest --coverage"
  },
  "go": {
    "test": "go test ./...",
    "lint": "golangci-lint run",
    "typecheck": "go vet ./...",
    "formatter": "gofmt -w .",
    "coverage": "go test -coverprofile=coverage.out ./..."
  }
}
```

이 매핑은 Phase 2-5에서 테스트/린트/타입체크 명령으로 사용됩니다.

---

## Step 3: 6-Phase 파이프라인 실행

### Phase 1: PLAN (계획)

**OpenSpec이 설치되어 있으면 활용하고, 없으면 자체적으로 스펙을 생성합니다.**

1. `prd.json`의 스토리를 구현 가능한 태스크로 분해
2. 각 태스크에 대해:
   - 파일 변경 목록 (신규/수정)
   - 예상 복잡도 (S/M/L/XL)
   - 의존성 (depends_on: [task_id])
   - 완료 조건 (acceptance criteria)
3. 의존성 기반 DAG(Directed Acyclic Graph) 생성
4. 병렬 실행 가능한 웨이브(wave) 계산

**출력 아티팩트:** `.ai-auto/plan.json`

```json
{
  "project": "project_name",
  "scale": "M",
  "created_at": "ISO-8601",
  "waves": [
    {
      "wave_id": 1,
      "tasks": [
        {
          "task_id": "T-001",
          "story_id": "S1",
          "title": "태스크 제목",
          "files": ["src/module/file.py"],
          "complexity": "M",
          "depends_on": [],
          "acceptance_criteria": ["조건1", "조건2"]
        }
      ]
    }
  ],
  "total_tasks": 12,
  "total_waves": 4
}
```

**Large 규모인 경우:**
- 아키텍처 다이어그램을 생성하고 사용자 승인을 요청 (Human Checkpoint)
- 승인 받은 후에만 Phase 2로 진행

---

### Phase 2: TDD RED (테스트 먼저 작성)

각 태스크에 대해 실패하는 테스트를 먼저 작성합니다.

1. 태스크의 acceptance criteria를 테스트 케이스로 변환
2. 테스트 파일 생성 (`tests/` 디렉토리 구조 따름)
3. 테스트 실행하여 **모두 FAIL** 확인 (Red 상태)
4. 테스트가 이미 PASS하면 테스트가 너무 약한 것 -- 강화

**테스트 작성 규칙:**
- AAA 패턴 (Arrange-Act-Assert)
- 각 테스트 함수에 최소 1개 도메인 값 비교 assert 필수
- `assert True`, `pass`, `raise NotImplementedError` 금지
- 경계값 테스트 포함

**출력:**
```
[PHASE 2] TDD RED 완료
- 생성된 테스트 파일: {N}개
- 총 테스트 케이스: {N}개
- 모두 FAIL 확인: YES/NO
```

---

### Phase 3: IMPLEMENT (Ralph Loop - 구현)

**`superpowers:dispatching-parallel-agents`를 사용하여 병렬 구현합니다.**

#### Ralph Loop (반복 구현 사이클)

각 태스크에 대해 다음 루프를 반복합니다:

```
IMPLEMENT → TEST → (FAIL이면) ANALYZE → FIX → TEST → ...
```

- 최대 반복 횟수: 규모별 최대 루프 수 (S:5, M:15, L:25)
- 루프마다 진행 상황 보고

#### 에이전트 디스패치 전략

**Small (1 에이전트):**
- 순차적으로 웨이브별 태스크 실행

**Medium (3 에이전트):**
- 웨이브 내 태스크를 최대 3개씩 병렬 디스패치
- 각 에이전트는 독립적인 태스크를 담당
- `superpowers:dispatching-parallel-agents`로 병렬 실행

**Large (5+ 에이전트):**
- 웨이브 내 태스크를 최대 5개씩 병렬 디스패치
- 공유 자원 충돌 방지를 위한 파일 잠금 관리
- 진행 상황 대시보드 갱신

#### 에이전트 디스패치 형식

```
각 서브에이전트에게 전달할 컨텍스트:
- task_id, title, description
- 수정할 파일 목록
- 관련 테스트 파일 경로
- 의존하는 태스크의 완료된 코드 컨텍스트
- 프로젝트의 코딩 스타일/규칙
```

#### 루프 탈출 조건
- 모든 테스트 PASS → 성공, 다음 태스크로
- 최대 루프 초과 → 실패 기록, 사용자 에스컬레이션
- 동일 에러 3회 반복 → 접근 변경 또는 에스컬레이션

**출력:**
```
[PHASE 3] IMPLEMENT 완료
- 구현 완료: {N}/{total} 태스크
- 총 루프 수: {N}
- 테스트 통과율: {N}%
- 실패 태스크: {목록 또는 "없음"}
```

---

### Phase 4: REFACTOR (리팩토링)

구현 완료된 코드의 품질을 개선합니다.

1. **코드 품질 검사:**
   - 함수 길이 50줄 초과 여부
   - 파일 길이 800줄 초과 여부
   - 깊은 중첩 (4단계 초과) 여부
   - 뮤테이션 패턴 사용 여부
   - 하드코딩된 값 여부
   - console.log/print 디버그 문 여부

2. **자동 리팩토링:**
   - 긴 함수 분리
   - 공통 로직 추출
   - 네이밍 개선
   - 타입 정리

3. **리팩토링 후 전체 테스트 재실행:**
   - 모든 테스트가 여전히 PASS하는지 확인
   - 실패하면 리팩토링 롤백

**출력:**
```
[PHASE 4] REFACTOR 완료
- 리팩토링 항목: {N}개
- 테스트 재검증: PASS/FAIL
- 코드 품질 점수: {점수}/100
```

---

### Phase 5: REVIEW & VERIFY (검증)

**OpenSpec 통합 및 `/handoff-verify` 명령을 사용합니다.**

1. **정적 분석:**
   - 린트 실행 (프로젝트 린터 사용)
   - 타입 체크 (mypy/pyright/tsc 등)
   - 보안 스캔 (bandit/semgrep 등, 가능한 경우)

2. **테스트 검증:**
   - 전체 테스트 스위트 실행
   - 커버리지 확인 (새 코드 80% 이상 목표)

3. **Acceptance Criteria 검증:**
   - prd.json의 각 스토리별 acceptance_criteria와 구현 결과 대조
   - 미충족 항목 식별 및 보고

4. **보안 검사:**
   - 하드코딩된 시크릿 검색
   - 입력 검증 누락 확인
   - 위험한 패턴 탐지

**Critical Security Issue 발견 시:**
- 즉시 파이프라인 중단 (Human Checkpoint)
- 보안 이슈 상세 보고
- 사용자 확인 후에만 진행

**출력:**
```
[PHASE 5] REVIEW & VERIFY 완료
- 린트: PASS/FAIL ({N} issues)
- 타입 체크: PASS/FAIL ({N} errors)
- 테스트: PASS/FAIL ({passed}/{total})
- 커버리지: {N}%
- 보안: PASS/WARN/FAIL
- AC 충족: {N}/{total}
```

---

### Phase 6: DELIVER (전달)

**OpenSpec 통합을 사용합니다.**

1. **변경 사항 요약 생성:**
   - 구현된 스토리 목록
   - 주요 변경 파일 목록
   - 아키텍처 변경 사항

2. **커밋 및 PR 생성:**
   - `/commit-push-pr` 명령 호출
   - 구조화된 커밋 메시지 (conventional commits)
   - PR 본문에 스토리별 구현 내역 포함

3. **최종 보고서 생성:**

```
[AI-AUTO] 파이프라인 완료 보고서
========================================
프로젝트: {project_name}
규모: {S/M/L}
소요 시간: {시작} ~ {종료}

스토리 구현 현황:
  [x] S-001: {title} - 완료
  [x] S-002: {title} - 완료
  [ ] S-003: {title} - 미완료 (사유: ...)

품질 메트릭:
  테스트: {passed}/{total} PASS
  커버리지: {N}%
  린트: {N} issues
  보안: {상태}

PR: #{pr_number} - {pr_url}
========================================
```

4. **PR 머지는 사용자 확인 필수** (Human Checkpoint)

---

## Human Checkpoint 정리

| 체크포인트 | S | M | L | 설명 |
|------------|---|---|---|------|
| 계획 승인 | - | ✓ | ✓ | Phase 1 완료 후 태스크/아키텍처 승인 |
| 중간 검토 | - | - | ✓ | Phase 3 50% 시점 진행 상황 확인 |
| 최종 검증 | ✓ | ✓ | ✓ | Phase 5 완료 후 전체 검증 결과 승인 |
| 보안 이슈 | ✓ | ✓ | ✓ | Critical 보안 이슈 발견 시 즉시 중단 |
| PR 머지 | ✓ | ✓ | ✓ | Phase 6 PR 생성 후 머지 승인 |

**체크포인트에서 사용자 응답 대기:**
- 명확하게 현재 상태와 필요한 결정을 제시
- 선택지를 제공 (계속/수정/중단)
- 사용자 응답이 올 때까지 다음 단계 진행하지 않음

---

## 에러 처리 및 복구

### 파이프라인 실패 시

1. **Phase 실패:** 해당 Phase 재시도 (최대 2회)
2. **에이전트 실패:** 다른 접근법으로 재디스패치
3. **3회 연속 실패:** 사용자에게 에스컬레이션

### 상태 저장

각 Phase 완료 시 `.ai-auto/state.json`에 진행 상태 저장:

```json
{
  "current_phase": 3,
  "completed_phases": [1, 2],
  "completed_tasks": ["T-001", "T-002"],
  "failed_tasks": [],
  "last_updated": "ISO-8601"
}
```

**파이프라인 재시작 시:**
- `state.json`이 있으면 마지막 완료된 Phase 이후부터 재개
- 사용자에게 재개 지점 확인 후 진행

---

## 진행 상황 보고 형식

각 주요 단계에서 다음 형식으로 보고:

```
[AI-AUTO] Phase {N}/6: {Phase명}
진행: {current}/{total} ({percentage}%)
상태: {상세 메시지}
경과: {시간}
```

---

## 금지 사항

- prd.json에 없는 기능을 임의로 추가하지 않음
- Human Checkpoint를 건너뛰지 않음
- 테스트 없이 구현 코드를 커밋하지 않음
- 보안 경고를 무시하지 않음
- main/master 브랜치에 직접 커밋하지 않음
- .env 파일이나 시크릿을 커밋하지 않음
- 최대 루프 수를 초과하여 무한 반복하지 않음
