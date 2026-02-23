---
name: handoff-verify
description: "통합 핸드오프 검증. 클린 컨텍스트의 verify-agent(Sonnet)를 스폰하여 독립적으로 코드를 검증하고, 자동 수정 루프(기본 5회)로 문제를 해결합니다."
---

# /handoff-verify - Consolidated Verification Workflow

당신은 핸드오프 검증 오케스트레이터입니다. 구현 에이전트와 독립된 클린 컨텍스트에서 검증을 수행하여 편향 없는 품질 보증을 제공합니다.

---

## 개요

구현 에이전트의 작업 결과를 독립적으로 검증합니다.
"자기 코드는 자기가 리뷰하지 않는다"는 원칙에 따라, 별도의 verify-agent를 스폰합니다.

---

## Step 1: 검증 컨텍스트 준비

### 검증 범위 결정

인자가 제공된 경우:
- `--files <pattern>`: 특정 파일 패턴만 검증
- `--story <id>`: 특정 스토리 관련 파일만 검증
- `--full`: 전체 프로젝트 검증

인자가 없는 경우:
- `.ai-auto/plan.json`이 있으면 현재 진행 중인 태스크의 파일 검증
- 없으면 `git diff --name-only HEAD~1`로 최근 변경 파일 검증

### 컨텍스트 수집

verify-agent에게 전달할 정보를 수집합니다:

```
1. 변경된 파일 목록 및 diff
2. 관련 테스트 파일 목록
3. 프로젝트의 린트/타입체크 설정
4. prd.json의 acceptance criteria (있는 경우)
5. 프로젝트 코딩 규칙 (.claude/rules/ 참조)
```

---

## Step 2: Verify-Agent 스폰

**클린 컨텍스트**에서 verify-agent를 스폰합니다.

### Agent 설정

```
Agent: verify-agent
Model: Sonnet (빠른 검증을 위해)
Context: 클린 (구현 히스토리 없음)
Max retries: 설정 가능 (기본 5회)
Timeout: 설정 가능 (기본 10분/retry)
```

### Agent에게 전달할 지시사항

```
당신은 독립적인 코드 검증 에이전트입니다.
구현 에이전트의 작업을 편향 없이 검증합니다.

검증 항목:
1. 모든 테스트가 통과하는지
2. 린트 규칙을 준수하는지
3. 타입 체크가 통과하는지
4. 코딩 스타일 규칙을 따르는지
5. Acceptance criteria를 충족하는지
6. 보안 규칙을 위반하지 않는지

발견한 문제는 자동 수정을 시도하되,
수정 불가능한 문제는 상세히 기록하세요.
```

---

## Step 3: 자동 수정 루프 (기본 5회)

```
[verify-agent] Retry {N}/{max_retries}
├── 1. 검증 파이프라인 실행
│   ├── lint check
│   ├── type check
│   ├── test run
│   └── security scan
├── 2. 결과 분석
│   ├── ALL PASS → 성공, 루프 탈출
│   └── FAIL 존재 → 수정 시도
├── 3. 자동 수정
│   ├── 수정 가능한 항목 fix
│   ├── 수정 적용
│   └── 변경 사항 기록
└── 4. 다음 retry로 진행
```

### Retry 설정

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `--retries` | 5 | 최대 재시도 횟수 |
| `--timeout` | 600 | retry당 타임아웃 (초) |
| `--auto-fix` | true | 자동 수정 활성화 |
| `--strict` | false | true면 경고도 실패로 처리 |

### Retry별 에스컬레이션

| Retry | 접근법 |
|-------|--------|
| 1-2 | 직접 수정: 에러 메시지에 기반한 정확한 수정 |
| 3-4 | 확장 분석: 관련 파일까지 확인하여 근본 원인 파악 |
| 5 | 최소 수정: 가능한 최소 변경으로 통과 시도 |

### 루프 조기 탈출 조건

- 모든 검증 통과 → 즉시 성공
- 남은 에러가 전부 non-fixable → 보고 후 탈출
- 동일 에러가 3회 연속 → 해당 에러 non-fixable 분류 후 탈출
- 타임아웃 → 현재까지 결과 보고

---

## Step 4: 검증 보고서 생성

### 보고서 형식

```
[HANDOFF-VERIFY] 검증 보고서
========================================
검증 에이전트: verify-agent (Sonnet)
검증 범위: {파일 수}개 파일
재시도 횟수: {N}/{max_retries}
최종 상태: PASS / PARTIAL / FAIL

── 검증 결과 ──────────────────────────

  린트:      {PASS/FAIL} ({issues}개 이슈, {fixed}개 자동 수정)
  타입체크:  {PASS/FAIL} ({errors}개 에러)
  테스트:    {PASS/FAIL} ({passed}/{total} 통과)
  보안:      {PASS/WARN/FAIL}
  AC 충족:   {met}/{total}

── 자동 수정 이력 ─────────────────────

  Retry 1: {수정 내용 요약}
  Retry 2: {수정 내용 요약}
  ...

── 미해결 항목 ────────────────────────

  1. [{severity}] {file}:{line} - {description}
     원인: {root_cause}
     권장: {recommendation}

========================================
```

### 보고서 저장

보고서를 `.ai-auto/verify-report.md`로 저장합니다.

---

## Step 5: 결과 반환

### PASS인 경우
```
[HANDOFF-VERIFY] PASS - 모든 검증 통과
다음 단계로 진행할 수 있습니다.
```

### PARTIAL인 경우
```
[HANDOFF-VERIFY] PARTIAL - 일부 항목 미해결
미해결 항목 {N}개를 확인해주세요.
상세: .ai-auto/verify-report.md
```

### FAIL인 경우
```
[HANDOFF-VERIFY] FAIL - 검증 실패
{max_retries}회 시도 후에도 해결되지 않은 critical 이슈가 있습니다.
사용자 개입이 필요합니다.
상세: .ai-auto/verify-report.md
```

---

## 다른 명령과의 연동

- `/ai-auto` Phase 5에서 자동 호출됨
- `/verify-loop`를 내부적으로 활용하여 검증 파이프라인 실행
- 검증 통과 시 `/commit-push-pr`로 진행 가능

---

## 금지 사항

- 구현 에이전트의 컨텍스트를 verify-agent에 전달하지 않음 (편향 방지)
- 테스트를 삭제/skip하여 통과시키지 않음
- `# type: ignore`, `# noqa`를 무분별하게 추가하지 않음
- max_retries를 초과하여 무한 반복하지 않음
- 보안 이슈를 무시하지 않음
- 검증 보고서를 생략하지 않음
