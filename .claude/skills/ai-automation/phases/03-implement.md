# Phase 3: IMPLEMENT (구현 - Ralph Loop)

## 목적

Ralph Loop를 실행하여 Phase 2에서 작성한 실패 테스트를 통과하는 구현을 완성한다.
테스트가 모두 통과할 때까지 반복하며, 독립 모듈은 병렬로 구현한다.

---

## 입력

- Phase 1의 .ai-auto/plan.json (waves 구조)
- Phase 2의 실패 테스트 스위트
- 아키텍처 설계 문서

## 출력

- 모든 테스트를 통과하는 구현 코드
- Ralph Loop 실행 로그 (work-log)

---

## Ralph Loop 실행 흐름

### 단일 태스크 Ralph Loop

```
┌─────────────────────────────────────┐
│         Ralph Loop (태스크 T)        │
│                                     │
│  iteration = 0                      │
│  while iteration < max_iterations:  │
│    │                                │
│    ├── 1. 실패 테스트 확인          │
│    │   pytest -q -x tests/T/        │
│    │                                │
│    ├── 2. 실패 원인 분석            │
│    │   에러 메시지, 스택 트레이스    │
│    │                                │
│    ├── 3. 구현/수정                 │
│    │   claude -p "구현 프롬프트"     │
│    │                                │
│    ├── 4. 전체 테스트 실행          │
│    │   pytest -q                    │
│    │                                │
│    ├── 5. 결과 기록                 │
│    │   → work-log/ralph-loop.jsonl  │
│    │                                │
│    └── 6. 판정                      │
│        ├── 전체 통과 → EXIT (성공)  │
│        ├── 빌드 에러 → build-error-resolver │
│        ├── 동일 실패 3회 → 에스컬레이션 │
│        └── 진전 있음 → 다음 iteration │
│                                     │
│  max_iterations 도달 → 에스컬레이션  │
└─────────────────────────────────────┘
```

### Ralph Loop 스크립트 호출

```bash
# 태스크별 Ralph Loop 실행
./scripts/ralph-loop.sh 10 prompts/T001.txt

# 또는 직접 claude 호출
claude --dangerously-skip-permissions -p "
태스크 T001 구현:
- 테스트 파일: tests/unit/domain/test_order.py
- 구현 대상: src/domain/entities/order.py
- 규칙: coding-style.md, clean-architecture.md 준수
- 목표: 모든 테스트 통과
"
```

---

## 의존성 그래프 기반 실행 순서

### 순차 실행 (의존성 있는 태스크)

```
T001 (도메인 모델)
  → T001 완료 확인
  → T003 (유스케이스 - T001 의존)
    → T003 완료 확인
    → T005 (API 엔드포인트 - T003 의존)
```

### 병렬 실행 (독립 태스크)

```
# Group 1: 독립 태스크 병렬
await asyncio.gather(
    ralph_loop("T001"),  # 도메인 모델
    ralph_loop("T002"),  # API 스키마
)

# Group 2: Group 1 완료 후 병렬
await asyncio.gather(
    ralph_loop("T003"),  # 유스케이스 (T001 의존)
    ralph_loop("T004"),  # 리포지토리 (T002 의존)
)
```

---

## Sub-agent 병렬 디스패치

### M 규모

```
독립 모듈별 subagent 생성:

subagent-1: ralph_loop(T001) → T001 구현 완료
subagent-2: ralph_loop(T002) → T002 구현 완료
  ↓ (취합)
메인 에이전트: 통합 테스트 실행
  ↓
subagent-3: ralph_loop(T003)
subagent-4: ralph_loop(T004)
```

### L 규모

```
모듈 팀별 subagent 그룹:

team-주문: [subagent-1, subagent-2] → 주문 모듈 전체 구현
team-결제: [subagent-3, subagent-4] → 결제 모듈 전체 구현
team-알림: [subagent-5]             → 알림 모듈 구현
  ↓ (취합)
메인 에이전트: 통합 테스트 + 충돌 해결
```

---

## 빌드 에러 처리

### build-error-resolver 호출 조건

```
Ralph Loop iteration에서 다음 에러 발생 시:
  - ImportError / ModuleNotFoundError
  - SyntaxError
  - TypeError (타입 불일치)
  - 의존성 설치 실패
  - Docker 빌드 실패

→ build-error-resolver 에이전트 자동 호출
```

### build-error-resolver 동작

```
1. 에러 메시지 분석
2. 원인 분류:
   - 의존성 누락 → pip install / npm install
   - 임포트 경로 오류 → 경로 수정
   - 타입 불일치 → 타입 수정
   - 설정 오류 → 설정 파일 수정
3. 수정 적용
4. 빌드 재시도
5. 실패 시 메인 에이전트에 보고
```

---

## 3회 실패 프로토콜

동일한 테스트가 3회 연속 같은 이유로 실패하면:

```
1회차: 에러 분석 → 타겟 수정
2회차: 접근 방식 변경 (다른 알고리즘, 다른 구조)
3회차: 가정 재검토 (테스트가 잘못되었을 가능성 포함)

3회 초과:
  → 에스컬레이션 보고 생성
  → 사용자에게 통보
  → 해당 태스크 일시 중단
  → 다른 독립 태스크로 진행
```

---

## 진행 기록 (Work Log)

각 Ralph Loop iteration을 기록한다.

```jsonl
{"timestamp": "2026-02-23T10:00:00Z", "task": "T001", "iteration": 1, "tests_total": 5, "tests_passed": 2, "tests_failed": 3, "status": "in_progress"}
{"timestamp": "2026-02-23T10:05:00Z", "task": "T001", "iteration": 2, "tests_total": 5, "tests_passed": 4, "tests_failed": 1, "status": "in_progress"}
{"timestamp": "2026-02-23T10:08:00Z", "task": "T001", "iteration": 3, "tests_total": 5, "tests_passed": 5, "tests_failed": 0, "status": "completed"}
```

---

## L 규모 Human Checkpoint (50% 시점)

```
전체 태스크의 50%가 완료되면:

┌────────────────────────────────────┐
│ [Phase 3 중간 검토] 확인 요청       │
├────────────────────────────────────┤
│ 진행률: 6/12 태스크 완료           │
│ 평균 iteration: 3.2회             │
│                                    │
│ 완료 태스크:                       │
│  ✓ T001: 도메인 모델 (2회)        │
│  ✓ T002: API 스키마 (1회)         │
│  ...                               │
│                                    │
│ 이슈:                              │
│  ⚠ T005: 3회 실패 (에스컬레이션)  │
│                                    │
│ 계속 진행하시겠습니까? (Y/N)        │
└────────────────────────────────────┘
```

---

## 체크리스트

Phase 3 완료 전 확인:

- [ ] 모든 태스크의 테스트가 통과하는가
- [ ] Ralph Loop 로그가 기록되었는가
- [ ] 에스컬레이션된 태스크가 해결되었는가
- [ ] 빌드 에러가 모두 해결되었는가
- [ ] 통합 테스트가 통과하는가 (모듈 간 연동)
- [ ] 커버리지 80% 이상인가
