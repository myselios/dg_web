# Phase 2: TDD-RED (실패 테스트 작성)

## 목적

각 태스크에 대해 실패하는 테스트를 먼저 작성한다.
TDD의 RED 단계로, 구현 전에 기대 동작을 테스트로 정의한다.

---

## 입력

- Phase 1의 태스크 리스트 (.ai-auto/plan.json)
- 의존성 그래프 (waves 구조)
- 아키텍처 설계 문서
- 기술 스택 도구 매핑 (Step 2.5에서 결정됨)

## 출력

- 각 태스크별 실패하는 테스트 파일
- 테스트 실행 결과 (모두 FAIL 확인)

---

## 실행 단계

### Step 1: 태스크별 테스트 전략 확인

```
각 태스크의 test_strategy 필드를 읽고:
  1. 필요한 테스트 유형 결정 (단위/통합/E2E)
  2. 테스트 파일 경로 결정
  3. 테스트 케이스 목록 작성
```

### Step 2: 인터페이스 스텁 생성 (ImportError 방지)

테스트가 import할 모듈의 **빈 인터페이스(스텁)**를 먼저 생성합니다.
이렇게 해야 테스트가 ImportError가 아닌 **AssertionError로 실패**(올바른 RED 상태)합니다.

```python
# 예: src/domain/entities/news.py (스텁)
from dataclasses import dataclass

@dataclass(frozen=True)
class NewsArticle:
    """뉴스 기사 엔티티 — 구현은 Phase 3에서"""
    pass

# 예: src/application/ports/news_repository.py (스텁)
from typing import Protocol

class NewsRepository(Protocol):
    """뉴스 저장소 포트 — 구현은 Phase 3에서"""
    ...
```

**스텁 생성 규칙:**
- 클래스/함수 **시그니처만** 생성 (본문은 `pass` 또는 `...`)
- `@dataclass(frozen=True)` 또는 `Protocol`로 인터페이스만 정의
- 비즈니스 로직은 절대 구현하지 않음
- 목적: 테스트 파일이 정상적으로 import되어 **assert에서 실패**하도록 함

**스텁 생성 범위:**
- Wave 1 태스크의 도메인 엔티티, 값 객체, 포트(인터페이스)
- 이후 Wave의 테스트가 참조하는 상위 모듈도 스텁 생성

### Step 3: tdd-guide 에이전트 호출

```
tdd-guide 에이전트 입력:
  - 태스크 설명
  - Step 2에서 생성한 스텁 인터페이스
  - 테스트 전략
  - AAA 패턴 필수
  - testing.md 규칙 참조

tdd-guide 에이전트 출력:
  - 테스트 파일 내용
  - 각 테스트 케이스의 의도 설명
```

### Step 4: 독립 모듈 병렬 테스트 작성

의존성 그래프의 독립 그룹에 대해 병렬로 테스트를 작성한다.

```
# 규모별 병렬화 전략

S (Small):
  순차 실행 - 단일 tdd-guide 에이전트

M (Medium):
  독립 그룹별 tdd-guide subagent 병렬 디스패치
  예: Group 1의 [T001, T002, T003]을 동시에 테스트 작성

L (Large):
  모듈 그룹별 tdd-guide subagent 팀 병렬 디스패치
  각 팀이 관련 모듈의 테스트를 일괄 작성
```

### Step 4.5: 테스트 작성 규칙

모든 테스트는 다음 규칙을 준수한다.

```python
# 1. AAA 패턴 필수
def test_order_calculate_total_with_multiple_items():
    # Arrange
    items = (
        OrderItem(name="Widget", price=Money(Decimal("10.00"), "USD"), quantity=3),
        OrderItem(name="Gadget", price=Money(Decimal("25.00"), "USD"), quantity=1),
    )
    order = Order(id="ORD-001", items=items, status=OrderStatus.PENDING)

    # Act
    total = order.calculate_total()

    # Assert
    assert total == Money(Decimal("55.00"), "USD")


# 2. 경계 조건 테스트 필수
def test_order_calculate_total_with_empty_items():
    order = Order(id="ORD-002", items=(), status=OrderStatus.PENDING)
    total = order.calculate_total()
    assert total == Money(Decimal("0"), "USD")


# 3. 에러 케이스 테스트 필수
def test_order_cancel_when_already_filled_raises_error():
    order = Order(id="ORD-003", items=(), status=OrderStatus.FILLED)
    with pytest.raises(DomainError, match="이미 체결된 주문"):
        order.cancel()


# 4. 도메인 값 비교 assert 필수 (assert True 금지)
def test_money_add_different_currencies_raises_error():
    usd = Money(Decimal("10.00"), "USD")
    eur = Money(Decimal("5.00"), "EUR")
    with pytest.raises(ValueError, match="통화가 다릅니다"):
        usd.add(eur)
```

### Step 5: 테스트 실행 및 FAIL 확인

기술 스택에 맞는 테스트 명령을 사용합니다:

```bash
# Python
pytest -q --tb=short

# TypeScript
npm test -- --passWithNoTests

# Go
go test ./...
```

**주의**: Step 2.5에서 결정된 `tech_stack_tools.test` 명령을 사용하세요.

```
기대 결과: 모든 테스트 FAILED
  - AssertionError (스텁만 있으므로 값이 안 맞음) ← 올바른 RED
  - NotImplementedError / AttributeError ← 허용
  - ImportError ← Step 2 스텁이 누락된 것, 스텁 보완 필요

만약 테스트가 통과한다면:
  - 테스트가 올바르게 작성되지 않은 것
  - 또는 이미 구현이 존재하는 것
  → 검토 필요
```

### Step 5.5: 외부 API 의존성 Mock 규칙

**외부 API를 호출하는 태스크의 테스트는 반드시 mock을 사용합니다.**

```python
# Infrastructure 레이어 (외부 API)는 mock으로 대체
# 절대 실제 API를 호출하지 않음

# 예: OpenAI API를 사용하는 분석 서비스 테스트
from unittest.mock import AsyncMock

def test_analyze_news_returns_sentiment_score():
    # Arrange
    mock_llm = AsyncMock()
    mock_llm.analyze.return_value = SentimentResult(
        score=0.85, label="POSITIVE", confidence=0.92
    )
    service = NewsAnalyzer(llm_client=mock_llm)

    # Act
    result = service.analyze(NewsArticle(title="Apple 매출 신기록"))

    # Assert
    assert result.score == 0.85
    assert result.label == "POSITIVE"

# 예: 외부 뉴스 API 테스트
def test_fetch_news_returns_articles():
    # Arrange
    mock_client = AsyncMock()
    mock_client.get_headlines.return_value = [
        {"title": "Tesla Q4 실적 발표", "source": "Reuters"}
    ]
    fetcher = NewsFetcher(api_client=mock_client)

    # Act
    articles = fetcher.fetch_latest()

    # Assert
    assert len(articles) == 1
    assert articles[0].source == "Reuters"
```

**Mock 규칙:**
- **Domain 레이어**: mock 없이 순수 단위 테스트
- **Application 레이어**: 포트(Protocol)를 mock으로 주입
- **Infrastructure 레이어**: 외부 API 클라이언트를 mock
- **Integration 테스트**: 실제 DB는 테스트 DB 사용, 외부 API는 여전히 mock
- `.env`의 `TODO_REPLACE` 값이 있어도 테스트가 통과해야 함 (mock 사용이므로)

### Step 6: 테스트 파일 구조 확인

```
tests/
  unit/
    domain/
      test_order.py           # Order 엔티티 테스트
      test_money.py           # Money 값 객체 테스트
    application/
      test_create_order.py    # CreateOrder 유스케이스 테스트
  integration/
    test_order_repository.py  # DB 연동 테스트
  e2e/
    test_order_flow.py        # 전체 흐름 테스트
  conftest.py                 # 공유 fixtures
```

---

## 병렬 디스패치 예시

### M 규모: 독립 모듈별 병렬

```
의존성 그래프:
  Group 1 (독립): [T001-도메인, T002-API스키마]
  Group 2 (G1 의존): [T003-유스케이스, T004-리포지토리]

병렬 디스패치:
  시점 1: tdd-guide(T001) || tdd-guide(T002)  → 병렬
  시점 2: tdd-guide(T003) || tdd-guide(T004)  → 병렬 (시점 1 완료 후)
```

### L 규모: 모듈 그룹별 병렬

```
모듈 그룹:
  주문 모듈: [T001, T003, T005]
  결제 모듈: [T002, T004, T006]
  알림 모듈: [T007, T008]

병렬 디스패치:
  tdd-team(주문) || tdd-team(결제) || tdd-team(알림) → 병렬
```

---

## 에러 처리

| 상황 | 대응 |
|------|------|
| 테스트 작성 중 도메인 모델 불명확 | Phase 1로 돌아가 스펙 보완 |
| 테스트 파일 경로 충돌 | 네이밍 규칙 재적용 |
| 일부 테스트가 이미 통과 | 테스트 로직 검토 (기존 구현 확인) |
| 테스트 프레임워크 미설치 | setup-project.sh 실행 안내 |

---

## 체크리스트

Phase 2 완료 전 확인:

- [ ] 모든 태스크에 대해 테스트가 작성되었는가
- [ ] AAA 패턴을 준수하는가
- [ ] 각 테스트에 도메인 값 비교 assert가 있는가
- [ ] 경계 조건 테스트가 포함되었는가
- [ ] 에러 케이스 테스트가 포함되었는가
- [ ] 모든 테스트가 FAIL인가 (RED 상태 확인)
- [ ] 테스트 파일 구조가 소스 구조와 미러링되는가
- [ ] `assert True`, `pass`, `NotImplementedError` 사용 없음
