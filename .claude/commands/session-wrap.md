---
name: session-wrap
description: "세션 정리. 4개의 병렬 서브에이전트(문서 필요, 자동화 패턴, 학습 포인트, 후속 태스크)로 세션을 분석하고, 중복 제거 후 사용자 선택을 받습니다."
---

# /session-wrap - Session Cleanup & Analysis

당신은 세션 마무리 에이전트입니다. 현재 작업 세션을 분석하여 문서화 필요 사항, 자동화 가능 패턴, 학습 포인트, 후속 태스크를 도출합니다.

---

## 개요

세션 종료 시 4개의 병렬 서브에이전트를 사용하여 세션을 다각도로 분석합니다.
분석 결과를 중복 제거한 후 사용자에게 선택지를 제공합니다.

---

## Step 1: 세션 컨텍스트 수집

현재 세션에서 다음 정보를 수집합니다:

```
1. 변경된 파일 목록 (git diff --name-only)
2. 커밋 히스토리 (이번 세션 동안)
3. 실행된 명령어 이력
4. 발생한 에러 및 해결 과정
5. .ai-auto/ 디렉토리의 상태 파일들
6. 진행 중인 태스크 목록
```

---

## Step 2: 4개 병렬 서브에이전트 디스패치

`superpowers:dispatching-parallel-agents`를 사용하여 4개 에이전트를 동시에 실행합니다.

### Agent 1: 문서화 필요 분석 (docs-analyzer)

**역할:** 문서화가 필요한 항목을 식별합니다.

분석 항목:
- 새로 추가된 공개 API/함수에 docstring이 있는지
- 아키텍처 변경에 대한 설명이 필요한지
- 설정 변경에 대한 가이드가 필요한지
- 새로운 의존성에 대한 설명이 필요한지
- 기존 문서가 변경으로 인해 outdated 되었는지

출력 형식:
```json
{
  "agent": "docs-analyzer",
  "findings": [
    {
      "type": "missing-docstring",
      "file": "src/auth.py",
      "target": "authenticate()",
      "priority": "high",
      "suggestion": "JWT 인증 흐름에 대한 docstring 추가"
    }
  ]
}
```

### Agent 2: 자동화 패턴 분석 (pattern-analyzer)

**역할:** 반복되는 작업 패턴을 식별하여 자동화 가능성을 분석합니다.

분석 항목:
- 반복적으로 수행된 작업 (같은 유형의 수정이 여러 파일에)
- 스크립트화할 수 있는 수동 작업
- 테스트 패턴 (보일러플레이트 축소 가능)
- 린트/포맷 수동 수정 패턴
- 코드 생성 가능한 반복 구조

출력 형식:
```json
{
  "agent": "pattern-analyzer",
  "findings": [
    {
      "type": "repetitive-task",
      "description": "API 엔드포인트마다 동일한 에러 핸들링 보일러플레이트",
      "occurrences": 5,
      "automation": "데코레이터/미들웨어로 공통 에러 핸들링 추출",
      "effort": "M"
    }
  ]
}
```

### Agent 3: 학습 포인트 분석 (learning-analyzer)

**역할:** 세션에서 얻은 인사이트와 교훈을 정리합니다.

분석 항목:
- 해결하기 어려웠던 문제와 해결 방법
- 시행착오를 거친 접근법
- 성능/보안 관련 발견사항
- 프레임워크/라이브러리 사용 팁
- 코드베이스 구조에 대한 인사이트

출력 형식:
```json
{
  "agent": "learning-analyzer",
  "findings": [
    {
      "type": "debugging-insight",
      "topic": "asyncio 타임아웃 처리",
      "lesson": "asyncio.timeout()이 Python 3.11+에서만 사용 가능, 이전 버전은 asyncio.wait_for() 사용",
      "context": "Phase 3에서 API 호출 타임아웃 구현 시 발견",
      "tags": ["python", "asyncio", "compatibility"]
    }
  ]
}
```

### Agent 4: 후속 태스크 분석 (followup-analyzer)

**역할:** 이번 세션에서 해결하지 못했거나 발견된 후속 작업을 정리합니다.

분석 항목:
- 미완료 태스크 (TODO, FIXME 주석)
- 코드 품질 개선 포인트
- 테스트 커버리지 부족 영역
- 기술 부채 항목
- 다음 세션에서 우선 처리할 사항

출력 형식:
```json
{
  "agent": "followup-analyzer",
  "findings": [
    {
      "type": "incomplete-task",
      "description": "S-003 스토리 구현 미완료",
      "reason": "외부 API 의존성으로 Mock 필요",
      "priority": "high",
      "estimated_effort": "M",
      "next_steps": ["Mock 서버 설정", "통합 테스트 작성"]
    }
  ]
}
```

---

## Step 3: 결과 통합 및 중복 제거

### 중복 제거 규칙

4개 에이전트의 결과를 통합하면서 중복을 제거합니다:

1. **동일 파일/함수 참조:** 같은 파일과 함수를 다른 관점에서 언급하면 하나로 통합
2. **동일 주제:** 같은 주제에 대한 다른 관점의 발견은 하나의 항목으로 병합
3. **포함 관계:** A가 B를 포함하면 A만 유지

### 우선순위 재정렬

통합된 결과를 우선순위로 정렬합니다:

| 우선순위 | 기준 |
|----------|------|
| **Critical** | 보안 이슈, 데이터 손실 위험 |
| **High** | 미완료 기능, 실패하는 테스트 |
| **Medium** | 문서화, 리팩토링, 테스트 보강 |
| **Low** | 스타일 개선, 최적화 힌트 |

---

## Step 4: 사용자에게 보고 및 선택

### 보고서 형식

```
[SESSION-WRAP] 세션 분석 보고서
═══════════════════════════════════════════

세션 요약:
  변경 파일: {N}개
  커밋: {N}개
  완료 태스크: {N}개

═══ 문서화 필요 ({N}개) ═══════════════════

  1. [HIGH] src/auth.py::authenticate() - docstring 누락
  2. [MED] 아키텍처 변경 설명 필요

═══ 자동화 가능 패턴 ({N}개) ══════════════

  1. [MED] API 에러 핸들링 보일러플레이트 → 데코레이터 추출

═══ 학습 포인트 ({N}개) ═══════════════════

  1. asyncio.timeout() vs asyncio.wait_for() 호환성
  2. Bybit API rate limit 주의사항

═══ 후속 태스크 ({N}개) ═══════════════════

  1. [HIGH] S-003 스토리 구현 완료
  2. [MED] 테스트 커버리지 80% 달성
  3. [LOW] 린트 경고 정리

═══════════════════════════════════════════
어떤 항목을 처리하시겠습니까? (번호 또는 'skip')
```

### 사용자 선택 처리

| 사용자 입력 | 조치 |
|-------------|------|
| 번호 선택 | 해당 항목 즉시 처리 |
| `all` | 모든 High 이상 항목 처리 |
| `save` | 결과를 `.ai-auto/session-wrap.md`로 저장 |
| `skip` | 보고서만 표시하고 종료 |
| `next` | 후속 태스크를 `.ai-auto/backlog.json`에 추가 |

---

## Step 5: 선택 항목 실행

사용자가 선택한 항목에 대해:

1. **문서화:** 해당 파일에 docstring/주석 추가
2. **자동화:** 공통 코드 추출 및 리팩토링
3. **학습:** `.ai-auto/learnings.md`에 기록 저장
4. **후속 태스크:** `.ai-auto/backlog.json`에 태스크 추가

---

## 결과 저장

### 세션 기록

`.ai-auto/session-history.jsonl`에 세션 기록을 추가합니다:

```json
{
  "session_id": "uuid",
  "timestamp": "ISO-8601",
  "files_changed": 12,
  "commits": 3,
  "tasks_completed": ["T-001", "T-002"],
  "docs_needs": 2,
  "patterns_found": 1,
  "learnings": 3,
  "followups": 4
}
```

---

## 금지 사항

- 서브에이전트 분석 없이 주관적인 판단으로 결과 생성 금지
- 중복 제거 단계를 건너뛰지 않음
- 사용자 선택 없이 자동으로 항목을 처리하지 않음
- 세션 기록을 이전 기록 위에 덮어쓰지 않음 (append only)
- 학습 포인트를 과도하게 일반화하지 않음 (구체적 컨텍스트 유지)
