#!/usr/bin/env bash
# =============================================================================
# Ralph Loop - 테스트 통과까지 반복하는 자동 구현 스크립트
#
# 사용법:
#   ./ralph-loop.sh <max_iterations> [prompt_file]
#
# 인자:
#   max_iterations  최대 반복 횟수 (필수, 1-50)
#   prompt_file     프롬프트 파일 경로 (선택, 기본: stdin에서 읽기)
#
# 예시:
#   ./ralph-loop.sh 10 prompts/implement-order.txt
#   ./ralph-loop.sh 5
#
# 종료 조건:
#   - 모든 테스트 통과 (exit 0)
#   - 최대 반복 도달 (exit 1)
#   - 치명적 에러 (exit 2)
#   - 사용자 중단 Ctrl+C (exit 130)
#
# 로그:
#   ~/.claude/work-log/ralph-loop.jsonl
# =============================================================================

set -euo pipefail

# ─── 색상 정의 ───
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'  # No Color

# ─── 상수 ───
readonly WORK_LOG_DIR="${HOME}/.claude/work-log"
readonly LOG_FILE="${WORK_LOG_DIR}/ralph-loop.jsonl"
readonly STATE_FILE="${WORK_LOG_DIR}/ralph-loop-state.json"
readonly MAX_ALLOWED_ITERATIONS=50
readonly SAME_FAILURE_THRESHOLD=3

# ─── 유틸리티 함수 ───

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_phase() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 타임스탬프 생성 (ISO 8601)
timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# JSONL 로그 기록
write_log() {
    local iteration="$1"
    local tests_total="$2"
    local tests_passed="$3"
    local tests_failed="$4"
    local status="$5"
    local error_msg="${6:-}"

    local entry
    entry=$(cat <<EOF
{"timestamp": "$(timestamp)", "iteration": ${iteration}, "tests_total": ${tests_total}, "tests_passed": ${tests_passed}, "tests_failed": ${tests_failed}, "status": "${status}", "error": "${error_msg}"}
EOF
)
    echo "${entry}" >> "${LOG_FILE}"
}

# 상태 저장 (재개용)
save_state() {
    local iteration="$1"
    local status="$2"

    cat > "${STATE_FILE}" <<EOF
{"iteration": ${iteration}, "status": "${status}", "timestamp": "$(timestamp)", "prompt_file": "${PROMPT_FILE:-}", "max_iterations": ${MAX_ITERATIONS}}
EOF
}

# 이전 상태 로드 (재개용)
# --no-resume 플래그로 재개를 건너뛸 수 있음
load_state() {
    if [[ "${NO_RESUME:-false}" == "true" ]]; then
        echo "0"
        return
    fi

    if [[ -f "${STATE_FILE}" ]]; then
        local prev_iteration
        prev_iteration=$(python3 -c "import json; print(json.load(open('${STATE_FILE}'))['iteration'])" 2>/dev/null || echo "0")
        local prev_status
        prev_status=$(python3 -c "import json; print(json.load(open('${STATE_FILE}'))['status'])" 2>/dev/null || echo "unknown")

        if [[ "${prev_status}" == "in_progress" ]]; then
            log_warn "이전 실행이 중단된 상태입니다 (iteration ${prev_iteration})"
            if [[ -t 0 ]]; then
                # 인터랙티브 모드: 사용자에게 물어봄
                echo -n "이전 실행에서 재개하시겠습니까? (Y/n): "
                read -r answer
                if [[ "${answer}" != "n" && "${answer}" != "N" ]]; then
                    echo "${prev_iteration}"
                    return
                fi
            else
                # 비인터랙티브 모드 (파이프라인): 자동 재개
                log_info "비인터랙티브 모드: 자동 재개합니다"
                echo "${prev_iteration}"
                return
            fi
        fi
    fi
    echo "0"
}

# 테스트 실행 및 결과 파싱
run_tests() {
    local test_output
    local exit_code=0

    # pytest 실행 (짧은 출력, 첫 실패에서 중단하지 않음)
    test_output=$(pytest -q --tb=short 2>&1) || exit_code=$?

    # 결과 파싱
    local total=0
    local passed=0
    local failed=0

    # pytest 결과 라인 파싱: "X passed, Y failed" 또는 "X passed"
    if echo "${test_output}" | grep -qE "[0-9]+ passed"; then
        passed=$(echo "${test_output}" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
    fi
    if echo "${test_output}" | grep -qE "[0-9]+ failed"; then
        failed=$(echo "${test_output}" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+")
    fi
    if echo "${test_output}" | grep -qE "[0-9]+ error"; then
        local errors
        errors=$(echo "${test_output}" | grep -oE "[0-9]+ error" | grep -oE "[0-9]+")
        failed=$((failed + errors))
    fi

    total=$((passed + failed))

    # 결과를 환경 변수로 전달
    TESTS_TOTAL="${total}"
    TESTS_PASSED="${passed}"
    TESTS_FAILED="${failed}"
    TEST_OUTPUT="${test_output}"
    TEST_EXIT_CODE="${exit_code}"
}

# 동일 실패 횟수 추적
check_same_failure() {
    local current_output="$1"

    if [[ "${current_output}" == "${PREV_FAILURE_OUTPUT:-}" ]]; then
        SAME_FAILURE_COUNT=$((SAME_FAILURE_COUNT + 1))
    else
        SAME_FAILURE_COUNT=1
        PREV_FAILURE_OUTPUT="${current_output}"
    fi

    if [[ ${SAME_FAILURE_COUNT} -ge ${SAME_FAILURE_THRESHOLD} ]]; then
        return 1  # 동일 실패 임계값 도달
    fi
    return 0
}

# Ctrl+C 핸들러
cleanup() {
    echo ""
    log_warn "사용자에 의해 중단되었습니다"
    save_state "${CURRENT_ITERATION}" "interrupted"
    write_log "${CURRENT_ITERATION}" "${TESTS_TOTAL:-0}" "${TESTS_PASSED:-0}" "${TESTS_FAILED:-0}" "interrupted" "사용자 중단"
    exit 130
}

# ─── 인자 검증 ───

usage() {
    echo "사용법: $0 <max_iterations> [prompt_file]"
    echo ""
    echo "인자:"
    echo "  max_iterations  최대 반복 횟수 (1-${MAX_ALLOWED_ITERATIONS})"
    echo "  prompt_file     프롬프트 파일 경로 (선택)"
    echo ""
    echo "예시:"
    echo "  $0 10 prompts/implement-order.txt"
    echo "  $0 5"
    exit 1
}

if [[ $# -lt 1 ]]; then
    usage
fi

# 플래그 파싱
NO_RESUME=false
while [[ "$1" == --* ]]; do
    case "$1" in
        --no-resume) NO_RESUME=true; shift ;;
        *) log_error "알 수 없는 옵션: $1"; exit 1 ;;
    esac
done

MAX_ITERATIONS="$1"
PROMPT_FILE="${2:-}"

# max_iterations 검증
if ! [[ "${MAX_ITERATIONS}" =~ ^[0-9]+$ ]]; then
    log_error "max_iterations는 숫자여야 합니다: ${MAX_ITERATIONS}"
    exit 1
fi

if [[ ${MAX_ITERATIONS} -lt 1 || ${MAX_ITERATIONS} -gt ${MAX_ALLOWED_ITERATIONS} ]]; then
    log_error "max_iterations는 1-${MAX_ALLOWED_ITERATIONS} 범위여야 합니다: ${MAX_ITERATIONS}"
    exit 1
fi

# 프롬프트 파일 검증
if [[ -n "${PROMPT_FILE}" && ! -f "${PROMPT_FILE}" ]]; then
    log_error "프롬프트 파일을 찾을 수 없습니다: ${PROMPT_FILE}"
    exit 1
fi

# 프롬프트 로드
if [[ -n "${PROMPT_FILE}" ]]; then
    PROMPT=$(cat "${PROMPT_FILE}")
else
    log_info "프롬프트를 입력하세요 (Ctrl+D로 완료):"
    PROMPT=$(cat)
fi

if [[ -z "${PROMPT}" ]]; then
    log_error "프롬프트가 비어있습니다"
    exit 1
fi

# ─── 초기화 ───

# 작업 로그 디렉토리 생성
mkdir -p "${WORK_LOG_DIR}"

# Ctrl+C 핸들러 등록
trap cleanup INT TERM

# 상태 변수 초기화
CURRENT_ITERATION=0
SAME_FAILURE_COUNT=0
PREV_FAILURE_OUTPUT=""
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# ─── 이전 상태에서 재개 확인 ───

START_ITERATION=$(load_state)

# ─── 메인 루프 ───

log_phase "Ralph Loop 시작 (최대 ${MAX_ITERATIONS}회)"
log_info "프롬프트 길이: ${#PROMPT}자"
log_info "로그 파일: ${LOG_FILE}"

if [[ ${START_ITERATION} -gt 0 ]]; then
    log_info "Iteration ${START_ITERATION}부터 재개합니다"
fi

echo ""

for (( i=START_ITERATION+1; i<=MAX_ITERATIONS; i++ )); do
    CURRENT_ITERATION=${i}

    log_phase "Iteration ${i}/${MAX_ITERATIONS}"

    # ── Step 1: 현재 테스트 상태 확인 ──
    log_info "Step 1: 테스트 실행 중..."
    run_tests

    log_info "테스트 결과: ${TESTS_PASSED}/${TESTS_TOTAL} 통과, ${TESTS_FAILED} 실패"

    # 모든 테스트 통과 확인
    if [[ ${TEST_EXIT_CODE} -eq 0 && ${TESTS_FAILED} -eq 0 && ${TESTS_TOTAL} -gt 0 ]]; then
        log_success "모든 테스트 통과! (${TESTS_PASSED}/${TESTS_TOTAL})"
        write_log "${i}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "completed"
        save_state "${i}" "completed"

        log_phase "Ralph Loop 완료 - 성공 (${i}회 반복)"
        exit 0
    fi

    # 테스트가 하나도 없는 경우
    if [[ ${TESTS_TOTAL} -eq 0 ]]; then
        log_warn "실행된 테스트가 없습니다. 테스트 파일을 확인하세요."
        write_log "${i}" "0" "0" "0" "no_tests" "테스트 없음"
    fi

    # ── Step 2: 동일 실패 반복 체크 ──
    if ! check_same_failure "${TEST_OUTPUT}"; then
        log_error "동일한 실패가 ${SAME_FAILURE_THRESHOLD}회 반복되었습니다. 접근 방식을 변경합니다."
        write_log "${i}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "same_failure_escalation"

        # 에스컬레이션: 접근 방식 변경 지시를 프롬프트에 추가
        PROMPT="${PROMPT}

[에스컬레이션] 동일한 실패가 ${SAME_FAILURE_THRESHOLD}회 반복되었습니다.
이전 접근 방식이 효과가 없으므로, 완전히 다른 접근 방식을 시도하세요.
실패 내역:
${TEST_OUTPUT}"
        SAME_FAILURE_COUNT=0
    fi

    # ── Step 3: claude 호출하여 구현/수정 ──
    log_info "Step 3: Claude에게 구현/수정 요청 중..."

    local_prompt="${PROMPT}

현재 테스트 결과:
- 통과: ${TESTS_PASSED}/${TESTS_TOTAL}
- 실패: ${TESTS_FAILED}

실패한 테스트 출력:
${TEST_OUTPUT}

위 실패를 분석하고 수정하세요. 모든 테스트가 통과해야 합니다."

    # claude 실행 (권한 스킵 모드)
    local claude_exit_code=0
    claude --dangerously-skip-permissions -p "${local_prompt}" 2>&1 || claude_exit_code=$?

    if [[ ${claude_exit_code} -ne 0 ]]; then
        log_error "Claude 실행 실패 (exit code: ${claude_exit_code})"
        write_log "${i}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "claude_error" "exit code ${claude_exit_code}"

        # 치명적 에러 판단
        if [[ ${claude_exit_code} -gt 1 ]]; then
            log_error "치명적 에러 발생. Ralph Loop를 중단합니다."
            save_state "${i}" "critical_error"
            exit 2
        fi
    fi

    # ── Step 4: 구현 후 테스트 재실행 ──
    log_info "Step 4: 구현 후 테스트 재실행 중..."
    run_tests

    log_info "테스트 결과: ${TESTS_PASSED}/${TESTS_TOTAL} 통과, ${TESTS_FAILED} 실패"

    # 모든 테스트 통과 확인
    if [[ ${TEST_EXIT_CODE} -eq 0 && ${TESTS_FAILED} -eq 0 && ${TESTS_TOTAL} -gt 0 ]]; then
        log_success "모든 테스트 통과! (${TESTS_PASSED}/${TESTS_TOTAL})"
        write_log "${i}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "completed"
        save_state "${i}" "completed"

        log_phase "Ralph Loop 완료 - 성공 (${i}회 반복)"
        exit 0
    fi

    # ── Step 5: 진행 기록 ──
    write_log "${i}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "in_progress"
    save_state "${i}" "in_progress"

    log_info "Iteration ${i} 완료. 다음 반복으로 진행합니다."
done

# ─── 최대 반복 도달 ───

log_phase "Ralph Loop 종료 - 최대 반복 도달 (${MAX_ITERATIONS}회)"

log_error "최대 반복 횟수에 도달했습니다."
log_error "마지막 테스트 결과: ${TESTS_PASSED}/${TESTS_TOTAL} 통과, ${TESTS_FAILED} 실패"
log_error ""
log_error "에스컬레이션이 필요합니다:"
log_error "  1. 실패 로그 확인: ${LOG_FILE}"
log_error "  2. 테스트 전략 재검토"
log_error "  3. 아키텍처 수준 변경 고려"

write_log "${MAX_ITERATIONS}" "${TESTS_TOTAL}" "${TESTS_PASSED}" "${TESTS_FAILED}" "max_iterations_reached"
save_state "${MAX_ITERATIONS}" "max_iterations_reached"

exit 1
