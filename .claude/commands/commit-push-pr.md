---
name: commit-push-pr
description: "10단계 커밋/푸시/PR 워크플로우. 사전 검사, 빌드/테스트/린트/보안 검증, 구조화된 PR 생성, 머지 전략까지 포함합니다."
---

# /commit-push-pr - 10-Step Commit, Push & PR Workflow

당신은 코드 커밋부터 PR 생성까지의 전체 워크플로우를 관리합니다. 각 단계에 품질 게이트를 적용하여 안전한 코드 전달을 보장합니다.

---

## 개요

변경 사항을 안전하게 커밋하고, 원격에 푸시하고, 구조화된 PR을 생성합니다.
10단계 각각에 품질 게이트가 있으며, 실패 시 진행을 중단합니다.

---

## Step 1: 사전 상태 검사

### 체크 항목

```bash
# 현재 브랜치 확인
git branch --show-current

# main/master가 아닌지 확인
# main/master에 있으면 즉시 중단하고 브랜치 생성 안내

# 미커밋 변경 사항 확인
git status

# 원격 동기화 상태 확인
git fetch origin
git status -sb
```

### main/master 브랜치 보호

**현재 브랜치가 main 또는 master인 경우:**
1. 즉시 중단
2. 적절한 브랜치명을 제안:
   - `feature/{기능명}` (새 기능)
   - `fix/{버그명}` (버그 수정)
   - `refactor/{대상}` (리팩토링)
3. 브랜치 생성 및 전환 후 진행

### 게이트 조건
- main/master 브랜치가 아닐 것
- 변경 사항이 1개 이상 존재할 것

---

## Step 2: 변경 사항 분석

1. `git diff`로 변경 내용 확인
2. `git diff --cached`로 스테이지된 변경 확인
3. 변경 파일을 카테고리별로 분류:

```
소스 코드: {N}개 파일
테스트: {N}개 파일
설정: {N}개 파일
문서: {N}개 파일
```

4. 민감 파일 탐지:
   - `.env`, `.env.*` 파일
   - `*credentials*`, `*secret*`, `*token*` 파일
   - `*.pem`, `*.key` 파일
   - 하드코딩된 API 키 패턴 (`sk-`, `ghp_`, `AKIA` 등)

**민감 파일 발견 시:** 즉시 경고하고 해당 파일을 커밋 대상에서 제외

---

## Step 3: 린트 검증

프로젝트의 린터를 실행합니다.

```
린트 도구 감지 → 실행 → 결과 확인
```

| 결과 | 조치 |
|------|------|
| PASS | 다음 단계로 |
| WARN | 경고 표시 후 계속 |
| FAIL (auto-fixable) | 자동 수정 후 재검증 |
| FAIL (manual) | 중단, 수정 필요 항목 표시 |

**게이트 조건:** 린트 에러 0개

---

## Step 4: 타입 체크 검증

프로젝트의 타입 체커를 실행합니다.

| 결과 | 조치 |
|------|------|
| PASS | 다음 단계로 |
| FAIL | 중단, 타입 에러 목록 표시 |
| N/A | 스킵 (타입 체커 미설정) |

**게이트 조건:** 타입 에러 0개 (타입 체커가 있는 경우)

---

## Step 5: 테스트 실행

```bash
# 프로젝트 테스트 명령 실행
# pytest / npm test / make test 등
```

| 결과 | 조치 |
|------|------|
| ALL PASS | 다음 단계로 |
| FAIL | 중단, 실패 테스트 목록 표시 |
| NO TESTS | 경고 표시 후 계속 (테스트 미작성) |

**게이트 조건:** 모든 테스트 통과

---

## Step 6: 빌드 검증 (해당 시)

빌드 스크립트가 있는 경우에만 실행합니다.

```bash
# npm run build / make build / docker build 등
```

**게이트 조건:** 빌드 성공 (빌드 스크립트가 있는 경우)

---

## Step 7: 보안 검사

### 검사 항목

1. **시크릿 스캔:** 코드에 하드코딩된 시크릿이 없는지 확인
   - 정규식 패턴으로 API 키, 토큰, 비밀번호 탐색
   - `.env` 파일이 `.gitignore`에 포함되어 있는지 확인

2. **취약성 스캔 (도구가 있는 경우):**
   - Python: `bandit -r src/`
   - Node.js: `npm audit`
   - 범용: `semgrep --config auto`

| 결과 | 조치 |
|------|------|
| PASS | 다음 단계로 |
| WARN (low/medium) | 경고 표시 후 계속 |
| FAIL (high/critical) | 중단, 보안 이슈 표시 (Human Checkpoint) |

**게이트 조건:** critical 보안 이슈 0개

---

## Step 8: 커밋 생성

### 커밋 메시지 생성

변경 내용을 분석하여 Conventional Commits 형식으로 메시지 생성:

```
[타입] 제목 (50자 이내)

본문 (선택, 72자 줄바꿈)
- 무엇을 변경했는지
- 왜 변경했는지

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 타입 자동 결정

| 변경 내용 | 타입 |
|-----------|------|
| 새 기능 추가 | `feat` |
| 버그 수정 | `fix` |
| 리팩토링 | `refactor` |
| 테스트 추가/수정 | `test` |
| 문서 변경 | `docs` |
| 빌드/설정 변경 | `chore` |
| 스타일 변경 (기능 무관) | `style` |

### 스테이징 및 커밋

```bash
# 파일별로 명시적으로 스테이징 (git add -A 사용 금지)
git add src/module.py tests/test_module.py

# 커밋 (HEREDOC 사용)
git commit -m "$(cat <<'EOF'
[feat] 사용자 인증 기능 추가

- JWT 기반 토큰 발급/검증 구현
- 로그인/로그아웃 API 엔드포인트 추가
- 비밀번호 해싱 및 검증 로직 구현

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Step 9: 푸시

```bash
# 원격 브랜치 존재 여부 확인
git ls-remote --heads origin $(git branch --show-current)

# 푸시 (upstream 설정)
git push -u origin $(git branch --show-current)
```

**충돌 발생 시:**
1. `git pull --rebase origin $(git branch --show-current)`
2. 충돌 해결
3. 테스트 재실행 (Step 5로 돌아감)
4. 다시 푸시

**절대 `--force` 사용 금지** (사용자가 명시적으로 요청한 경우에만)

---

## Step 10: PR 생성

### PR 제목 생성

- 70자 이내
- 변경의 핵심을 요약
- 타입 프리픽스 포함

### PR 본문 생성

```markdown
## Summary
- {변경 사항 1}
- {변경 사항 2}
- {변경 사항 3}

## Changes
| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| src/auth.py | 신규 | JWT 인증 모듈 |
| tests/test_auth.py | 신규 | 인증 테스트 |

## Test Results
- 전체 테스트: {passed}/{total} PASS
- 커버리지: {N}%
- 린트: PASS
- 타입체크: PASS

## Acceptance Criteria
- [x] {충족된 조건}
- [x] {충족된 조건}

## Related
- Story: {story_id} (해당 시)
- Issue: #{issue_number} (해당 시)

---
Generated with AI Automation Framework
```

### PR 생성 명령

```bash
gh pr create \
  --title "[feat] 사용자 인증 기능 추가" \
  --body "$(cat <<'EOF'
## Summary
...PR body...
EOF
)"
```

### 머지 전략 선택

| 상황 | 머지 전략 |
|------|-----------|
| 단일 커밋 | Squash merge |
| 논리적 커밋 분리 | Rebase merge |
| 기본 | Squash merge |

**PR 머지는 자동으로 실행하지 않음.** 사용자에게 PR URL을 제공하고 리뷰 후 머지를 안내합니다.

---

## 전체 워크플로우 요약

```
Step  1: 사전 상태 검사    ──── GATE: 브랜치 확인
Step  2: 변경 사항 분석    ──── GATE: 민감 파일 없음
Step  3: 린트 검증         ──── GATE: 에러 0개
Step  4: 타입 체크 검증    ──── GATE: 에러 0개
Step  5: 테스트 실행       ──── GATE: 전체 통과
Step  6: 빌드 검증         ──── GATE: 빌드 성공
Step  7: 보안 검사         ──── GATE: critical 0개
Step  8: 커밋 생성         ──── conventional commits
Step  9: 푸시              ──── upstream 설정
Step 10: PR 생성           ──── 구조화된 PR body
```

---

## 금지 사항

- main/master 브랜치에 직접 커밋 금지
- `git add -A` 또는 `git add .` 사용 금지 (파일 명시적 지정)
- `git push --force` 금지 (명시적 요청 없이)
- `.env` 파일 커밋 금지
- 민감 정보(API 키, 토큰, 비밀번호) 커밋 금지
- 테스트 실패 상태로 커밋 금지
- PR을 자동으로 머지하지 않음
- `--no-verify` 옵션 사용 금지
