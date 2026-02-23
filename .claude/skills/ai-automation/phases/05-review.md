# Phase 5: REVIEW (검증)

## 목적

리팩토링된 코드를 다각적으로 검증한다.
병렬 리뷰(코드/보안/아키텍처)와 8단계 검증 엔진을 실행하여 배포 가능한 품질을 확인한다.

---

## 입력

- Phase 4에서 리팩토링된 코드
- 통과하는 테스트 스위트
- 아키텍처 설계 문서
- 규칙 파일들 (coding-style, security, clean-architecture, performance)

## 출력

- 리뷰 결과 보고서 (각 리뷰어별)
- 검증 엔진 8단계 결과
- 배포 승인/거부 판정

---

## 실행 단계

### Step 1: 병렬 리뷰 (3개 에이전트 동시 실행)

```
┌─────────────────────────────────────────────┐
│              병렬 리뷰 실행                   │
│                                             │
│  code-reviewer ──────→ 코드 품질 리포트      │
│  security-reviewer ──→ 보안 리포트           │
│  architect ──────────→ 아키텍처 리포트        │
│                                             │
│  (3개 에이전트 동시 실행, 독립적 관점)        │
└─────────────────────────────────────────────┘
```

#### code-reviewer 에이전트

```
검토 항목:
  1. 코딩 스타일 준수 (coding-style.md)
     - 불변성 패턴
     - 함수/파일 크기
     - 중첩 깊이
     - 네이밍 규칙

  2. 코드 품질
     - DRY (중복 없음)
     - SOLID 원칙
     - 에러 처리 적절성
     - 엣지 케이스 처리

  3. 성능 (performance.md)
     - O(n^2) 이상 알고리즘
     - 불필요한 API 호출
     - 메모리 누수 가능성

출력: 이슈 목록 (severity: critical/high/medium/low)
```

#### security-reviewer 에이전트

```
검토 항목 (security.md 8대 검사):
  1. 하드코딩된 시크릿
  2. 입력 검증 누락
  3. SQL 인젝션 취약점
  4. XSS 취약점
  5. CSRF 보호 누락
  6. 접근 제어 누락
  7. Rate limiting 누락
  8. 에러 응답 정보 노출

출력: 취약점 목록 (severity: critical/high/medium/low)
```

#### architect 에이전트

```
검토 항목 (clean-architecture.md):
  1. 레이어 분리 올바른가
  2. 의존성 방향 준수
  3. Domain 순수성
  4. 포트/어댑터 패턴 적용
  5. 디렉토리 구조 일관성
  6. 모듈 간 결합도

출력: 아키텍처 이슈 목록 (severity: critical/high/medium/low)
```

### Step 2: 리뷰 결과 취합 및 분류

```
severity 분류:
  CRITICAL → 즉시 수정 필수 (배포 차단)
  HIGH     → 수정 권장 (배포 전 수정)
  MEDIUM   → 개선 권장 (다음 이터레이션에서)
  LOW      → 참고 사항

배포 판정:
  CRITICAL 이슈 있음 → 수정 후 재검증
  HIGH 이슈만 있음   → 수정 후 재검증
  MEDIUM 이하만 있음 → 배포 승인
```

### Step 3: verification-engine 실행 (8단계)

```
┌─────────────────────────────────────────────┐
│         Verification Engine (8단계)          │
├─────────────────────────────────────────────┤
│                                             │
│  Stage 1: 단위 테스트                        │
│    pytest -q tests/unit/                    │
│    → PASS/FAIL                              │
│                                             │
│  Stage 2: 통합 테스트                        │
│    pytest -q tests/integration/             │
│    → PASS/FAIL                              │
│                                             │
│  Stage 3: 커버리지 검사                      │
│    pytest --cov=src --cov-fail-under=80     │
│    → 80% 이상 확인                           │
│                                             │
│  Stage 4: 린트 검사                          │
│    tech_stack_tools.lint 실행               │
│    (Python: ruff, TS: eslint, Go: golangci) │
│    → 위반 없음 확인                          │
│                                             │
│  Stage 5: 타입 검사                          │
│    tech_stack_tools.typecheck 실행          │
│    (Python: mypy, TS: tsc, Go: go vet)     │
│    → 타입 에러 없음 확인                     │
│                                             │
│  Stage 6: 보안 검사                          │
│    시크릿 스캔 (하드코딩된 키/토큰)          │
│    의존성 취약점 스캔                        │
│    → 취약점 없음 확인                        │
│                                             │
│  Stage 7: 빌드 검사                          │
│    docker build (해당 시)                   │
│    패키지 빌드                               │
│    → 빌드 성공 확인                          │
│                                             │
│  Stage 8: TODO_REPLACE 점검                  │
│    .env 내 TODO_REPLACE 플레이스홀더 스캔    │
│    → 항목 있으면 WARN (배포 차단 아님)       │
│    → 보고서에 미완성 키 목록 포함            │
│                                             │
├─────────────────────────────────────────────┤
│  결과: 8/8 PASS → 검증 통과                  │
│        FAIL → 수정 필요 (WARN은 배포 차단 아님)│
└─────────────────────────────────────────────┘
```

### Step 4: verify-loop (실패 시 재시도)

검증 실패 시 최대 3회 재시도한다.

```
retry = 0
while retry < 3:
    리뷰 이슈 수정
    verification-engine 재실행

    if 모든 단계 PASS:
        break
    retry += 1

if retry >= 3:
    에스컬레이션 → 사용자에게 보고
    상세 실패 내역 제공
```

#### 재시도 전략

```
1회차 재시도:
  - CRITICAL/HIGH 이슈만 수정
  - 해당 Stage만 재실행

2회차 재시도:
  - 접근 방식 변경
  - 관련 테스트 보강
  - 전체 Stage 재실행

3회차 재시도:
  - 가정 재검토
  - 아키텍처 수준 변경 고려
  - 전체 재실행
```

### Step 5: Human Checkpoint (최종 검증)

```
┌────────────────────────────────────────────┐
│ [Phase 5 완료] 최종 검증 결과               │
├────────────────────────────────────────────┤
│                                            │
│ 리뷰 결과:                                 │
│  code-reviewer:     2 medium, 1 low        │
│  security-reviewer: 0 issues               │
│  architect:         1 medium               │
│                                            │
│ Verification Engine:                        │
│  Stage 1 (단위 테스트):  ✓ 45/45 pass      │
│  Stage 2 (통합 테스트):  ✓ 12/12 pass      │
│  Stage 3 (커버리지):     ✓ 87%             │
│  Stage 4 (린트):         ✓ 0 violations    │
│  Stage 5 (타입 체크):    ✓ 0 errors        │
│  Stage 6 (보안 스캔):    ✓ 0 vulnerabilities│
│  Stage 7 (빌드):         ✓ success         │
│                                            │
│ 판정: 배포 승인                             │
│                                            │
│ 남은 medium 이슈 (배포 후 개선):            │
│  1. OrderService 메서드 명 개선 권장        │
│  2. 에러 메시지 상세화 권장                 │
│  3. 캐싱 전략 최적화 권장                   │
│                                            │
│ 배포를 진행하시겠습니까? (Y/N)              │
└────────────────────────────────────────────┘
```

---

## 에러 처리

| 상황 | 대응 |
|------|------|
| 리뷰 에이전트 타임아웃 | 해당 리뷰 재실행 (나머지 결과는 유지) |
| CRITICAL 이슈 발견 | 즉시 Phase 4로 돌아가 수정 |
| 커버리지 80% 미달 | 테스트 추가 후 재검증 |
| 빌드 실패 | build-error-resolver 호출 |
| 3회 재시도 실패 | 사용자 에스컬레이션 |

---

## 체크리스트

Phase 5 완료 전 확인:

- [ ] 3개 리뷰어의 결과가 모두 수집되었는가
- [ ] CRITICAL/HIGH 이슈가 모두 해결되었는가
- [ ] Verification Engine 8단계가 모두 PASS인가 (WARN은 허용)
- [ ] 커버리지 80% 이상인가
- [ ] 보안 취약점이 없는가
- [ ] 빌드가 성공하는가
- [ ] Human checkpoint에서 승인되었는가
