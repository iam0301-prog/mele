$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Building MELE web..."
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  throw "MELE web build failed with exit code $LASTEXITCODE"
}

Write-Host "Build finished. Restarting web so Next.js serves the new chunks..."
& (Join-Path $PSScriptRoot "restart-web-3006.ps1")
