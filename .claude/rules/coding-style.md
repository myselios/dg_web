# 코딩 스타일 규칙

## 불변성 (CRITICAL - 절대 위반 금지)

모든 데이터 조작은 새 객체를 생성해야 한다. 기존 객체를 직접 변경(mutate)하는 것은 **절대 금지**한다.

```python
# 금지: 뮤테이션
def update_user(user: dict, name: str) -> dict:
    user["name"] = name  # 뮤테이션!
    return user

# 올바름: 불변성
def update_user(user: dict, name: str) -> dict:
    return {**user, "name": name}
```

```typescript
// 금지: 뮤테이션
function updateUser(user: User, name: string): User {
  user.name = name  // 뮤테이션!
  return user
}

// 올바름: 불변성
function updateUser(user: User, name: string): User {
  return { ...user, name }
}
```

### 불변성 위반 사례 (모두 금지)

- `array.push()`, `array.splice()`, `array.sort()` (원본 변경)
- `object.property = value` (직접 할당)
- `del object["key"]` (직접 삭제)
- `list.append()`, `list.extend()`, `dict.update()` (Python 원본 변경)

### 올바른 대안

- `[...array, newItem]` / `array + [new_item]`
- `{ ...object, property: value }` / `{**dict, "key": value}`
- `array.filter()` / `[x for x in list if condition]`
- `sorted(list)` (새 리스트 반환)

---

## 파일 구성

### 크기 제한

| 항목 | 권장 | 최대 |
|------|------|------|
| 파일 | 200-400줄 | 800줄 |
| 함수 | 10-30줄 | 50줄 |
| 중첩 깊이 | 2단계 | 4단계 |

### 구성 원칙

- **기능/도메인별 구성** (타입별 구성 금지)
- 높은 응집도, 낮은 결합도
- 큰 컴포넌트에서 유틸리티 추출
- 하나의 파일은 하나의 책임

```
# 올바름: 도메인별 구성
src/
  trading/
    domain.py
    service.py
    repository.py
  portfolio/
    domain.py
    service.py
    repository.py

# 금지: 타입별 구성
src/
  models/
    trading.py
    portfolio.py
  services/
    trading.py
    portfolio.py
```

---

## 에러 처리

모든 외부 호출, I/O, 사용자 입력에 대해 포괄적으로 에러를 처리한다.

```python
# Python
try:
    result = await risky_operation()
    return result
except SpecificError as e:
    logger.error("작업 실패: %s", e)
    raise ApplicationError("사용자 친화적 메시지") from e
except Exception as e:
    logger.critical("예상치 못한 에러: %s", e)
    raise
```

```typescript
// TypeScript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  if (error instanceof SpecificError) {
    logger.error('작업 실패:', error)
    throw new ApplicationError('사용자 친화적 메시지')
  }
  throw error
}
```

---

## 입력 검증

시스템 경계에서 항상 사용자 입력을 검증한다.

```python
# Python: Pydantic
from pydantic import BaseModel, Field

class UserInput(BaseModel):
    email: str = Field(..., pattern=r'^[\w.+-]+@[\w-]+\.[\w.]+$')
    age: int = Field(..., ge=0, le=150)

validated = UserInput(**raw_input)
```

```typescript
// TypeScript: Zod
import { z } from 'zod'

const UserInputSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
})

const validated = UserInputSchema.parse(rawInput)
```

---

## 코드 품질 체크리스트

작업 완료 전 반드시 확인:

- [ ] 코드가 읽기 쉽고 이름이 의미를 전달하는가
- [ ] 함수가 50줄 이하인가
- [ ] 파일이 800줄 이하인가
- [ ] 중첩 깊이가 4단계 이하인가
- [ ] 적절한 에러 처리가 되어 있는가
- [ ] `console.log` / `print` 디버깅 문이 없는가
- [ ] 하드코딩된 값이 없는가 (매직 넘버, 문자열 리터럴)
- [ ] 불변 패턴을 사용하고 있는가 (뮤테이션 없음)
- [ ] 입력 검증이 시스템 경계에서 이루어지는가
- [ ] 도메인/기능별로 파일이 구성되어 있는가
