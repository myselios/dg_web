# Phase 4: REFACTOR (리팩토링)

## 목적

테스트가 통과하는 구현 코드를 Clean Architecture 규칙과 코딩 스타일에 맞게 정리한다.
TDD의 REFACTOR 단계로, 모든 테스트가 통과하는 상태를 유지하면서 코드 품질을 개선한다.

---

## 입력

- Phase 3에서 완성된 구현 코드
- 통과하는 테스트 스위트
- clean-architecture.md 규칙
- coding-style.md 규칙

## 출력

- 리팩토링된 코드 (모든 테스트 여전히 통과)
- 리팩토링 변경 요약

---

## 실행 단계

### Step 1: refactor-cleaner 에이전트 호출

```
refactor-cleaner 에이전트 입력:
  - 현재 소스 코드
  - clean-architecture.md 규칙
  - coding-style.md 규칙
  - golden-principles.md 참조

refactor-cleaner 에이전트 출력:
  - 리팩토링 대상 목록 (우선순위 포함)
  - 각 대상의 변경 계획
```

### Step 2: Clean Architecture 규칙 적용

#### 2-1. 레이어 분리 검증

```
확인 항목:
  □ Domain 레이어에 외부 의존성이 있는가?
    → 있다면 제거 (순수 비즈니스 로직만 유지)

  □ Application 레이어가 Infrastructure를 직접 참조하는가?
    → 있다면 포트(Protocol) 도입

  □ Infrastructure 코드에 비즈니스 로직이 있는가?
    → 있다면 Domain으로 이동

  □ Presentation에 비즈니스 로직이 있는가?
    → 있다면 Application 유스케이스로 이동
```

#### 2-2. 의존성 방향 검증

```python
# 검증 도구: import 분석
# 각 파일의 import를 분석하여 의존성 방향 확인

# 허용되는 의존성 방향
presentation → application → domain       # OK
infrastructure → application → domain     # OK

# 금지되는 의존성 방향
domain → application                       # 금지!
domain → infrastructure                    # 금지!
application → infrastructure               # 금지!
```

### Step 3: 코딩 스타일 준수 확인

#### 3-1. 파일 크기 검사

```bash
# 800줄 초과 파일 검출 (기술 스택에 맞게)
# Python: find src/ -name "*.py" -exec wc -l {} +
# TypeScript: find src/ -name "*.ts" -exec wc -l {} +
# Go: find . -name "*.go" -exec wc -l {} +

# 초과 시: 기능별로 파일 분할
# 예: order_service.py (900줄)
#   → order_creation_service.py + order_query_service.py
```

#### 3-2. 함수 크기 검사

```bash
# 50줄 초과 함수 검출 (AST 분석)
# 초과 시: 하위 함수로 추출

# 예: process_order() 70줄
#   → validate_order() + calculate_total() + save_order()
```

#### 3-3. 불변성 검사

```
뮤테이션 패턴 검출:
  - list.append() / list.extend()
  - dict[key] = value (기존 dict 수정)
  - object.attr = value (기존 객체 수정)
  - array.push() / array.splice()

→ 불변 패턴으로 교체
```

#### 3-4. 중첩 깊이 검사

```python
# 4단계 초과 중첩 검출
# 초과 시: 조기 반환(early return) 또는 하위 함수 추출

# 금지: 깊은 중첩
def process(data):
    if data:
        for item in data:
            if item.valid:
                for sub in item.children:
                    if sub.active:        # 5단계! 금지
                        do_something(sub)

# 올바름: 조기 반환 + 추출
def process(data):
    if not data:
        return
    active_subs = extract_active_subs(data)
    for sub in active_subs:
        do_something(sub)
```

### Step 4: 코드 정리

#### 4-1. 중복 제거

```
동일/유사 코드 블록 검출:
  → 공통 유틸리티 함수로 추출
  → 템플릿 메서드 패턴 적용
  → 전략 패턴으로 분기 제거
```

#### 4-2. 네이밍 개선

```
검사 항목:
  - 약어 사용 (usr → user, msg → message)
  - 의미 불분명한 이름 (data, info, temp, result)
  - 일관성 없는 네이밍 (get_user vs fetch_order)
  - 불리언 변수에 is/has/can 접두사 확인
```

#### 4-3. 매직 넘버/문자열 제거

```python
# 금지: 매직 넘버
if retry_count > 3:
    raise Error("최대 재시도 초과")

# 올바름: 상수로 추출
MAX_RETRY_COUNT = 3

if retry_count > MAX_RETRY_COUNT:
    raise Error(f"최대 재시도 횟수({MAX_RETRY_COUNT}) 초과")
```

### Step 5: 테스트 재실행 (GREEN 유지 확인)

```bash
# 리팩토링 후 모든 테스트가 여전히 통과하는지 확인
pytest -q

# 커버리지 확인
pytest --cov=src --cov-report=term

# 커버리지가 80% 미만이면 테스트 보강
```

### Step 6: 린트/타입 체크

Step 2.5에서 결정된 `tech_stack_tools`를 사용합니다:

```bash
# Python
ruff check src/
mypy src/

# TypeScript
npx eslint src/
npx tsc --noEmit

# Go
golangci-lint run
go vet ./...
```

**주의**: 프로젝트의 `tech_stack.language`에 맞는 명령만 실행하세요.

---

## 리팩토링 변경 요약 형식

```markdown
## 리팩토링 요약

### 레이어 분리
- `order_service.py`: DB 접근 로직을 `PostgresOrderRepository`로 이동
- `domain/order.py`: `import sqlalchemy` 제거, 순수 도메인 로직만 유지

### 파일 분할
- `order_service.py` (900줄) → `order_creation.py` (250줄) + `order_query.py` (200줄)

### 불변성 적용
- `OrderProcessor.update_state()`: dict 뮤테이션 → 새 dict 생성으로 변경

### 중복 제거
- `validate_input()` 공통 유틸리티로 추출 (3개 파일에서 사용)

### 테스트 결과
- 전체 테스트: 45/45 통과 (변경 없음)
- 커버리지: 87% (이전: 85%)
```

---

## 체크리스트

Phase 4 완료 전 확인:

- [ ] 모든 테스트가 여전히 통과하는가 (GREEN 유지)
- [ ] Clean Architecture 레이어 분리가 올바른가
- [ ] 의존성 방향이 안쪽으로만 향하는가
- [ ] 800줄 초과 파일이 없는가
- [ ] 50줄 초과 함수가 없는가
- [ ] 4단계 초과 중첩이 없는가
- [ ] 뮤테이션 패턴이 없는가
- [ ] 매직 넘버/문자열이 없는가
- [ ] 네이밍이 명확하고 일관적인가
- [ ] 린트/타입 체크가 통과하는가
- [ ] 커버리지 80% 이상인가
