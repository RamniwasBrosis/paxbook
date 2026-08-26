# Stops the portable local Postgres + Redis started by start-local-db.ps1.

$root = Resolve-Path (Join-Path $PSScriptRoot "..\.local-infra")
$pgBin = Join-Path $root "pgsql\bin"
$pgData = Join-Path $root "pgdata"

& "$pgBin\pg_ctl.exe" -D $pgData stop -m fast
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process
Write-Host "Stopped."
