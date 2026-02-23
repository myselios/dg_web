#!/usr/bin/env bash
# =============================================================================
# Setup Project - ai_automation 프레임워크용 프로젝트 초기 설정
#
# 사용법:
#   ./setup-project.sh [project_name]
#
# 기능:
#   1. prd.json 템플릿 생성
#   2. .claude/ 로컬 설정 디렉토리 생성
#   3. 환경 검증 (node, python, git, claude)
#   4. 시작 가이드 출력
#
# 예시:
#   ./setup-project.sh my-trading-bot
#   ./setup-project.sh
# =============================================================================

set -euo pipefail

# ─── 색상 정의 ───
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# ─── 유틸리티 함수 ───

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

check_command() {
    local cmd="$1"
    local name="$2"
    local required="${3:-true}"

    if command -v "${cmd}" &> /dev/null; then
        local version
        version=$("${cmd}" --version 2>&1 | head -1) || version="버전 확인 불가"
        log_success "${name}: ${version}"
        return 0
    else
        if [[ "${required}" == "true" ]]; then
            log_error "${name}: 설치되지 않음 (필수)"
        else
            log_warn "${name}: 설치되지 않음 (선택)"
        fi
        return 1
    fi
}

# ─── 인자 처리 ───

PROJECT_NAME="${1:-$(basename "$(pwd)")}"
PROJECT_DIR="$(pwd)"

log_header "ai_automation 프로젝트 설정: ${PROJECT_NAME}"

# ─── Step 1: 환경 검증 ───

log_header "Step 1: 환경 검증"

ENV_OK=true

# 필수 도구
if ! check_command "git" "Git" "true"; then
    ENV_OK=false
fi

if ! check_command "python3" "Python" "true"; then
    # python으로도 시도
    if ! check_command "python" "Python" "true"; then
        ENV_OK=false
    fi
fi

# Claude CLI (필수)
if ! check_command "claude" "Claude CLI" "true"; then
    ENV_OK=false
    log_info "Claude CLI 설치: npm install -g @anthropic-ai/claude-code"
fi

# 선택 도구
check_command "node" "Node.js" "false"
check_command "npm" "npm" "false"
check_command "docker" "Docker" "false"
check_command "gh" "GitHub CLI" "false"

# pytest 확인
if python3 -c "import pytest" 2>/dev/null; then
    local_pytest_version=$(python3 -c "import pytest; print(pytest.__version__)")
    log_success "pytest: ${local_pytest_version}"
else
    log_warn "pytest: 설치되지 않음 (pip install pytest)"
fi

# ruff 확인
check_command "ruff" "ruff (린터)" "false"

# mypy 확인
if python3 -c "import mypy" 2>/dev/null; then
    log_success "mypy: 설치됨"
else
    log_warn "mypy: 설치되지 않음 (pip install mypy)"
fi

if [[ "${ENV_OK}" == "false" ]]; then
    log_error "필수 도구가 누락되었습니다. 설치 후 다시 실행하세요."
    exit 1
fi

# ─── Step 2: PRD 템플릿 생성 ───
# 참고: /dg_init 커맨드가 대화형으로 PRD를 생성합니다.
# 이 스크립트는 /dg_init 없이 수동 설정할 때 사용됩니다.

log_header "Step 2: PRD 템플릿 생성"

PRD_FILE="${PROJECT_DIR}/prd.json"

if [[ -f "${PRD_FILE}" ]]; then
    log_warn "prd.json이 이미 존재합니다. 덮어쓰지 않습니다."
else
    cat > "${PRD_FILE}" <<'TEMPLATE'
{
  "$schema": "ai_automation PRD v1",
  "project_name": "PROJECT_NAME_PLACEHOLDER",
  "goal": "프로젝트의 최종 목표를 한 문장으로",
  "tech_stack": {
    "language": "python",
    "framework": "",
    "database": "",
    "infrastructure": []
  },
  "context": {
    "existing_patterns": "",
    "constraints": ""
  },
  "stories": [
    {
      "id": "S1",
      "title": "스토리 제목",
      "description": "As a [역할], I want [행동] so that [가치]",
      "acceptance_criteria": [
        "조건 1: 구체적이고 테스트 가능한 조건",
        "조건 2: 예상 입출력이 명확한 조건"
      ],
      "priority": 1,
      "dependencies": []
    }
  ],
  "non_functional": {
    "performance": "응답 시간 < 200ms",
    "security": "인증/권한 필수",
    "testing": "커버리지 80% 이상"
  },
  "scale_override": null
}
TEMPLATE

    # 프로젝트 이름 치환
    sed -i "s/PROJECT_NAME_PLACEHOLDER/${PROJECT_NAME}/g" "${PRD_FILE}"

    log_success "prd.json 템플릿 생성 완료: ${PRD_FILE}"
fi

# ─── Step 3: .claude/ 로컬 설정 ───

log_header "Step 3: .claude/ 로컬 설정"

CLAUDE_DIR="${PROJECT_DIR}/.claude"

if [[ -d "${CLAUDE_DIR}" ]]; then
    log_warn ".claude/ 디렉토리가 이미 존재합니다."
else
    mkdir -p "${CLAUDE_DIR}"
    log_success ".claude/ 디렉토리 생성 완료"
fi

# CLAUDE.md 로컬 설정 파일
CLAUDE_MD="${PROJECT_DIR}/CLAUDE.md"

if [[ -f "${CLAUDE_MD}" ]]; then
    log_warn "CLAUDE.md가 이미 존재합니다. 덮어쓰지 않습니다."
else
    cat > "${CLAUDE_MD}" <<CLAUDEMD
# ${PROJECT_NAME} - Claude Code 설정

## 프로젝트 개요
- **이름**: ${PROJECT_NAME}
- **설명**: (프로젝트 설명을 추가하세요)
- **언어**: Python

## 규칙 참조
이 프로젝트는 ai_automation 프레임워크 규칙을 따릅니다:
- coding-style.md: 불변성, 파일/함수 크기 제한
- clean-architecture.md: 레이어 분리, 의존성 방향
- security.md: 8대 보안 검사
- testing.md: TDD, 80%+ 커버리지
- performance.md: asyncio 최적화, 캐싱
- golden-principles.md: 7대 핵심 원칙

## 프로젝트 구조
\`\`\`
src/
  domain/        # 엔티티, 값 객체 (외부 의존성 없음)
  application/   # 유스케이스, 포트
  infrastructure/ # 어댑터, DB, 외부 API
  presentation/  # API 라우터, CLI
tests/
  unit/          # 단위 테스트
  integration/   # 통합 테스트
  e2e/           # E2E 테스트
\`\`\`

## 명령어
\`\`\`bash
# 테스트
pytest -q

# 린트
ruff check src/

# 타입 체크
mypy src/

# 전체 검증
pytest -q && ruff check src/ && mypy src/
\`\`\`

## 에이전트 사용
- \`planner\`: 기능 계획
- \`architect\`: 아키텍처 설계
- \`tdd-guide\`: TDD 안내
- \`code-reviewer\`: 코드 리뷰
- \`security-reviewer\`: 보안 리뷰
CLAUDEMD

    log_success "CLAUDE.md 생성 완료: ${CLAUDE_MD}"
fi

# .gitignore 업데이트
GITIGNORE="${PROJECT_DIR}/.gitignore"

if [[ -f "${GITIGNORE}" ]]; then
    # .env가 이미 포함되어 있는지 확인
    if ! grep -q "^\.env$" "${GITIGNORE}" 2>/dev/null; then
        cat >> "${GITIGNORE}" <<'GITIGNORE_APPEND'

# ai_automation
.env
.env.local
.env.production
__pycache__/
*.pyc
.mypy_cache/
.pytest_cache/
.ruff_cache/
.coverage
htmlcov/
GITIGNORE_APPEND
        log_success ".gitignore 업데이트 완료"
    else
        log_info ".gitignore에 이미 .env가 포함되어 있습니다"
    fi
else
    cat > "${GITIGNORE}" <<'GITIGNORE_NEW'
# 환경/시크릿
.env
.env.local
.env.production

# Python
__pycache__/
*.pyc
*.pyo
.mypy_cache/
.pytest_cache/
.ruff_cache/
.coverage
htmlcov/
*.egg-info/
dist/
build/
.venv/
venv/

# Node
node_modules/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
GITIGNORE_NEW
    log_success ".gitignore 생성 완료"
fi

# ─── Step 4: 디렉토리 구조 생성 (선택) ───

log_header "Step 4: 프로젝트 디렉토리 구조"

create_structure() {
    local dirs=(
        "src/domain/entities"
        "src/domain/value_objects"
        "src/domain/services"
        "src/application/use_cases"
        "src/application/ports"
        "src/application/dto"
        "src/infrastructure/repositories"
        "src/infrastructure/external"
        "src/infrastructure/config"
        "src/presentation/api"
        "tests/unit/domain"
        "tests/unit/application"
        "tests/integration"
        "tests/e2e"
    )

    for dir in "${dirs[@]}"; do
        if [[ ! -d "${PROJECT_DIR}/${dir}" ]]; then
            mkdir -p "${PROJECT_DIR}/${dir}"
            # __init__.py 생성 (Python 패키지)
            if [[ "${dir}" == src/* || "${dir}" == tests/* ]]; then
                touch "${PROJECT_DIR}/${dir}/__init__.py"
            fi
        fi
    done

    # conftest.py 생성
    if [[ ! -f "${PROJECT_DIR}/tests/conftest.py" ]]; then
        cat > "${PROJECT_DIR}/tests/conftest.py" <<'CONFTEST'
"""공유 테스트 fixtures."""

import pytest
CONFTEST
    fi

    log_success "Clean Architecture 디렉토리 구조 생성 완료"
}

# src/ 디렉토리가 없으면 구조 생성
if [[ ! -d "${PROJECT_DIR}/src" ]]; then
    if [[ -t 0 ]]; then
        # 인터랙티브 모드: 사용자에게 물어봄
        echo -n "Clean Architecture 디렉토리 구조를 생성하시겠습니까? (Y/n): "
        read -r answer
        if [[ "${answer}" != "n" && "${answer}" != "N" ]]; then
            create_structure
        else
            log_info "디렉토리 구조 생성을 건너뜁니다."
        fi
    else
        # 비인터랙티브 모드 (파이프라인): 자동 생성
        log_info "비인터랙티브 모드: 디렉토리 구조를 자동 생성합니다"
        create_structure
    fi
else
    log_info "src/ 디렉토리가 이미 존재합니다. 구조 생성을 건너뜁니다."
fi

# ─── Step 5: Getting Started 가이드 ───

log_header "설정 완료! 시작 가이드"

cat <<GUIDE

  ${BOLD}${PROJECT_NAME} 프로젝트가 준비되었습니다!${NC}

  ${CYAN}1. PRD 작성${NC}
     prd.json을 열어 프로젝트 요구사항을 작성하세요:
     ${BLUE}\$ code prd.json${NC}

  ${CYAN}2. ai-automation 파이프라인 실행${NC}
     PRD를 기반으로 전체 파이프라인을 실행합니다:
     ${BLUE}\$ claude -p "ai-automation 스킬을 사용하여 prd.json을 구현해주세요"${NC}

  ${CYAN}3. Ralph Loop 단독 실행${NC}
     테스트 통과까지 반복 구현:
     ${BLUE}\$ ./scripts/ralph-loop.sh 10 prompts/my-task.txt${NC}

  ${CYAN}4. 개별 에이전트 사용${NC}
     ${BLUE}\$ claude -p "planner 에이전트로 prd.json을 분석해주세요"${NC}
     ${BLUE}\$ claude -p "tdd-guide 에이전트로 Order 엔티티 테스트를 작성해주세요"${NC}
     ${BLUE}\$ claude -p "code-reviewer 에이전트로 src/를 리뷰해주세요"${NC}

  ${CYAN}5. 테스트 실행${NC}
     ${BLUE}\$ pytest -q${NC}
     ${BLUE}\$ pytest --cov=src --cov-report=term${NC}

  ${CYAN}생성된 파일:${NC}
     prd.json          PRD 템플릿
     CLAUDE.md         Claude Code 로컬 설정
     .gitignore        Git 제외 규칙
     .claude/          Claude 설정 디렉토리

  ${CYAN}규칙 파일 위치:${NC}
     ~/ai_automation/rules/            규칙 파일들
     ~/ai_automation/skills/           스킬 정의
     ~/ai_automation/scripts/          자동화 스크립트

GUIDE
