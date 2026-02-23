# 보안 규칙

## 8대 필수 보안 검사

모든 커밋 전, 모든 PR 전 반드시 확인한다.

### 1. 시크릿 보호

하드코딩된 시크릿은 **절대 금지**한다.

```python
# 금지: 하드코딩된 시크릿
API_KEY = "sk-proj-xxxxx"
DB_PASSWORD = "super_secret_123"

# 올바름: 환경 변수 사용
import os

API_KEY = os.environ["API_KEY"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

# 환경 변수 누락 시 명확한 에러
def get_required_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(f"필수 환경 변수 '{key}'가 설정되지 않았습니다")
    return value
```

```typescript
// TypeScript
const apiKey = process.env.API_KEY
if (!apiKey) {
  throw new Error('필수 환경 변수 API_KEY가 설정되지 않았습니다')
}
```

### 2. 입력 검증

모든 외부 입력(사용자 입력, API 요청, 파일 데이터)을 검증한다.

```python
from pydantic import BaseModel, validator

class OrderRequest(BaseModel):
    symbol: str
    quantity: float
    side: Literal["BUY", "SELL"]

    @validator("quantity")
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("수량은 양수여야 합니다")
        return v
```

### 3. 파라미터화된 SQL

SQL 인젝션 방지를 위해 **항상** 파라미터화된 쿼리를 사용한다.

```python
# 금지: 문자열 포매팅
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# 올바름: 파라미터화된 쿼리
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### 4. XSS 방지

HTML 출력 시 항상 이스케이프 처리한다.

```typescript
// 금지: 직접 HTML 삽입
element.innerHTML = userInput

// 올바름: 텍스트로 삽입 또는 sanitize
element.textContent = userInput
// 또는
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

### 5. CSRF 보호

상태 변경 요청에 CSRF 토큰을 검증한다.

```python
# FastAPI: CSRF 미들웨어 적용
from fastapi_csrf_protect import CsrfProtect

@app.post("/api/transfer")
async def transfer(request: Request, csrf_protect: CsrfProtect = Depends()):
    await csrf_protect.validate_csrf(request)
    # 처리 로직
```

### 6. 접근 제어 (인증/권한)

모든 보호된 엔드포인트에서 인증과 권한을 검증한다.

```python
# 미들웨어/데코레이터로 일관된 접근 제어
@require_auth
@require_role("admin")
async def delete_user(user_id: str):
    # 관리자만 접근 가능
    pass
```

### 7. Rate Limiting

API 엔드포인트에 요청 속도 제한을 적용한다.

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/data")
@limiter.limit("60/minute")
async def get_data(request: Request):
    pass
```

### 8. 에러 응답에 민감 정보 미포함

에러 메시지에 내부 구현 세부사항, 스택 트레이스, DB 스키마 등을 노출하지 않는다.

```python
# 금지: 내부 정보 노출
except DatabaseError as e:
    return {"error": str(e)}  # DB 스키마, 쿼리 등 노출 위험

# 올바름: 일반적인 에러 메시지 + 내부 로깅
except DatabaseError as e:
    logger.error("DB 에러: %s", e)
    return {"error": "데이터 처리 중 오류가 발생했습니다"}
```

---

## 환경 변수 관리

```bash
# .env 파일은 절대 커밋하지 않는다
# .gitignore에 반드시 포함
.env
.env.local
.env.production

# .env.example만 커밋 (실제 값 없이 키만)
API_KEY=
DB_PASSWORD=
JWT_SECRET=
```

---

## 보안 이슈 발견 시 대응 프로토콜

1. **즉시 작업 중단** - 보안 이슈를 발견하면 현재 작업을 멈춘다
2. **심각도 평가** - Critical / High / Medium / Low 분류
3. **security-reviewer 에이전트 호출** - 자동 보안 분석 실행
4. **수정 적용** - 심각한 이슈부터 우선 수정
5. **노출된 시크릿 즉시 교체** - 이미 커밋된 시크릿은 무효화
6. **전체 코드베이스 유사 이슈 검토** - 동일 패턴의 취약점 전수 조사

---

## 보안 체크리스트

커밋 전 반드시 확인:

- [ ] 하드코딩된 시크릿 없음 (API 키, 비밀번호, 토큰)
- [ ] 모든 외부 입력 검증됨
- [ ] SQL 쿼리가 파라미터화됨
- [ ] HTML 출력이 이스케이프됨
- [ ] CSRF 토큰 검증됨
- [ ] 인증/권한 검증됨
- [ ] Rate limiting 적용됨
- [ ] 에러 메시지에 민감 정보 미포함
- [ ] .env 파일이 .gitignore에 포함됨
