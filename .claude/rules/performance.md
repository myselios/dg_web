# 성능 규칙

## asyncio 최적화

### 병렬 실행 (독립적 I/O)

독립적인 I/O 작업은 `asyncio.gather`로 병렬 실행한다.

```python
import asyncio

# 금지: 순차 실행 (느림)
ticker = await fetch_ticker()
orderbook = await fetch_orderbook()
positions = await fetch_positions()

# 올바름: 병렬 실행 (빠름)
ticker, orderbook, positions = await asyncio.gather(
    fetch_ticker(),
    fetch_orderbook(),
    fetch_positions(),
)
```

### 타임아웃 필수

모든 외부 I/O 호출에 타임아웃을 설정한다.

```python
# Python 3.11+
async with asyncio.timeout(10):
    result = await external_api_call()

# Python 3.10 이하
result = await asyncio.wait_for(external_api_call(), timeout=10.0)
```

### 세마포어로 동시성 제어

```python
# 동시 요청 수 제한
semaphore = asyncio.Semaphore(10)

async def limited_request(url: str):
    async with semaphore:
        return await fetch(url)

# 100개 요청을 동시 10개로 제한
results = await asyncio.gather(
    *[limited_request(url) for url in urls]
)
```

---

## API 호출 최적화

### Rate Limit 준수

```python
# 거래소별 Rate Limit 예시
RATE_LIMITS = {
    "bybit": 120,      # 120 req/min
    "binance": 1200,    # 1200 req/min
    "upbit": 600,       # 600 req/min (초당 10)
}

# Rate limiter 구현
class RateLimiter:
    def __init__(self, max_requests: int, period: float = 60.0):
        self._semaphore = asyncio.Semaphore(max_requests)
        self._period = period

    async def acquire(self):
        await self._semaphore.acquire()
        asyncio.get_event_loop().call_later(
            self._period, self._semaphore.release
        )
```

### 불필요한 API 호출 제거

```python
# 금지: 매번 호출
async def get_symbol_info(symbol: str):
    return await exchange.fetch_instrument_info(symbol)

# 올바름: 캐싱 (자주 변하지 않는 데이터)
from functools import lru_cache
from datetime import datetime, timedelta

_instrument_cache: dict[str, tuple[datetime, Any]] = {}
CACHE_TTL = timedelta(minutes=30)

async def get_symbol_info(symbol: str):
    now = datetime.now()
    cached = _instrument_cache.get(symbol)
    if cached and now - cached[0] < CACHE_TTL:
        return cached[1]

    info = await exchange.fetch_instrument_info(symbol)
    _instrument_cache[symbol] = (now, info)
    return info
```

### 배치 조회

```python
# 금지: 개별 호출
for symbol in symbols:
    price = await fetch_price(symbol)

# 올바름: 배치 조회
prices = await fetch_prices_batch(symbols)
```

---

## Docker 최적화

### Multi-stage Build

```dockerfile
# Stage 1: 빌드 (빌드 도구 포함)
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: 프로덕션 (최소 이미지)
FROM python:3.12-slim AS production
WORKDIR /app
COPY --from=builder /install /usr/local
COPY src/ ./src/
CMD ["python", "-m", "src.main"]
```

### 레이어 캐싱 활용

```dockerfile
# 올바름: 의존성 먼저 COPY (변경 빈도 낮음)
COPY requirements.txt .
RUN pip install -r requirements.txt

# 소스 코드는 나중에 COPY (변경 빈도 높음)
COPY src/ ./src/
```

### .dockerignore 설정

```
.git
.env
__pycache__
*.pyc
node_modules
.venv
venv
tests/
docs/
*.md
.mypy_cache
.pytest_cache
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
```

---

## 데이터 처리 최적화

### Generator/Iterator 사용

```python
# 금지: 전체 로드 (메모리 폭발 위험)
def process_all(data_list):
    results = []
    for item in data_list:
        results.append(transform(item))
    return results

# 올바름: Generator (메모리 효율)
def process_all(data_list):
    for item in data_list:
        yield transform(item)
```

### JSONL 라인별 처리

```python
# 금지: 전체 파일 로드
import json
with open("large_file.jsonl") as f:
    data = json.loads(f.read())  # 전체 로드!

# 올바름: 라인별 스트리밍 처리
def read_jsonl(filepath: str):
    with open(filepath) as f:
        for line in f:
            if line.strip():
                yield json.loads(line)
```

### Decimal 연산 (부동소수점 주의)

```python
from decimal import Decimal

# 금지: float 연산 (부동소수점 오류)
price = 0.1 + 0.2  # 0.30000000000000004

# 올바름: Decimal 연산
price = Decimal("0.1") + Decimal("0.2")  # Decimal('0.3')

# 금융 계산에서는 항상 Decimal 사용
def calculate_pnl(entry: Decimal, exit: Decimal, qty: Decimal) -> Decimal:
    return (exit - entry) * qty
```

---

## 성능 체크리스트

- [ ] O(n^2) 이상 알고리즘이 없는가 (또는 불가피한 경우 문서화)
- [ ] `asyncio.gather`로 병렬화 가능한 I/O를 병렬 실행하는가
- [ ] API 호출 횟수가 최소화되었는가
- [ ] 모든 외부 호출에 타임아웃이 설정되었는가
- [ ] 메모리 누수 (무한 리스트 축적) 가능성이 없는가
- [ ] 적절한 캐싱이 적용되었는가
- [ ] 대량 데이터를 generator로 처리하는가
- [ ] 금융 계산에 Decimal을 사용하는가
