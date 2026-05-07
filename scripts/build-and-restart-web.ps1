$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:MELE_API_URL) {
  $env:MELE_API_URL = "http://127.0.0.1:8015"
}

if (-not $env:NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE) {
  $env:NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE = "true"
}

$env:MELE_WEB_MODE = "start"

Write-Host "Building MELE web..."
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  throw "MELE web build failed with exit code $LASTEXITCODE"
}

Write-Host "Build finished. Restarting web so Next.js serves the new chunks..."
& (Join-Path $PSScriptRoot "restart-web-3006.ps1")
