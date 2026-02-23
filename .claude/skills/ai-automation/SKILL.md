# ai-automation 스킬

## 정의

- **name**: ai-automation
- **description**: PRD 기반 자동 개발 파이프라인. PRD를 입력받아 계획 → 테스트 작성 → 구현 → 리팩토링 → 검증 → 배포까지 6단계를 자동 오케스트레이션한다.

---

## 6단계 오케스트레이션 흐름

```
Phase 1: PLAN        PRD 분석 → 스펙 생성 → 태스크 분해
Phase 2: TDD-RED     태스크별 실패 테스트 작성
Phase 3: IMPLEMENT   Ralph Loop로 구현 (테스트 통과까지)
Phase 4: REFACTOR    코드 정리, Clean Architecture 적용
Phase 5: REVIEW      병렬 리뷰 + 8단계 검증
Phase 6: DELIVER     문서 갱신 → 커밋 → PR → 아카이브
```

### 전체 흐름도

```
PRD (입력)
  │
  ▼
┌─────────────────────────────────────┐
│ Phase 1: PLAN                       │
│  planner + architect 에이전트       │
│  OpenSpec /opsx:new                 │
│  → 태스크 리스트 + 의존성 그래프    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Phase 2: TDD-RED                    │
│  tdd-guide 에이전트                 │
│  독립 모듈: 병렬 테스트 작성        │
│  → 실패하는 테스트 스위트           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Phase 3: IMPLEMENT                  │
│  Ralph Loop (최대 N회 반복)         │
│  build-error-resolver (실패 시)     │
│  → 테스트 통과하는 구현             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Phase 4: REFACTOR                   │
│  refactor-cleaner 에이전트          │
│  clean-architecture 규칙 적용       │
│  coding-style 준수 확인             │
│  → 정리된 코드                      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Phase 5: REVIEW                     │
│  code-reviewer ┐                    │
│  security-reviewer ├─ 병렬 실행     │
│  architect ┘                        │
│  verification-engine (8단계)        │
│  → 검증 완료 보고서                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Phase 6: DELIVER                    │
│  doc-updater → 문서 갱신            │
│  commit-push-pr → 배포              │
│  OpenSpec /opsx:verify → 검증       │
│  OpenSpec /opsx:archive → 완료      │
│  → PR URL + 아카이브                │
└─────────────────────────────────────┘
```

---

## 규모 감지 로직 (Scale Detection)

PRD의 스토리(태스크) 수에 따라 실행 전략을 결정한다.

| 규모 | 스토리 수 | 전략 |
|------|----------|------|
| **S (Small)** | 1-3개 | 순차 실행, 단일 에이전트 |
| **M (Medium)** | 4-8개 | 모듈별 병렬화, subagent 패턴 |
| **L (Large)** | 9개 이상 | 팀 기반 병렬화, agent team 패턴 |

### S (Small) 전략

```
모든 단계를 단일 에이전트가 순차 실행
Ralph Loop 최대 5회
Human checkpoint: Phase 5 검증 후, Phase 6 PR 머지 시
```

### M (Medium) 전략

```
Phase 2: 독립 모듈별 tdd-guide subagent 병렬 실행
Phase 3: 독립 모듈별 Ralph Loop 병렬 실행 (최대 3 에이전트)
Phase 5: 3개 리뷰어 병렬 실행
Ralph Loop 최대 15회
Human checkpoint: Phase 1 계획 확정 후, Phase 5 검증 후, Phase 6 PR 머지 시
```

### L (Large) 전략

```
Phase 1: planner + architect agent team (협업 설계)
Phase 2-3: 모듈 그룹별 subagent 팀 병렬 실행 (최대 5+ 에이전트)
Phase 5: 전체 agent team 리뷰
Ralph Loop 최대 25회
Human checkpoint: Phase 1 아키텍처, Phase 3 중간 검토, Phase 5 검증, Phase 6 PR 머지
```

---

## 통합 포인트

### OpenSpec 통합

```bash
# Phase 1: 스펙 생성
/opsx:new <prd-path>        # PRD에서 스펙 자동 생성

# Phase 6: 검증 및 아카이브
/opsx:verify <spec-path>    # 구현이 스펙을 충족하는지 검증
/opsx:archive <spec-path>   # 완료된 스펙 아카이브
```

### Superpowers 통합

```bash
# 확장 도구 활용
superpowers:brainstorming                 # Phase 1 설계 브레인스토밍
superpowers:dispatching-parallel-agents   # Phase 3 병렬 구현
superpowers:test-driven-development       # Phase 2 TDD 가이드
superpowers:requesting-code-review        # Phase 5 코드 리뷰
superpowers:verification-before-completion # Phase 5 최종 검증
superpowers:finishing-a-development-branch # Phase 6 브랜치 완료
```

### TDD Workflows 통합

```bash
# TDD 자동화
tdd-workflows:red           # 실패 테스트 자동 생성
tdd-workflows:green         # 최소 구현 가이드
tdd-workflows:refactor      # 리팩토링 가이드
```

---

## Ralph Loop 설정

Ralph Loop는 테스트가 통과할 때까지 구현을 반복하는 핵심 메커니즘이다.

```yaml
ralph_loop:
  # 규모별 최대 반복 횟수
  max_iterations:
    S: 5
    M: 15
    L: 25

  # 반복마다 실행하는 단계
  iteration_steps:
    1. 현재 실패 테스트 확인
    2. 실패 원인 분석
    3. 구현/수정
    4. 전체 테스트 실행
    5. 결과 기록 (work-log)

  # 종료 조건
  exit_conditions:
    - all_tests_pass         # 모든 테스트 통과
    - max_iterations_reached # 최대 반복 도달 → 에스컬레이션
    - critical_error         # 복구 불가 에러 → 에스컬레이션

  # 실패 시 에스컬레이션
  escalation:
    - build-error-resolver 호출 (빌드 에러)
    - 3회 동일 실패 시 사용자에게 보고
```

---

## Sub-agent 병렬 디스패치 규칙

### 디스패치 조건

```python
# 의사 코드: 병렬 디스패치 결정
def should_parallelize(tasks: list[Task]) -> bool:
    # 1. 태스크 간 의존성 확인
    independent_groups = find_independent_groups(tasks)

    # 2. 2개 이상의 독립 그룹이 있으면 병렬화
    return len(independent_groups) >= 2

def dispatch(tasks: list[Task], scale: str):
    groups = find_independent_groups(tasks)

    if scale == "S" or len(groups) < 2:
        # 순차 실행
        for task in tasks:
            execute_sequential(task)
    else:
        # 독립 그룹별 병렬 실행
        await asyncio.gather(
            *[execute_group(group) for group in groups]
        )
```

### 병렬 디스패치 안전 규칙

1. **같은 파일을 수정하는 태스크는 병렬화 금지** (충돌 방지)
2. **의존성이 있는 태스크는 순차 실행** (의존성 그래프 준수)
3. **각 subagent에 명확한 스코프 할당** (중복 작업 방지)
4. **결과 취합 시 충돌 검사** (merge conflict 감지)

---

## Human Checkpoint 정의

자동화 중 사람의 확인이 필요한 지점을 정의한다.

| 체크포인트 | S | M | L | 확인 내용 |
|-----------|---|---|---|----------|
| **계획 승인** | - | ✓ | ✓ | 태스크 분해, 아키텍처, 우선순위 |
| **중간 검토** | - | - | ✓ | Phase 3 50% 시점 구현 방향 확인 |
| **최종 검증** | ✓ | ✓ | ✓ | 전체 검증 결과 승인 |
| **보안 이슈** | ✓ | ✓ | ✓ | Critical 보안 이슈 발견 시 즉시 |
| **PR 머지** | ✓ | ✓ | ✓ | Phase 6 PR 머지 승인 |

### 체크포인트 동작

```
1. 현재 진행 상황 요약 출력
2. 주요 결정 사항 나열
3. 리스크/이슈 보고
4. 사용자 승인 대기
5. 승인 → 다음 단계 진행
   거부 → 피드백 반영 후 해당 단계 재실행
```

---

## 실행 명령

```bash
# PRD 파일로 전체 파이프라인 실행
claude -p "ai-automation 스킬을 사용하여 prd.json을 구현해주세요"

# 특정 Phase부터 시작
claude -p "ai-automation Phase 3부터 재개: 태스크 리스트는 .ai-auto/plan.json 참조"

# Ralph Loop 단독 실행
./scripts/ralph-loop.sh 10 prompt.txt
```
