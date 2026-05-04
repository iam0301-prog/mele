$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Running MELE local verification..."

Write-Host "1/3 TypeScript check"
& npm.cmd run type-check
if ($LASTEXITCODE -ne 0) {
  throw "TypeScript check failed with exit code $LASTEXITCODE"
}

Write-Host "2/3 Structure and API contract tests"
& npm.cmd test
if ($LASTEXITCODE -ne 0) {
  throw "Structure/API tests failed with exit code $LASTEXITCODE"
}

Write-Host "3/3 SQL migration checks"
& npm.cmd run test:sql
if ($LASTEXITCODE -ne 0) {
  throw "SQL tests failed with exit code $LASTEXITCODE"
}

Write-Host "Local verification passed."
