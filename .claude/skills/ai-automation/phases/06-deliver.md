# Phase 6: DELIVER (배포)

## 목적

검증을 통과한 코드를 문서화하고, 커밋하고, PR을 생성하며, 프로젝트를 아카이브한다.
전체 파이프라인의 마지막 단계로, 산출물을 정리하여 배포 가능한 상태로 만든다.

---

## 입력

- Phase 5에서 검증 통과한 코드
- 리뷰 결과 보고서
- 검증 엔진 결과
- PRD 및 스펙 문서

## 출력

- 갱신된 문서
- Git 커밋 + 브랜치 푸시
- PR (Pull Request)
- 아카이브된 스펙

---

## 실행 단계

### Step 1: doc-updater 에이전트 호출

```
doc-updater 에이전트 입력:
  - 변경된 소스 코드 diff
  - API 인터페이스 변경 사항
  - 아키텍처 변경 사항
  - 기존 문서 (있는 경우)

doc-updater 에이전트 출력:
  - 갱신된 API 문서
  - 갱신된 아키텍처 문서
  - CHANGELOG 엔트리
  - 인라인 코드 주석 (필요 시)
```

#### 문서 갱신 범위

```
갱신 대상:
  1. API 문서 (엔드포인트 추가/변경 시)
  2. 아키텍처 문서 (구조 변경 시)
  3. CHANGELOG (모든 경우)
  4. 설정 가이드 (환경 변수 추가 시)

갱신하지 않는 것:
  - README.md (사용자가 명시적으로 요청한 경우만)
  - 내부 개발 노트
```

### Step 2: commit-push-pr 에이전트 호출

#### 2-1. 커밋 준비

```bash
# 변경 사항 확인
git status
git diff --staged

# 최근 커밋 스타일 확인
git log --oneline -5
```

#### 2-2. 파일 스테이징

```bash
# 특정 파일만 스테이징 (git add -A 금지)
git add src/domain/entities/order.py
git add src/application/use_cases/create_order.py
git add tests/unit/domain/test_order.py
# ... 변경된 파일 목록

# 절대 스테이징하지 않는 파일
# .env, credentials.json, *.key, node_modules/, __pycache__/
```

#### 2-3. 커밋

```bash
git commit -m "$(cat <<'EOF'
[feat] 주문 관리 기능 구현

- Order 도메인 엔티티 및 Money 값 객체 추가
- CreateOrder, CancelOrder 유스케이스 구현
- PostgresOrderRepository 어댑터 구현
- 단위/통합 테스트 추가 (커버리지 87%)

PRD: prd-order-management.json
스펙: spec-order-v1.json

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 2-4. 브랜치 푸시

```bash
# 현재 브랜치를 원격에 푸시
git push -u origin feature/order-management

# force push 금지!
# git push --force  → 절대 금지
```

#### 2-5. PR 생성

```bash
gh pr create --title "[feat] 주문 관리 기능 구현" --body "$(cat <<'EOF'
## Summary
- Order 도메인 엔티티 및 Money 값 객체 추가
- CreateOrder, CancelOrder 유스케이스 구현
- Clean Architecture 레이어 분리 적용

## Changes
- `src/domain/entities/order.py`: Order 엔티티, OrderStatus, OrderItem
- `src/domain/value_objects/money.py`: Money 값 객체 (불변)
- `src/application/use_cases/create_order.py`: 주문 생성 유스케이스
- `src/application/ports/order_repository.py`: 저장소 포트
- `src/infrastructure/repositories/postgres_order_repo.py`: PostgreSQL 구현
- `tests/unit/domain/test_order.py`: 도메인 단위 테스트
- `tests/integration/test_order_repository.py`: 저장소 통합 테스트

## Verification Results
- Unit tests: 45/45 pass
- Integration tests: 12/12 pass
- Coverage: 87%
- Lint: 0 violations
- Type check: 0 errors
- Security scan: 0 vulnerabilities
- Build: success

## Test Plan
- [x] 단위 테스트 (도메인 로직)
- [x] 통합 테스트 (DB 연동)
- [ ] E2E 테스트 (수동)
- [ ] 스테이징 환경 배포 테스트

## Related
- PRD: prd-order-management.json
- Spec: spec-order-v1.json

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 3: OpenSpec 검증 및 아카이브

```bash
# 구현이 스펙을 충족하는지 검증
/opsx:verify spec-order-v1.json

# 검증 통과 시 아카이브
/opsx:archive spec-order-v1.json

# 검증 실패 시
#   → 실패 항목 확인
#   → Phase 3 또는 Phase 4로 돌아가 수정
#   → 재검증
```

### Step 4: 최종 정리

```
1. 작업 로그 저장
   → ~/.claude/work-log/ 에 세션 요약 저장

2. 임시 파일 정리
   → 프롬프트 파일, 임시 스크립트 등

3. 컨텍스트 정리
   → /compact 또는 /clear 실행

4. 결과 보고
   → PR URL
   → 검증 결과 요약
   → 남은 개선 사항 (medium/low 이슈)
```

---

## 최종 보고 형식

```
┌────────────────────────────────────────────┐
│ [ai-automation 완료] 최종 보고              │
├────────────────────────────────────────────┤
│                                            │
│ PRD: prd-order-management.json             │
│ 규모: M (5개 스토리, 12개 태스크)           │
│                                            │
│ 실행 요약:                                 │
│  Phase 1 (PLAN):      완료                 │
│  Phase 2 (TDD-RED):   완료 (테스트 45개)   │
│  Phase 3 (IMPLEMENT): 완료 (평균 3.2회)    │
│  Phase 4 (REFACTOR):  완료                 │
│  Phase 5 (REVIEW):    통과                 │
│  Phase 6 (DELIVER):   완료                 │
│                                            │
│ 산출물:                                    │
│  PR: https://github.com/org/repo/pull/42   │
│  커버리지: 87%                             │
│  테스트: 57개 (단위 45 + 통합 12)          │
│  문서: API 문서, CHANGELOG 갱신            │
│                                            │
│ 남은 개선 사항:                             │
│  - [medium] OrderService 메서드 명 개선    │
│  - [low] 캐싱 전략 최적화                  │
│                                            │
└────────────────────────────────────────────┘
```

---

## 에러 처리

| 상황 | 대응 |
|------|------|
| 커밋 실패 (pre-commit hook) | hook 에러 수정 → 새 커밋 (amend 금지) |
| 푸시 실패 (원격 충돌) | pull --rebase 후 재푸시 |
| PR 생성 실패 | gh 인증 확인, 브랜치 존재 확인 |
| OpenSpec 검증 실패 | 실패 항목 수정 후 재검증 |
| 문서 갱신 오류 | doc-updater 재실행 |

---

## 체크리스트

Phase 6 완료 전 확인:

- [ ] 문서가 갱신되었는가 (API, CHANGELOG)
- [ ] 커밋 메시지가 형식을 준수하는가
- [ ] .env 파일이 커밋에 포함되지 않았는가
- [ ] PR이 생성되었는가
- [ ] PR 본문에 검증 결과가 포함되었는가
- [ ] OpenSpec 검증이 통과되었는가
- [ ] 스펙이 아카이브되었는가
- [ ] 작업 로그가 저장되었는가
- [ ] 임시 파일이 정리되었는가
