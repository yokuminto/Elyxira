# build-prompt.ps1 — 将 medical_professor.txt 打包回 medical_professor.json
# 用法: pwsh scripts/build-prompt.ps1

$ErrorActionPreference = "Stop"

$txtPath = Join-Path $PSScriptRoot "..\public\prompts\medical_professor.txt"
$jsonPath = Join-Path $PSScriptRoot "..\public\prompts\medical_professor.json"

if (-not (Test-Path $txtPath)) {
    Write-Error "找不到 $txtPath"
    exit 1
}

$promptContent = Get-Content $txtPath -Raw -Encoding UTF8

# 去首尾空白但保留内部格式
$promptContent = $promptContent.Trim()

$json = @{
    name = "爱莉希雅"
    description = "医学带教教授 — 分层教学 + 题目标签"
    system_prompt = $promptContent
    temperature = 0.6
    top_p = 0.9
    frequency_penalty = 0.2
    presence_penalty = 0.1
}

$json | ConvertTo-Json -Depth 1 | Set-Content $jsonPath -Encoding UTF8

# 验证
$verify = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lines = ($verify.system_prompt -split '\n').Count
Write-Host "✅ 打包完成: $jsonPath ($lines 行, $($verify.system_prompt.Length) 字符)"
