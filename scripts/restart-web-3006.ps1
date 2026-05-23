$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$port = 3006

function Wait-ForHttpOk {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 700
    }
  }
  return $false
}

Write-Host "Restarting MELE web on http://127.0.0.1:$port ..."

$connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
$processIds = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)

if (-not $processIds -or $processIds.Count -eq 0) {
  $processIds = @(
    netstat -ano |
      Select-String ":$port\s+.*LISTENING\s+(\d+)$" |
      ForEach-Object { [int]$_.Matches[0].Groups[1].Value } |
      Select-Object -Unique
  )
}

foreach ($processId in $processIds) {
  if ($processId -and $processId -gt 0) {
    Write-Host "Stopping process $processId on port $port"
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}

Start-Sleep -Seconds 1

$mode = if ($env:MELE_WEB_MODE -and $env:MELE_WEB_MODE.ToLowerInvariant() -eq "start") { "start" } else { "dev" }
$launcher = Join-Path $root "scripts\start-web-3006.cmd"
if (-not (Test-Path $launcher)) {
  throw "Web launcher not found: $launcher"
}

$env:MELE_WEB_MODE = $mode
$env:MELE_API_URL = if ($env:MELE_API_URL) { $env:MELE_API_URL } else { "http://127.0.0.1:8015" }
$env:NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE = if ($env:NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE) { $env:NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE } else { "true" }
$env:NEXT_TELEMETRY_DISABLED = "1"

$startCommand = "start ""Mele Web"" /min cmd.exe /k ""$launcher"""
& cmd.exe /c $startCommand

if (-not (Wait-ForHttpOk -Url "http://127.0.0.1:$port/manifest.json" -TimeoutSeconds 45)) {
  throw "MELE web did not become reachable on http://127.0.0.1:$port after starting $launcher"
}

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
$processId = if ($listener) { $listener.OwningProcess } else { "unknown" }
Write-Host "MELE web is ready: http://127.0.0.1:$port (PID $processId)"
