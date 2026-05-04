$ErrorActionPreference = "Stop"

& (Join-Path $PSScriptRoot "restart-api-8015.ps1")
& (Join-Path $PSScriptRoot "restart-web-3006.ps1")

Write-Host "Local MELE stack is restarting."
Write-Host "Web: http://127.0.0.1:3006"
Write-Host "API: http://127.0.0.1:8015"
