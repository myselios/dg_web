---
name: dg_init
description: 대화형 인터뷰를 통해 PRD를 자동 생성하고, 프로젝트를 초기 설정한 뒤 /ai-auto 파이프라인으로 연결합니다.
user_facing: true
---

# /dg_init — 대화형 PRD 생성기

## 개요

사용자에게 단계별로 질문하여 고품질 PRD(prd.json)를 자동 생성합니다.
prd.json을 직접 작성할 필요 없이, 대화만으로 프로젝트를 시작할 수 있습니다.

## 실행 조건

- 현재 디렉토리가 프로젝트 루트여야 합니다
- prd.json이 이미 존재하면, 기존 파일을 수정할지 새로 만들지 물어봅니다

---

## 인터뷰 프로세스 (7단계)

**반드시 한 번에 하나의 질문만 합니다. 여러 질문을 한꺼번에 던지지 마세요.**
**사용자의 답변이 짧거나 모호하면, 구체적인 선택지를 제시하여 도와주세요.**

### Step 1: 비전 (What)

```
"안녕하세요! 새 프로젝트를 시작하겠습니다.

어떤 것을 개발하고 싶으세요? 자유롭게 설명해주세요.
(예: 암호화폐 자동 매매 봇, 블로그 플랫폼, API 서버 등)"
```

→ 사용자의 답변에서 핵심 키워드를 추출합니다.
→ 이해가 부족하면 **후속 질문** 합니다:
  - "좀 더 구체적으로, 이 프로젝트의 최종 목표는 무엇인가요?"
  - "이 프로젝트를 사용하는 사람은 누구인가요?"

### Step 2: 기술 스택 (How)

**먼저 현재 프로젝트 디렉토리를 스캔합니다:**
- `requirements.txt`, `pyproject.toml` → Python
- `package.json` → Node.js/TypeScript
- `go.mod` → Go
- `Cargo.toml` → Rust
- `docker-compose.yml`, `Dockerfile` → Docker
- 데이터베이스 설정 파일 탐지

**감지된 스택이 있으면:**
```
"기존 프로젝트에서 다음 기술을 감지했습니다:
- 언어: Python 3.11
- 프레임워크: FastAPI
- DB: PostgreSQL

이 스택으로 계속 진행할까요, 아니면 변경하고 싶은 부분이 있나요?"
```

**감지된 스택이 없으면:**
```
"어떤 기술 스택을 사용할까요?

1. Python (FastAPI / Django / Flask)
2. TypeScript (Next.js / Express / NestJS)
3. Go
4. 기타 (직접 입력)

주요 언어/프레임워크를 알려주세요."
```

→ 후속: "데이터베이스는 어떤 것을 사용하나요? (PostgreSQL / MongoDB / SQLite / Redis / 없음)"

### Step 3: 핵심 기능 (Features)

Step 1의 답변을 분석하여 **AI가 기능 후보를 자동 생성**합니다.

```
"[프로젝트명]에 필요한 기능을 정리해봤습니다:

1. ✅ [핵심 기능 A] — (설명)
2. ✅ [핵심 기능 B] — (설명)
3. ⬜ [추가 기능 C] — (설명)
4. ⬜ [추가 기능 D] — (설명)
5. ⬜ [추가 기능 E] — (설명)

필수 기능(✅)은 맞나요? 추가하거나 빼고 싶은 기능이 있으면 알려주세요.
(예: '3번 추가, 2번 제거', '전부 좋아', '6. 알림 기능 추가')"
```

→ 사용자 선택에 따라 기능 목록 확정

### Step 4: 사용자 스토리 (Who & Why)

확정된 각 기능에 대해 **AI가 사용자 스토리 초안을 제안**합니다.

```
"각 기능의 사용자 스토리를 작성했습니다:

[기능 A]
  → 사용자로서, [행동]을 하여 [가치]를 얻고 싶다

[기능 B]
  → 관리자로서, [행동]을 하여 [가치]를 얻고 싶다

수정이 필요한 스토리가 있나요? 없으면 '좋아'라고 해주세요."
```

→ 사용자가 수정 요청하면 해당 스토리만 업데이트
→ 기능이 5개 이상이면 **2~3개씩 나누어** 확인합니다

### Step 5: 수락 기준 (Done means)

각 스토리에 대해 **테스트 가능한 수락 기준**을 AI가 제안합니다.

```
"[기능 A]의 완료 기준을 정리했습니다:

1. [구체적이고 테스트 가능한 조건]
2. [예상 입출력이 명확한 조건]
3. [엣지 케이스 조건]

추가하거나 수정할 기준이 있나요?"
```

**수락 기준 작성 규칙:**
- 반드시 테스트로 검증 가능해야 함
- "잘 동작한다" 같은 모호한 기준 금지
- 구체적인 입력 → 출력 형태가 바람직함
- 에러 케이스도 포함

### Step 6: 제약조건 & 비기능 요구사항 (Constraints)

```
"마지막으로 비기능 요구사항을 확인합니다:

📊 성능: 응답 시간 제한이 있나요? (예: API 200ms 이내)
🔒 보안: 인증이 필요한가요? 민감한 데이터를 다루나요?
📈 확장성: 동시 사용자 수 예상치가 있나요?
🧪 테스트: 특별한 테스트 요구사항이 있나요? (기본: 80% 커버리지)

해당하는 것만 알려주세요. 특별한 것 없으면 '기본값'이라고 해주세요."
```

→ "기본값" 응답 시:
  - performance: "응답 시간 < 200ms"
  - security: "기본 인증 적용"
  - testing: "커버리지 80% 이상"

### Step 7: 확인 & 생성

모든 정보를 종합하여 **최종 요약**을 보여줍니다.

```
"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRD 최종 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 프로젝트: [이름]
🎯 목표: [한 줄 목표]

🛠 기술 스택: [언어] + [프레임워크] + [DB]

📝 스토리 [N]개:
  S1. [스토리 제목] (우선순위: 높음)
      수락기준: [N]개
  S2. [스토리 제목] (우선순위: 중간)
      수락기준: [N]개
  ...

📐 스케일 예상: [S/M/L]
  → 에이전트 [N]개, Ralph Loop [N]회

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이대로 prd.json을 생성할까요?
수정할 부분이 있으면 알려주세요."
```

---

## PRD 생성

사용자가 승인하면:

1. **prd.json 생성**: 수집된 정보를 ai_automation PRD v1 형식으로 변환
2. **스토리 우선순위 자동 배정**: 의존성 기반으로 priority 1, 2, 3...
3. **의존성 자동 추론**: 스토리 간 관계를 분석하여 dependencies 필드 채움
4. **scale_override**: null (자동 판단에 맡김)

### PRD 생성 형식

```json
{
  "$schema": "ai_automation PRD v1",
  "project_name": "[프로젝트명]",
  "goal": "[목표]",
  "tech_stack": {
    "language": "[언어]",
    "framework": "[프레임워크]",
    "database": "[DB]",
    "infrastructure": ["[인프라]"]
  },
  "context": {
    "existing_patterns": "[기존 코드 분석 결과]",
    "constraints": "[제약조건]"
  },
  "stories": [
    {
      "id": "S1",
      "title": "[스토리 제목]",
      "description": "As a [역할], I want [기능] so that [이유]",
      "acceptance_criteria": ["기준1", "기준2"],
      "priority": 1,
      "dependencies": []
    }
  ],
  "non_functional": {
    "performance": "[성능 요구]",
    "security": "[보안 요구]",
    "testing": "[테스트 요구]"
  },
  "scale_override": null
}
```

---

## Phase B: 환경 설정 (자연스러운 이어짐)

PRD가 생성되면 **끊김 없이** 환경 설정으로 전환합니다.

```
"prd.json 생성 완료! 이제 개발 환경을 세팅하겠습니다."
```

### Step 8: 외부 서비스 감지

PRD의 `tech_stack`과 스토리에서 **외부 서비스/인프라를 자동 추출**합니다.

**감지 대상:**

| 카테고리 | 서비스 | 필요한 정보 |
|----------|--------|-------------|
| DB | PostgreSQL, MySQL, MongoDB | host, port, user, password, db_name |
| DB (BaaS) | Firebase, Supabase, PlanetScale | project_id, api_key, url |
| 인증 | Firebase Auth, Auth0, Clerk | client_id, secret, domain |
| 스토리지 | S3, GCS, Cloudinary | bucket, access_key, secret_key |
| API | OpenAI, Stripe, Twilio | api_key |
| 캐시 | Redis, Memcached | host, port, password |
| 메시지 | Kafka, RabbitMQ, SQS | broker_url, credentials |
| 모니터링 | Sentry, Datadog | dsn, api_key |
| 배포 | Vercel, Railway, Fly.io | api_token |

**감지된 서비스를 사용자에게 확인:**

```
"PRD를 분석한 결과, 다음 외부 서비스가 필요합니다:

1. 🔥 Firebase (인증 + Firestore DB)
2. 🔑 OpenAI API (AI 기능)
3. 📦 Redis (캐싱)

맞나요? 추가하거나 빼고 싶은 서비스가 있나요?"
```

→ 사용자 확인 후 다음 단계로 진행

### Step 9: 인증 정보 입력

확정된 각 서비스에 대해 **하나씩** 필요한 정보를 물어봅니다.

```
"Firebase 설정을 진행합니다.

Firebase Project ID를 알려주세요.
(Firebase Console > 프로젝트 설정에서 확인)
아직 없으면 '나중에'라고 해주세요."
```

**핵심 규칙:**
- 한 서비스씩 순서대로 물어봄 (한꺼번에 X)
- 각 서비스당 필수 정보만 물어봄 (선택 정보는 기본값)
- "나중에" / "스킵" → 해당 항목은 `TODO_REPLACE` 플레이스홀더로 설정
- "모르겠어" → 해당 서비스의 공식 문서 링크를 안내

**입력 순서 (서비스별):**

```
Firebase 예시:
  1. "Firebase Project ID?" → my-app-12345
  2. "Firebase API Key?" → AIzaSy...
  3. "Firestore 사용?" → 예 (자동 설정)

PostgreSQL 예시:
  1. "DB가 로컬인가요, 클라우드인가요?" → 로컬
  2. (로컬) "포트는 기본값(5432)? " → ㅇ
  3. "DB 이름?" → myapp_db
  4. "유저/패스워드?" → postgres / 1234

OpenAI 예시:
  1. "OpenAI API Key?" → sk-proj-...
  2. "기본 모델?" → gpt-4o (기본값 제안)
```

### Step 10: 환경 파일 생성

모든 정보 수집 후 **3개 파일을 자동 생성**합니다.

**1. `.env` (실제 값 — 절대 커밋하지 않음)**
```env
# Auto-generated by /dg_init
# ⚠️ 이 파일은 절대 git에 커밋하지 마세요

# Firebase
FIREBASE_PROJECT_ID=my-app-12345
FIREBASE_API_KEY=AIzaSy...

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**2. `.env.example` (플레이스홀더 — 팀원용)**
```env
# 프로젝트 환경 변수 템플릿
# .env로 복사한 뒤 실제 값을 입력하세요

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**3. `.gitignore` 업데이트**
```
# 기존 .gitignore에 추가 (이미 있으면 스킵)
.env
.env.local
.env.*.local
```

### Step 11: 프로젝트 구조 생성

기술 스택에 맞는 **Clean Architecture 디렉토리 구조**를 자동 생성합니다.

**Python 프로젝트 예시:**
```
src/
├── domain/           # 엔티티, 값 객체, 비즈니스 규칙
│   ├── entities/
│   └── value_objects/
├── application/      # 유스케이스, 포트(인터페이스)
│   ├── use_cases/
│   └── ports/
├── infrastructure/   # 외부 연결 (DB, API, Firebase)
│   ├── repositories/
│   ├── external/     # 외부 API 클라이언트
│   └── config.py     # .env 로드 + 설정 관리
├── presentation/     # API 엔드포인트
│   └── api/
└── main.py
tests/
├── unit/
├── integration/
└── conftest.py
```

**TypeScript/Next.js 예시:**
```
src/
├── domain/
├── application/
├── infrastructure/
├── presentation/
│   └── app/          # Next.js App Router
└── lib/
    └── config.ts     # .env 로드 + 설정 관리
```

**config 파일 자동 생성:**

`.env`에 정의된 변수들을 타입 안전하게 로드하는 설정 파일을 생성합니다.

```python
# src/infrastructure/config.py (Python 예시)
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class FirebaseConfig:
    project_id: str
    api_key: str

@dataclass(frozen=True)
class AppConfig:
    firebase: FirebaseConfig

    @classmethod
    def from_env(cls) -> "AppConfig":
        return cls(
            firebase=FirebaseConfig(
                project_id=os.environ["FIREBASE_PROJECT_ID"],
                api_key=os.environ["FIREBASE_API_KEY"],
            )
        )
```

---

## Phase C: 완료 & 파이프라인 연결

모든 설정이 끝나면 **최종 요약**을 보여줍니다.

```
"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  프로젝트 초기화 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PRD: prd.json (스토리 5개, 스케일 M)
🔧 환경: .env (Firebase, OpenAI, Redis 설정됨)
📁 구조: Clean Architecture (Python/FastAPI)

⚠️ TODO 항목 (나중에 입력 필요):
  - REDIS_PASSWORD (.env 라인 12)

다음 단계:
  /ai-auto  → 전체 자동 파이프라인 실행
  /plan     → 계획 단계만 먼저 실행

바로 /ai-auto를 실행할까요?"
```

→ 사용자가 "응" / "좋아" / "ㅇ" 등 긍정 응답 시 → `/ai-auto` 자동 실행
→ 사용자가 "아니" / "나중에" 등 부정 응답 시 → 대기

### TODO_REPLACE 항목 처리

`/ai-auto` 실행 시, `.env`에 `TODO_REPLACE` 값이 있으면:

```
"⚠️ .env에 아직 설정되지 않은 항목이 있습니다:
  - REDIS_PASSWORD (라인 12)

이 항목 없이도 개발을 시작할 수 있지만,
해당 기능 구현 시 필요합니다.

1. 지금 입력하기
2. 나중에 하고 일단 시작

어떻게 할까요?"
```

---

## 기존 prd.json이 있을 때

```
"이미 prd.json이 존재합니다.

1. 기존 PRD 수정 (추가/변경)
2. 새로 만들기 (기존 파일 백업 후 재생성)
3. 기존 PRD로 바로 /ai-auto 실행

어떻게 할까요?"
```

---

## 질문 품질 가이드라인

**좋은 질문:**
- 구체적인 선택지를 제공 (객관식)
- 한 번에 하나의 주제만
- 사용자 답변을 반영하여 다음 질문 조정

**나쁜 질문:**
- "기능을 모두 나열해주세요" (너무 개방적)
- "아키텍처를 어떻게 할까요?" (전문 지식 요구)
- 한 번에 5개 질문 (과부하)

**원칙:**
- Claude가 초안을 제안 → 사용자가 확인/수정
- 사용자가 모르면 Claude가 베스트 프랙티스로 결정
- "기본값으로 할게요"는 항상 유효한 답변
