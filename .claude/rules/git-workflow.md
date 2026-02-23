# Git 워크플로우 규칙

## 커밋 메시지 형식

```
[타입] 제목 (50자 이내)

본문 (선택, 72자 줄바꿈)
- 무엇을 변경했는지
- 왜 변경했는지

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 타입 목록

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 추가 | `[feat] 사용자 인증 API 추가` |
| `fix` | 버그 수정 | `[fix] 토큰 만료 시 갱신 실패 수정` |
| `refactor` | 리팩토링 (동작 변경 없음) | `[refactor] 주문 서비스 클린 아키텍처 적용` |
| `docs` | 문서 변경 | `[docs] API 엔드포인트 문서 업데이트` |
| `test` | 테스트 추가/수정 | `[test] 주문 생성 통합 테스트 추가` |
| `chore` | 빌드, 설정 변경 | `[chore] Docker 설정 업데이트` |
| `perf` | 성능 개선 | `[perf] DB 쿼리 인덱스 최적화` |
| `ci` | CI/CD 변경 | `[ci] GitHub Actions 워크플로우 추가` |

---

## 브랜치 전략

```
main (프로덕션 - 보호됨)
  └── develop (개발 통합)
       ├── feature/<기능명>    # 새 기능
       ├── fix/<버그명>        # 버그 수정
       └── refactor/<대상>     # 리팩토링
```

### 브랜치 생성 규칙

```bash
# 기능 브랜치
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 버그 수정 브랜치
git checkout develop
git checkout -b fix/token-refresh-failure

# 리팩토링 브랜치
git checkout develop
git checkout -b refactor/order-service-clean-arch
```

### 브랜치 병합 흐름

```
feature/xxx → develop (PR + 리뷰)
fix/xxx     → develop (PR + 리뷰)
develop     → main    (릴리스 PR + QA 통과)
```

---

## PR 체크리스트

PR 생성 전 반드시 확인:

- [ ] 모든 테스트 통과 (`pytest -q` / `npx vitest run`)
- [ ] 린트 통과 (`ruff check` / `eslint`)
- [ ] 타입 체크 통과 (`mypy` / `tsc --noEmit`)
- [ ] 커버리지 80% 이상
- [ ] 리뷰어 지정
- [ ] 관련 이슈 연결 (closes #xxx)
- [ ] 커밋 메시지 형식 준수
- [ ] 불필요한 파일 미포함 (.env, node_modules, __pycache__)

### PR 본문 형식

```markdown
## Summary
- 변경 사항 요약 (1-3줄)

## Changes
- 구체적인 변경 목록

## Test Plan
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 확인
- [ ] 수동 테스트 시나리오

## Related Issues
- closes #123
```

---

## 금지 사항

### 절대 금지

- **main/master에 직접 push 금지** - 항상 PR을 통해 병합
- **force push 금지** - `git push --force` 사용 금지 (특별한 경우 제외)
- **대용량 바이너리 커밋 금지** - Git LFS 또는 외부 스토리지 사용
- **.env 파일 커밋 금지** - .gitignore에 반드시 포함
- **시크릿 커밋 금지** - API 키, 비밀번호 등

### 주의 사항

- 커밋은 하나의 논리적 변경 단위로 유지
- WIP 커밋은 squash 후 병합
- merge commit보다 rebase 선호 (히스토리 정리)

---

## 자동화 커밋 흐름

ai_automation 프레임워크에서 자동 커밋 시:

```bash
# 1. 변경 사항 확인
git status
git diff --staged

# 2. 최근 커밋 스타일 확인
git log --oneline -5

# 3. 스테이징 (특정 파일만)
git add src/module/changed_file.py tests/test_changed.py

# 4. 커밋 (HEREDOC 사용)
git commit -m "$(cat <<'EOF'
[feat] 주문 서비스 구현

- OrderService 클래스 추가
- 주문 생성/조회/취소 로직 구현
- 단위 테스트 추가 (coverage 85%)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 5. 푸시
git push origin feature/order-service
```
