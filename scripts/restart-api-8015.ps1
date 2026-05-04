$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$port = 8015
$startScript = Join-Path $PSScriptRoot "start-python-api-8015.cmd"

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

& cmd.exe /c "start `"Mele API`" /min cmd.exe /k $startScript"

Write-Host "MELE Python API is starting: http://127.0.0.1:$port"
