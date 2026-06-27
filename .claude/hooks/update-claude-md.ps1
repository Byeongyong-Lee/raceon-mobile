[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raw = [Console]::In.ReadToEnd()
$json = $raw | ConvertFrom-Json
$path = $json.tool_input.file_path
if ($path -and $path -notmatch 'CLAUDE\.md$') {
    $msg = 'You just modified a file. If this change adds/changes any of the following, update CLAUDE.md to match (RaceOn Mobile update rules): 새 화면 → 화면 목록 테이블; 네비게이션 구조 변경 → 네비게이션 구조 섹션; 라이브러리 설치/제거 → 기술 스택 섹션; 프로젝트 구조 변경 → 프로젝트 구조 트리; 새 개발 명령어 → 개발 명령어 섹션.'
    @{
        hookSpecificOutput = @{
            hookEventName     = 'PostToolUse'
            additionalContext = $msg
        }
    } | ConvertTo-Json -Compress
}
