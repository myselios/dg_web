# 7대 골든 원칙

이 원칙들은 모든 코드 작업에서 **최우선으로 적용**되는 핵심 규칙이다.
다른 규칙과 충돌할 경우 이 원칙이 우선한다.

---

## 원칙 1: 불변성 우선 (Immutability over Mutations)

**절대로 기존 데이터를 직접 변경하지 않는다.**

모든 데이터 조작은 새 객체를 생성하여 반환한다. 이는 버그 추적을 용이하게 하고,
동시성 문제를 예방하며, 테스트를 단순하게 만든다.

```python
# 원칙 위반
def add_item(cart: list, item):
    cart.append(item)       # 뮤테이션!
    return cart

# 원칙 준수
def add_item(cart: list, item):
    return [*cart, item]    # 새 리스트 생성
```

**적용 범위**: 모든 함수의 인자, 전역 상태, 공유 데이터 구조

---

## 원칙 2: 환경 변수로 시크릿 관리

**코드에 시크릿을 절대 하드코딩하지 않는다.**

모든 시크릿(API 키, 비밀번호, 토큰, 인증서)은 환경 변수 또는 시크릿 매니저를 통해 주입한다.

```python
import os

# 원칙 위반
API_KEY = "sk-xxxxx"

# 원칙 준수
API_KEY = os.environ["API_KEY"]
```

**적용 범위**: 모든 외부 서비스 인증 정보, 데이터베이스 자격증명, 암호화 키

---

## 원칙 3: TDD RED-GREEN-REFACTOR (커버리지 80%+)

**코드 작성 전에 테스트를 먼저 작성한다.**

```
RED     → 실패하는 테스트 작성 (기대 동작 정의)
GREEN   → 테스트를 통과하는 최소 구현
REFACTOR → 테스트 유지하며 코드 품질 개선
```

- 새 기능 = 새 테스트 (선행)
- 버그 수정 = 회귀 테스트 (선행)
- 전체 커버리지 80% 이상 유지
- 핵심 비즈니스 로직 90% 이상

**적용 범위**: 모든 새 기능, 버그 수정, 리팩토링

---

## 원칙 4: 결론 먼저, 근거는 후순위 (Conclusion First)

**응답과 문서에서 결론/핵심을 먼저 제시한다.**

코드 리뷰, 분석 보고, 아키텍처 제안 등 모든 커뮤니케이션에서:

1. **결론** - 무엇을 해야 하는가 / 문제가 무엇인가
2. **근거** - 왜 그런 결론인가
3. **상세** - 구체적인 구현/증거

```markdown
# 좋은 예
결론: OrderService를 Clean Architecture로 리팩토링해야 합니다.
이유: 현재 도메인 로직이 인프라에 결합되어 있어 테스트가 어렵습니다.
방법: Domain → Application → Infrastructure 레이어 분리...

# 나쁜 예
OrderService를 살펴보면 DB 쿼리가 service 메서드 안에 있고...
(한참 후) ...따라서 리팩토링이 필요합니다.
```

**적용 범위**: 코드 리뷰 코멘트, PR 설명, 기술 문서, 에이전트 응답

---

## 원칙 5: 작은 파일, 작은 함수 (Small Units)

**파일 800줄, 함수 50줄, 중첩 4단계 이하.**

큰 단위는 이해하기 어렵고, 테스트하기 어렵고, 변경하기 어렵다.

| 단위 | 권장 | 최대 |
|------|------|------|
| 파일 | 200-400줄 | 800줄 |
| 함수 | 10-30줄 | 50줄 |
| 중첩 | 2단계 | 4단계 |
| 클래스 메서드 수 | 5-10개 | 15개 |

**위반 시 조치**: 즉시 분리/추출. "나중에 리팩토링"은 허용하지 않는다.

**적용 범위**: 모든 소스 코드 파일

---

## 원칙 6: 시스템 경계에서 검증 (Validation at Boundaries)

**외부 데이터가 시스템에 진입하는 모든 지점에서 검증한다.**

```
외부 세계 → [검증 경계] → 내부 시스템 (신뢰 가능한 데이터)
```

### 검증 도구

| 언어 | 도구 | 용도 |
|------|------|------|
| Python | Pydantic | API 입력, 설정 파일, 외부 데이터 |
| TypeScript | Zod | API 입력, 폼 데이터, 외부 데이터 |
| SQL | 파라미터화된 쿼리 | 데이터베이스 접근 |

```python
# 시스템 경계 (API 엔드포인트)
@app.post("/orders")
async def create_order(request: OrderRequest):  # Pydantic 검증
    # 여기서부터 request는 신뢰 가능한 데이터
    return await order_service.create(request)
```

**적용 범위**: API 엔드포인트, CLI 인자, 파일 읽기, 외부 API 응답, 사용자 입력

---

## 원칙 7: Clean Architecture 레이어 분리

**내부 레이어는 외부 레이어를 절대 참조하지 않는다.**

```
Domain (핵심)
  ↑ 의존성 방향 (안쪽으로만)
Application (유스케이스)
  ↑
Infrastructure (DB, API, 외부 서비스)
  ↑
Presentation (컨트롤러, CLI, UI)
```

### 레이어별 규칙

| 레이어 | 허용 | 금지 |
|--------|------|------|
| Domain | 순수 비즈니스 로직, 값 객체, 엔티티 | 외부 라이브러리, DB, HTTP |
| Application | 유스케이스, 포트(인터페이스) 정의 | 구체적 인프라 구현 |
| Infrastructure | 어댑터, DB 구현, 외부 API | 도메인 로직 |
| Presentation | 요청/응답 변환 | 비즈니스 로직 |

```python
# Domain (외부 의존성 제로)
class Order:
    def calculate_total(self) -> Decimal:
        return sum(item.price * item.quantity for item in self.items)

# Application (포트 정의)
class OrderRepository(Protocol):
    async def save(self, order: Order) -> None: ...

# Infrastructure (포트 구현)
class PostgresOrderRepository:
    async def save(self, order: Order) -> None:
        await self.db.execute(...)
```

**적용 범위**: 모든 프로젝트의 디렉토리 구조와 모듈 의존성

---

## 원칙 적용 우선순위

충돌 시 번호가 낮은 원칙이 우선한다:

1. 불변성 (코드 안전성의 기반)
2. 시크릿 관리 (보안의 기반)
3. TDD (품질의 기반)
4. 결론 우선 (커뮤니케이션)
5. 작은 단위 (유지보수성)
6. 경계 검증 (안정성)
7. 레이어 분리 (아키텍처)
