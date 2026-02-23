---
name: verify-loop
description: "자동 검증 루프. 최대 3회 재시도로 테스트/린트/타입체크를 실행하고, 실패를 fixable/non-fixable로 분류하여 자동 수정합니다."
---

# /verify-loop - Auto-Validation with Self-Correction

당신은 자동 검증 에이전트입니다. 코드 변경 사항에 대해 다단계 검증을 실행하고, 실패 시 자동 수정을 시도합니다.

---

## 개요

검증 파이프라인을 실행하고, 실패 시 최대 3회까지 자동 수정을 시도합니다.
각 실패를 **fixable**(자동 수정 가능)과 **non-fixable**(수동 개입 필요)로 분류합니다.

---

## Step 1: 검증 대상 파악

1. `git diff --name-only`로 변경된 파일 목록을 수집
2. 변경된 파일이 없으면 `git diff --cached --name-only`로 스테이지된 파일 확인
3. 여전히 없으면 사용자에게 검증 범위를 요청

```
[VERIFY] 검증 대상 파일: {N}개
{파일 목록}
```

---

## Step 2: 검증 파이프라인 실행

다음 4단계를 순서대로 실행합니다.

### Stage 1: 린트 검사

프로젝트 설정을 감지하여 적절한 린터를 실행합니다.

| 감지 대상 | 린터 명령어 |
|-----------|-------------|
| `pyproject.toml` (ruff) | `ruff check .` |
| `.flake8` / `setup.cfg` | `flake8 .` |
| `.eslintrc*` / `eslint.config*` | `npx eslint .` |
| `biome.json` | `npx biome check .` |

린터가 감지되지 않으면 경고를 출력하고 다음 단계로 진행합니다.

### Stage 2: 타입 체크

| 감지 대상 | 명령어 |
|-----------|--------|
| `mypy.ini` / `pyproject.toml [mypy]` | `mypy .` |
| `pyrightconfig.json` / `pyproject.toml [pyright]` | `pyright` |
| `tsconfig.json` | `npx tsc --noEmit` |

### Stage 3: 테스트 실행

| 감지 대상 | 명령어 |
|-----------|--------|
| `pytest.ini` / `pyproject.toml [pytest]` | `pytest -q --tb=short` |
| `package.json` (test script) | `npm test` |
| `Makefile` (test target) | `make test` |

### Stage 4: 빌드 검증 (해당하는 경우)

| 감지 대상 | 명령어 |
|-----------|--------|
| `package.json` (build script) | `npm run build` |
| `Makefile` (build target) | `make build` |
| `Dockerfile` | `docker build --target test .` (test stage가 있는 경우) |

---

## Step 3: 실패 분류

각 실패를 다음 두 카테고리로 분류합니다.

### Fixable (자동 수정 가능)

| 유형 | 설명 | 자동 수정 방법 |
|------|------|----------------|
| **import-error** | 누락된 import, 잘못된 import 경로 | 올바른 import 문 추가/수정 |
| **lint-format** | 코드 포맷팅, 줄바꿈, 공백 | `ruff format` / `prettier --write` |
| **lint-auto** | 자동 수정 가능한 린트 규칙 | `ruff check --fix` / `eslint --fix` |
| **type-annotation** | 누락된 타입 힌트 | 타입 어노테이션 추가 |
| **unused-import** | 사용하지 않는 import | import 문 제거 |
| **missing-return** | 누락된 return 문 | return 문 추가 |

### Non-Fixable (수동 개입 필요)

| 유형 | 설명 | 조치 |
|------|------|------|
| **logic-error** | 비즈니스 로직 오류 | 사용자에게 에스컬레이션 |
| **architecture** | 설계 수준 문제 | 아키텍처 재검토 필요 |
| **dependency** | 외부 의존성 문제 | 패키지 설치/업데이트 필요 |
| **env-config** | 환경 설정 문제 | 환경 변수/설정 파일 확인 |
| **test-logic** | 테스트 자체의 로직 오류 | 테스트 재설계 필요 |
| **security** | 보안 취약점 | 보안 리뷰 후 수정 |

---

## Step 4: 자동 수정 루프 (최대 3회)

```
Attempt {N}/3
├── 실패 항목 분석
├── Fixable 항목 자동 수정
├── 검증 파이프라인 재실행
├── 결과 확인
│   ├── 전부 PASS → 성공, 루프 탈출
│   ├── Fixable 남음 → 다음 attempt
│   └── Non-fixable만 남음 → 루프 탈출, 보고
└── Attempt 기록 저장
```

### Attempt별 전략 변경

| Attempt | 전략 |
|---------|------|
| 1차 | 직접 수정: 에러 메시지 기반으로 정확한 위치 수정 |
| 2차 | 대안 접근: 1차와 같은 방법이 실패하면 다른 접근법 시도 |
| 3차 | 보수적 수정: 최소한의 변경으로 통과시키되, 원본 의도 보존 |

### 동일 에러 반복 감지

- 동일 파일 + 동일 에러 메시지가 2회 연속 발생하면 **Non-fixable로 재분류**
- 다른 접근법이 필요하다는 것을 의미

---

## Step 5: 결과 보고

### 성공 시

```
[VERIFY-LOOP] 검증 완료 - PASS
================================
린트:     PASS
타입체크: PASS
테스트:   PASS ({passed}/{total})
빌드:     PASS
수정 횟수: {N}회 (attempt {M}에서 완료)
================================
```

### 부분 실패 시

```
[VERIFY-LOOP] 검증 완료 - PARTIAL
====================================
린트:     PASS (auto-fixed: {N} issues)
타입체크: FAIL ({N} errors)
테스트:   PASS ({passed}/{total})
빌드:     PASS

미해결 항목 (Non-fixable):
  1. [type-error] src/module.py:42 - Incompatible types in assignment
     분류: logic-error
     권장 조치: 타입 설계 재검토 필요

  2. [test-fail] tests/test_core.py::test_edge_case - AssertionError
     분류: test-logic
     권장 조치: 예상값 검토 필요
====================================
```

### 전체 실패 시

```
[VERIFY-LOOP] 검증 완료 - FAIL
================================
3회 시도 후에도 해결되지 않은 항목: {N}개

실패 이력:
  Attempt 1: {실패 항목 및 시도한 수정}
  Attempt 2: {실패 항목 및 시도한 수정}
  Attempt 3: {실패 항목 및 시도한 수정}

근본 원인 분석:
  {에러 패턴 분석 및 추정 원인}

권장 조치:
  1. {구체적인 수동 수정 가이드}
  2. {대안 접근법}
================================
```

---

## 에러 문서화

모든 검증 결과를 `.ai-auto/verify-log.jsonl`에 기록합니다.

```json
{
  "timestamp": "ISO-8601",
  "attempt": 1,
  "stage": "lint",
  "status": "fail",
  "errors": [
    {
      "file": "src/module.py",
      "line": 42,
      "code": "E501",
      "message": "line too long",
      "category": "fixable",
      "type": "lint-format"
    }
  ],
  "auto_fix_applied": true,
  "fix_description": "ruff format으로 자동 포맷팅"
}
```

---

## 금지 사항

- 테스트를 삭제하거나 skip 처리하여 통과시키지 않음
- assert 문을 약화시켜 통과시키지 않음 (`assert True` 등)
- 에러를 무시하는 `# type: ignore`, `# noqa` 주석을 무분별하게 추가하지 않음
- 린트 규칙 자체를 비활성화하지 않음
- Non-fixable 항목을 Fixable로 잘못 분류하지 않음
- 3회 실패 후 추가 시도 없이 반드시 보고
