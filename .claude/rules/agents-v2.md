# 에이전트 시스템 v2

## 11 에이전트 개요

| # | 에이전트 | 역할 | 자동 트리거 조건 |
|---|----------|------|-----------------|
| 1 | `planner` | 복잡한 기능 계획, 태스크 분해 | PRD 분석, 대규모 기능 설계 |
| 2 | `architect` | 아키텍처 설계, 기술 스택 결정 | 새 프로젝트, 구조 변경, 레이어 설계 |
| 3 | `tdd-guide` | TDD 워크플로우 안내, 테스트 전략 | 새 기능 구현 시작, 테스트 작성 |
| 4 | `code-reviewer` | 코드 품질, 패턴, 성능 리뷰 | PR 생성, 코드 완성 후 검증 |
| 5 | `security-reviewer` | 보안 취약점 분석 | 인증/권한 관련 코드, 외부 입력 처리 |
| 6 | `refactor-cleaner` | 코드 정리, 중복 제거, 패턴 적용 | REFACTOR 단계, 코드 품질 저하 감지 |
| 7 | `build-error-resolver` | 빌드/컴파일 에러 해결 | 빌드 실패, 타입 에러, 의존성 문제 |
| 8 | `doc-updater` | 문서 생성/업데이트 | 기능 완성 후, API 변경 후 |
| 9 | `verification-engine` | 8단계 검증 파이프라인 실행 | 최종 검증, 릴리스 전 체크 |
| 10 | `commit-push-pr` | 커밋, 푸시, PR 생성 자동화 | 코드 완성 + 검증 통과 후 |
| 11 | `context-manager` | 컨텍스트 관리, /compact, /clear | 3-5개 태스크 완료 시, 컨텍스트 비대화 |

---

## 자동 트리거 규칙

태스크 유형에 따라 에이전트가 자동으로 호출된다.

### 새 기능 개발 파이프라인

```
PRD 분석
  → planner (태스크 분해)
  → architect (구조 설계)
  → tdd-guide (테스트 전략)
  → [구현 루프]
  → refactor-cleaner (코드 정리)
  → code-reviewer + security-reviewer (병렬 리뷰)
  → verification-engine (최종 검증)
  → doc-updater (문서 갱신)
  → commit-push-pr (배포)
```

### 버그 수정 파이프라인

```
버그 리포트
  → tdd-guide (회귀 테스트 작성)
  → [수정 루프]
  → code-reviewer (리뷰)
  → verification-engine (검증)
  → commit-push-pr (배포)
```

### 리팩토링 파이프라인

```
리팩토링 대상 선정
  → architect (목표 구조 설계)
  → refactor-cleaner (실행)
  → code-reviewer (리뷰)
  → verification-engine (검증)
  → commit-push-pr (배포)
```

---

## 병렬화 규칙

### 병렬 실행 가능한 에이전트 조합

```
# 리뷰 단계 (독립적 관점)
code-reviewer + security-reviewer + architect  → 병렬

# 테스트 작성 (독립적 모듈)
tdd-guide(모듈A) + tdd-guide(모듈B)          → 병렬

# 문서 + 커밋 준비 (독립적 산출물)
doc-updater + commit-push-pr(준비)            → 병렬
```

### 순차 실행 필수

```
# 의존성 있는 단계
planner → architect → tdd-guide               → 순차
tdd-guide → 구현 → refactor-cleaner           → 순차
verification-engine → commit-push-pr           → 순차
```

---

## Subagent vs Agent Team 결정 매트릭스

두 가지 멀티 에이전트 패턴 중 태스크 특성에 따라 선택한다.

### Subagent 패턴 (독립 실행)

```
메인 에이전트
  ├── subagent-1 (독립 태스크 A)
  ├── subagent-2 (독립 태스크 B)
  └── subagent-3 (독립 태스크 C)
      → 결과 취합 → 메인 에이전트
```

**사용 조건:**

| 기준 | Subagent 적합 |
|------|--------------|
| 컨텍스트 공유 | 최소한 / 독립적 |
| 비용 | 낮음 (개별 작은 컨텍스트) |
| 태스크 유형 | 명확하게 분리 가능한 작업 |
| 커뮤니케이션 | 결과만 전달 (단방향) |
| 실패 격리 | 한 subagent 실패가 다른 것에 영향 없음 |

**예시:**
- 독립적인 모듈별 테스트 작성
- 파일별 코드 리뷰
- 독립적인 문서 섹션 작성

### Agent Team 패턴 (협업 실행)

```
허브 에이전트 (조율)
  ↔ 에이전트 A (관점 1)
  ↔ 에이전트 B (관점 2)
  ↔ 에이전트 C (관점 3)
      → 토론/합의 → 통합 결과
```

**사용 조건:**

| 기준 | Agent Team 적합 |
|------|----------------|
| 컨텍스트 공유 | 많음 / 공유 필요 |
| 비용 | 높음 (공유 컨텍스트) |
| 태스크 유형 | 다각적 분석, 의사결정 |
| 커뮤니케이션 | 양방향 토론 필요 |
| 품질 | 다중 관점이 품질을 높이는 경우 |

**예시:**
- 아키텍처 설계 (architect + security-reviewer + planner)
- 복잡한 버그 분석 (여러 관점에서 원인 추론)
- 기술 스택 결정 (성능, 보안, 유지보수성 관점)

### 결정 플로우차트

```
태스크를 받았을 때:

1. 태스크를 독립 단위로 분리할 수 있는가?
   ├── YES → 분리된 단위 간 커뮤니케이션이 필요한가?
   │         ├── NO  → Subagent 패턴
   │         └── YES → Agent Team 패턴
   └── NO  → 단일 에이전트로 처리

2. 비용 제약이 있는가?
   ├── YES → Subagent 패턴 우선
   └── NO  → 품질 우선 → Agent Team 패턴

3. 실시간 피드백이 필요한가?
   ├── YES → Agent Team 패턴
   └── NO  → Subagent 패턴
```

---

## context-manager 운영 규칙

```
3-5개 태스크 완료 → /compact
/compact 3회 누적  → /clear → 새 세션

패턴:
  작업 → /compact → 작업 → /compact → 작업 → /compact → /clear
```

- 각 /compact 시 핵심 결정사항과 진행 상태를 메모리에 저장
- /clear 전 현재 진행 상황 요약을 저장
- 새 세션 시작 시 저장된 상태 복원
