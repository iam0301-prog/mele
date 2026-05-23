$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$port = 8015

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

Write-Host "Restarting MELE Python API on http://127.0.0.1:$port ..."

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

$launcher = Join-Path $root "scripts\start-python-api-8015.cmd"
if (-not (Test-Path $launcher)) {
  throw "API launcher not found: $launcher"
}

$env:PYTHONPATH = "$root\.py312-packages;$root\python_api"
$env:PYTHONIOENCODING = "utf-8"

$startCommand = "start ""Mele API"" /min cmd.exe /k ""$launcher"""
& cmd.exe /c $startCommand

if (-not (Wait-ForHttpOk -Url "http://127.0.0.1:$port/health" -TimeoutSeconds 45)) {
  throw "MELE Python API did not become reachable on http://127.0.0.1:$port after starting $launcher"
}

$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
$processId = if ($listener) { $listener.OwningProcess } else { "unknown" }
Write-Host "MELE Python API is ready: http://127.0.0.1:$port (PID $processId)"
