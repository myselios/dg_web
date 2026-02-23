# 테스트 규칙

## 커버리지 기준

| 영역 | 최소 커버리지 |
|------|--------------|
| 전체 코드 | **80%** |
| 핵심 비즈니스 로직 | 90% |
| 상태 전이 함수 | 90% |
| 유틸리티 함수 | 100% |

80% 미만의 커버리지는 PR 머지를 차단한다.

---

## 필수 테스트 유형

### 1. 단위 테스트 (Unit Test)

- 개별 함수/클래스를 격리하여 테스트
- 외부 의존성은 mock/stub 사용
- 가장 빠르고 가장 많이 작성

```python
def test_calculate_pnl_with_long_position():
    # Arrange
    entry_price = Decimal("50000.00")
    exit_price = Decimal("52000.00")
    quantity = Decimal("0.1")

    # Act
    pnl = calculate_pnl(entry_price, exit_price, quantity, "LONG")

    # Assert
    assert pnl == Decimal("200.00")
```

### 2. 통합 테스트 (Integration Test)

- 모듈 간 상호작용 테스트
- 실제 DB, 외부 API 연동 확인
- 단위 테스트보다 느리지만 실제 동작 보장

```python
@pytest.mark.integration
async def test_order_placement_flow():
    # Arrange
    service = OrderService(real_repository, mock_exchange)

    # Act
    result = await service.place_order(order_request)

    # Assert
    assert result.status == "FILLED"
    saved = await real_repository.find_by_id(result.id)
    assert saved is not None
```

### 3. E2E 테스트 (End-to-End)

- 전체 시스템 흐름 테스트
- 사용자 시나리오 기반
- CI/CD 파이프라인에서 실행

```python
@pytest.mark.e2e
async def test_complete_trading_cycle():
    # 시그널 수신 → 주문 생성 → 체결 → PnL 계산 → 보고
    signal = await signal_service.generate()
    order = await order_service.execute(signal)
    assert order.status == "FILLED"
    pnl = await pnl_service.calculate(order)
    assert pnl.realized is not None
```

---

## TDD 워크플로우 (필수)

모든 새 기능은 TDD 방식으로 개발한다.

### RED 단계 - 실패하는 테스트 작성

```python
# 1. 먼저 테스트를 작성한다 (아직 구현 없음)
def test_new_feature_expected_behavior():
    result = new_feature(valid_input)
    assert result.status == "success"
    assert result.value > 0
```

### GREEN 단계 - 테스트를 통과하는 최소 구현

```python
# 2. 테스트를 통과하는 가장 단순한 코드를 작성한다
def new_feature(input_data):
    # 최소한의 구현
    return Result(status="success", value=compute(input_data))
```

### REFACTOR 단계 - 코드 정리

```python
# 3. 테스트가 통과하는 상태를 유지하며 리팩토링
def new_feature(input_data: ValidatedInput) -> Result:
    """새 기능: 입력 데이터를 처리하여 결과를 반환한다."""
    validated = validate(input_data)
    computed = compute(validated)
    return Result(status="success", value=computed)
```

---

## 테스트 도구

### Python

```bash
# pytest (기본)
pytest -q                           # 전체 테스트
pytest -q tests/unit/ -v            # 단위 테스트만
pytest -q --tb=short                # 짧은 traceback
pytest -q -x                        # 첫 실패에서 중단
pytest --cov=src --cov-report=term  # 커버리지 리포트
```

### JavaScript / TypeScript

```bash
# vitest (권장)
npx vitest run                      # 전체 테스트
npx vitest run --coverage           # 커버리지 포함

# jest (대안)
npx jest                            # 전체 테스트
npx jest --coverage                 # 커버리지 포함
```

---

## 테스트 작성 규칙

### AAA 패턴 (Arrange-Act-Assert) 필수

모든 테스트는 AAA 패턴을 따른다.

```python
def test_descriptive_name_explaining_scenario():
    # Arrange - 테스트 데이터와 환경 준비
    state = make_idle_state(equity=100.0)
    signal = Signal(direction="LONG", strength=0.8)

    # Act - 테스트 대상 실행
    result = transition(state, signal)

    # Assert - 결과 검증 (도메인 값 비교 필수)
    assert result.phase == "ENTRY"
    assert result.direction == "LONG"
```

### 금지 사항

- `assert True`, `pass # TODO`, `raise NotImplementedError` 금지
- `tests/` 디렉토리에서 도메인 타입 재정의 금지
- `sys.path.insert` 금지
- 각 `test_` 함수에 **최소 1개 도메인 값 비교 assert** 필수
- `time.sleep()` 기반 테스트 금지 (비동기는 적절한 await 사용)

### 네이밍 규칙

```python
# 패턴: test_<대상>_<시나리오>_<기대결과>
def test_calculate_pnl_with_negative_quantity_raises_error():
    pass

def test_order_service_when_insufficient_balance_rejects():
    pass
```

---

## 3회 실패 프로토콜

테스트가 반복적으로 실패할 때:

1. **1회차**: 근본 원인 진단 → 타겟 수정
2. **2회차**: 동일 에러 시 접근 방식 변경
3. **3회차**: 가정 재검토 → 대안 솔루션 검색
4. **3회 초과**: 사용자에게 에스컬레이션 (시도 내역 포함)

```
에스컬레이션 보고 형식:
- 실패하는 테스트: <테스트명>
- 시도 1: <접근 방식> → <결과>
- 시도 2: <접근 방식> → <결과>
- 시도 3: <접근 방식> → <결과>
- 추정 근본 원인: <분석>
- 권장 조치: <제안>
```
