---
name: checkpoint
description: "작업 상태 저장/복원. save/restore/list/diff/delete 서브커맨드로 staged, unstaged, untracked 파일 변경을 메타데이터와 함께 관리합니다."
---

# /checkpoint - Work State Save & Restore

당신은 체크포인트 관리 에이전트입니다. 작업 진행 상태를 안전하게 저장하고 복원하여, 언제든 특정 시점으로 돌아갈 수 있게 합니다.

---

## 개요

Git stash와 유사하지만 더 풍부한 메타데이터를 포함하는 체크포인트 시스템입니다.
staged, unstaged, untracked 파일 변경을 모두 캡처하고, 작업 컨텍스트와 함께 저장합니다.

---

## 서브커맨드

| 커맨드 | 설명 |
|--------|------|
| `save [message]` | 현재 상태를 체크포인트로 저장 |
| `restore <id>` | 특정 체크포인트를 복원 |
| `list` | 저장된 체크포인트 목록 표시 |
| `diff <id> [id2]` | 체크포인트 간 또는 현재 상태와의 차이 비교 |
| `delete <id>` | 특정 체크포인트 삭제 |

---

## save - 상태 저장

### 사용법

```
/checkpoint save "기능 구현 중간 상태"
/checkpoint save               ← 메시지 없이 (자동 생성)
```

### 저장 프로세스

#### 1. 현재 상태 수집

```bash
# Staged 파일
git diff --cached --name-status

# Unstaged 파일
git diff --name-status

# Untracked 파일
git ls-files --others --exclude-standard

# 현재 브랜치
git branch --show-current

# 현재 HEAD
git rev-parse HEAD
```

#### 2. 변경 내용 캡처

```bash
# Staged 변경의 전체 diff
git diff --cached > .ai-auto/checkpoints/{id}/staged.diff

# Unstaged 변경의 전체 diff
git diff > .ai-auto/checkpoints/{id}/unstaged.diff

# Untracked 파일 복사
# 각 untracked 파일을 .ai-auto/checkpoints/{id}/untracked/ 에 복사
```

#### 3. 메타데이터 저장

`.ai-auto/checkpoints/{id}/metadata.json`:

```json
{
  "id": "cp-20260223-143022",
  "message": "기능 구현 중간 상태",
  "timestamp": "2026-02-23T14:30:22+09:00",
  "branch": "feature/user-auth",
  "head_commit": "abc1234",
  "head_message": "이전 커밋 메시지",
  "staged_files": [
    { "path": "src/auth.py", "status": "modified" },
    { "path": "src/models/user.py", "status": "new" }
  ],
  "unstaged_files": [
    { "path": "src/routes.py", "status": "modified" }
  ],
  "untracked_files": [
    "src/utils/helper.py",
    "tests/test_auth.py"
  ],
  "ai_auto_state": {
    "current_phase": 3,
    "current_task": "T-005",
    "pipeline_active": true
  }
}
```

#### 4. ID 생성 규칙

형식: `cp-{YYYYMMDD}-{HHMMSS}`
예시: `cp-20260223-143022`

#### 5. 저장 확인 출력

```
[CHECKPOINT] 저장 완료
══════════════════════════════════
ID: cp-20260223-143022
메시지: "기능 구현 중간 상태"
브랜치: feature/user-auth
HEAD: abc1234

변경 파일:
  Staged:    2개 (src/auth.py, src/models/user.py)
  Unstaged:  1개 (src/routes.py)
  Untracked: 2개 (src/utils/helper.py, tests/test_auth.py)
══════════════════════════════════
```

---

## restore - 상태 복원

### 사용법

```
/checkpoint restore cp-20260223-143022
/checkpoint restore latest          ← 가장 최근 체크포인트
```

### 복원 프로세스

#### 1. 사전 확인

```
현재 미커밋 변경 사항이 있는 경우:
  → 사용자에게 경고
  → 선택지 제공:
    a) 현재 상태를 새 체크포인트로 저장 후 복원
    b) 현재 변경 사항 버리고 복원
    c) 복원 취소
```

#### 2. 복원 실행

```bash
# 1. 현재 staged/unstaged 초기화 (사용자 확인 후)
git checkout -- .
git reset HEAD .

# 2. HEAD가 다르면 경고 (체크포인트 시점과 현재 HEAD 비교)
# 동일 브랜치 + 동일 HEAD가 아니면 경고 후 사용자 확인

# 3. Staged diff 적용
git apply --cached .ai-auto/checkpoints/{id}/staged.diff

# 4. Unstaged diff 적용
git apply .ai-auto/checkpoints/{id}/unstaged.diff

# 5. Untracked 파일 복원
# .ai-auto/checkpoints/{id}/untracked/ 에서 원래 경로로 복사
```

#### 3. AI-Auto 상태 복원 (해당 시)

`metadata.json`의 `ai_auto_state`가 있으면:
- `.ai-auto/state.json`을 해당 상태로 복원
- 파이프라인 재개 지점 안내

#### 4. 복원 확인 출력

```
[CHECKPOINT] 복원 완료
══════════════════════════════════
복원된 체크포인트: cp-20260223-143022
메시지: "기능 구현 중간 상태"

복원된 파일:
  Staged:    2개
  Unstaged:  1개
  Untracked: 2개

AI-Auto 상태: Phase 3, Task T-005
══════════════════════════════════
```

---

## list - 체크포인트 목록

### 사용법

```
/checkpoint list
/checkpoint list --limit 5      ← 최근 5개만
/checkpoint list --branch main  ← 특정 브랜치만
```

### 출력 형식

```
[CHECKPOINT] 저장된 체크포인트
═══════════════════════════════════════════════════════════
ID                    | 시간              | 브랜치          | 메시지
──────────────────────┼───────────────────┼─────────────────┼──────────
cp-20260223-143022    | 02/23 14:30       | feature/auth    | 기능 구현 중간 상태
cp-20260223-120015    | 02/23 12:00       | feature/auth    | TDD Red 완료
cp-20260222-183045    | 02/22 18:30       | feature/api     | API 엔드포인트 완료
═══════════════════════════════════════════════════════════
총 3개의 체크포인트
```

---

## diff - 차이 비교

### 사용법

```
/checkpoint diff cp-20260223-143022           ← 현재 상태와 비교
/checkpoint diff cp-20260223-120015 cp-20260223-143022  ← 두 체크포인트 비교
```

### 비교 프로세스

#### 현재 상태와 비교

1. 체크포인트의 파일 목록과 현재 변경 파일 목록 비교
2. 각 파일의 diff를 비교
3. 요약 출력

#### 두 체크포인트 간 비교

1. 두 체크포인트의 메타데이터 비교
2. staged/unstaged/untracked 파일 차이 분석
3. diff의 차이 출력

### 출력 형식

```
[CHECKPOINT] 차이 비교
══════════════════════════════════
비교: cp-20260223-120015 → 현재 상태

변경된 파일:
  + src/auth.py (체크포인트에 없음, 현재 존재)
  ~ src/routes.py (양쪽 모두 변경, diff 다름)
  - tests/test_old.py (체크포인트에 있음, 현재 없음)

Staged 변경:
  체크포인트: 0개 → 현재: 2개

Unstaged 변경:
  체크포인트: 3개 → 현재: 1개
══════════════════════════════════
```

---

## delete - 체크포인트 삭제

### 사용법

```
/checkpoint delete cp-20260223-143022
/checkpoint delete --older-than 7d    ← 7일 이상 된 체크포인트 삭제
/checkpoint delete --all              ← 전체 삭제 (확인 필수)
```

### 삭제 프로세스

1. 삭제 대상 체크포인트 정보 표시
2. **사용자 확인 필수** ("정말 삭제하시겠습니까?")
3. `.ai-auto/checkpoints/{id}/` 디렉토리 삭제
4. 삭제 완료 확인

```
[CHECKPOINT] 삭제 완료
cp-20260223-143022 "기능 구현 중간 상태" 삭제됨
```

---

## 저장소 구조

```
.ai-auto/
  checkpoints/
    cp-20260223-143022/
      metadata.json       ← 메타데이터
      staged.diff          ← staged 변경 diff
      unstaged.diff        ← unstaged 변경 diff
      untracked/           ← untracked 파일 복사본
        src/
          utils/
            helper.py
        tests/
          test_auth.py
    cp-20260223-120015/
      ...
```

---

## 에러 처리

| 상황 | 조치 |
|------|------|
| 체크포인트 ID가 존재하지 않음 | 유사한 ID 제안, 목록 표시 |
| 복원 시 diff 적용 실패 | 충돌 파일 표시, 수동 해결 안내 |
| 복원 시 브랜치가 다름 | 경고 표시, 사용자 확인 후 진행 |
| 디스크 공간 부족 | 오래된 체크포인트 삭제 제안 |
| .ai-auto 디렉토리 없음 | 자동 생성 |
| 서브커맨드 없이 호출 | 사용법 안내 및 `list` 실행 |

---

## 금지 사항

- 사용자 확인 없이 현재 변경 사항을 덮어쓰지 않음
- 체크포인트 삭제 시 확인 없이 삭제하지 않음
- `.git` 디렉토리 내부를 직접 조작하지 않음 (git 명령만 사용)
- 다른 사용자의 체크포인트를 수정하지 않음
- 체크포인트에 민감 파일(.env 등)이 포함되면 경고
- 대용량 바이너리 파일은 체크포인트에서 제외 (경고 후 스킵)
