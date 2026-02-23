# Clean Architecture 규칙

## 레이어 구조

```
┌─────────────────────────────────────────────┐
│          Presentation (외부)                 │
│  컨트롤러, CLI, UI, API 라우터               │
├─────────────────────────────────────────────┤
│          Infrastructure                      │
│  DB 어댑터, 외부 API 클라이언트, 파일 시스템   │
├─────────────────────────────────────────────┤
│          Application                         │
│  유스케이스, 포트(인터페이스), DTO             │
├─────────────────────────────────────────────┤
│          Domain (핵심)                       │
│  엔티티, 값 객체, 도메인 서비스, 도메인 이벤트  │
└─────────────────────────────────────────────┘

         의존성 방향: 바깥 → 안쪽 (단방향)
```

---

## 핵심 규칙: 의존성 방향

**내부 레이어는 절대로 외부 레이어를 참조하지 않는다.**

```python
# 금지: Domain이 Infrastructure를 참조
# domain/order.py
from infrastructure.postgres import PostgresDB  # 금지!

class Order:
    def save(self, db: PostgresDB):  # 금지!
        db.insert(self)

# 올바름: Domain은 순수 비즈니스 로직만
# domain/order.py
from decimal import Decimal

class Order:
    def calculate_total(self) -> Decimal:
        return sum(item.subtotal for item in self.items)
```

---

## 레이어별 상세 규칙

### Domain 레이어 (핵심 - 외부 의존성 제로)

Domain 레이어는 **외부 라이브러리에 의존하지 않는다**. 순수 Python/TypeScript만 사용한다.

#### 포함하는 것

- **엔티티 (Entity)**: 고유 식별자를 가진 도메인 객체
- **값 객체 (Value Object)**: 식별자 없이 값으로 비교되는 불변 객체
- **도메인 서비스**: 특정 엔티티에 속하지 않는 비즈니스 로직
- **도메인 이벤트**: 도메인에서 발생한 사건

```python
# domain/entities/order.py
from dataclasses import dataclass
from decimal import Decimal
from enum import Enum

class OrderStatus(Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"

@dataclass(frozen=True)  # 불변 값 객체
class Money:
    amount: Decimal
    currency: str

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("통화가 다릅니다")
        return Money(amount=self.amount + other.amount, currency=self.currency)

@dataclass
class Order:
    id: str
    items: tuple  # 불변 컬렉션
    status: OrderStatus

    def calculate_total(self) -> Money:
        total = Decimal("0")
        for item in self.items:
            total += item.price.amount * item.quantity
        return Money(amount=total, currency="USD")

    def can_cancel(self) -> bool:
        return self.status == OrderStatus.PENDING
```

#### 금지 사항

- `import sqlalchemy`, `import requests`, `import fastapi` 등 외부 라이브러리
- DB 접근, HTTP 호출, 파일 I/O
- 환경 변수 읽기
- 로깅 (로거 주입은 Application 레이어에서)

### Application 레이어 (유스케이스)

유스케이스가 도메인 로직을 조율한다. **인터페이스(포트)**를 정의하고, 구현은 Infrastructure에 위임한다.

```python
# application/ports/order_repository.py
from typing import Protocol
from domain.entities.order import Order

class OrderRepository(Protocol):
    """주문 저장소 포트 (인터페이스)"""
    async def save(self, order: Order) -> None: ...
    async def find_by_id(self, order_id: str) -> Order | None: ...

# application/ports/notification_service.py
class NotificationService(Protocol):
    """알림 서비스 포트"""
    async def notify_order_created(self, order: Order) -> None: ...

# application/use_cases/create_order.py
from domain.entities.order import Order, OrderStatus
from application.ports.order_repository import OrderRepository
from application.ports.notification_service import NotificationService

class CreateOrderUseCase:
    def __init__(
        self,
        order_repo: OrderRepository,
        notification: NotificationService,
    ):
        self._order_repo = order_repo
        self._notification = notification

    async def execute(self, request: CreateOrderRequest) -> Order:
        # 도메인 로직만 조율
        order = Order(
            id=generate_id(),
            items=tuple(request.items),
            status=OrderStatus.PENDING,
        )

        # 유효성 검증 (도메인 로직)
        total = order.calculate_total()
        if total.amount <= 0:
            raise ValueError("주문 총액이 0 이하입니다")

        # 포트를 통한 인프라 호출
        await self._order_repo.save(order)
        await self._notification.notify_order_created(order)

        return order
```

#### 규칙

- 유스케이스는 도메인 로직만 조율 (직접 비즈니스 로직 구현 금지)
- 포트(Protocol/Interface)를 정의하여 인프라 의존성 역전
- DTO(Data Transfer Object)로 레이어 간 데이터 전달

### Infrastructure 레이어 (어댑터)

Application 레이어에서 정의한 포트를 **구체적으로 구현**한다.

```python
# infrastructure/repositories/postgres_order_repository.py
from application.ports.order_repository import OrderRepository
from domain.entities.order import Order

class PostgresOrderRepository:
    """OrderRepository 포트의 PostgreSQL 구현"""

    def __init__(self, db_pool):
        self._pool = db_pool

    async def save(self, order: Order) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO orders (id, status, total) VALUES ($1, $2, $3)",
                order.id, order.status.value, str(order.calculate_total().amount),
            )

    async def find_by_id(self, order_id: str) -> Order | None:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM orders WHERE id = $1", order_id
            )
            if not row:
                return None
            return self._to_domain(row)
```

#### 규칙

- Domain/Application에서 정의한 인터페이스를 구현
- 외부 라이브러리 사용 (DB 드라이버, HTTP 클라이언트 등)
- 도메인 로직을 포함하지 않음

### Presentation 레이어 (컨트롤러)

외부 요청을 Application 레이어로 전달하고, 결과를 외부 형식으로 변환한다.

```python
# presentation/api/order_routes.py
from fastapi import APIRouter, Depends
from application.use_cases.create_order import CreateOrderUseCase

router = APIRouter()

@router.post("/orders")
async def create_order(
    request: CreateOrderRequest,
    use_case: CreateOrderUseCase = Depends(get_create_order_use_case),
):
    order = await use_case.execute(request)
    return OrderResponse.from_domain(order)
```

#### 규칙

- 비즈니스 로직을 포함하지 않음
- 요청 검증 (Pydantic/Zod)은 이 레이어에서 수행
- 도메인 객체를 응답 DTO로 변환

---

## 디렉토리 구조

```
src/
  domain/                     # 핵심 도메인
    entities/
      order.py
      user.py
    value_objects/
      money.py
      address.py
    services/
      pricing_service.py
    events/
      order_events.py

  application/                # 유스케이스
    ports/                    # 인터페이스 정의
      order_repository.py
      notification_service.py
    use_cases/
      create_order.py
      cancel_order.py
    dto/
      order_request.py
      order_response.py

  infrastructure/             # 외부 구현
    repositories/
      postgres_order_repo.py
      redis_cache.py
    external/
      email_notification.py
      payment_gateway.py
    config/
      database.py
      settings.py

  presentation/               # 진입점
    api/
      order_routes.py
      user_routes.py
    cli/
      commands.py

  main.py                     # 의존성 조립 (Composition Root)
```

---

## 의존성 주입 (Composition Root)

모든 의존성은 **main.py (Composition Root)**에서 조립한다.

```python
# main.py
from infrastructure.repositories.postgres_order_repo import PostgresOrderRepository
from infrastructure.external.email_notification import EmailNotificationService
from application.use_cases.create_order import CreateOrderUseCase

# 의존성 조립
order_repo = PostgresOrderRepository(db_pool)
notification = EmailNotificationService(smtp_client)

create_order_use_case = CreateOrderUseCase(
    order_repo=order_repo,
    notification=notification,
)
```

---

## Clean Architecture 체크리스트

- [ ] Domain 레이어에 외부 의존성이 없는가
- [ ] Application 레이어가 포트(Protocol)를 정의하는가
- [ ] Infrastructure가 포트를 구현하는가
- [ ] 의존성 방향이 항상 안쪽인가 (외부 → 내부)
- [ ] 비즈니스 로직이 Domain에만 존재하는가
- [ ] Presentation에 비즈니스 로직이 없는가
- [ ] Composition Root에서 의존성을 조립하는가
- [ ] 각 레이어가 자신의 디렉토리에 있는가
