# Starts the portable, no-install Postgres + Redis used for local development.
# Both run as plain background processes (no Windows service, no admin rights).

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\.local-infra")
$pgBin = Join-Path $root "pgsql\bin"
$pgData = Join-Path $root "pgdata"
$pgLog = Join-Path $root "pg.log"
$redisHome = Join-Path $root "redis"
$redisLog = Join-Path $root "redis.log"

# --- Postgres ---
$pgStatus = & "$pgBin\pg_ctl.exe" -D $pgData status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Postgres already running."
} else {
    Write-Host "Starting Postgres..."
    & "$pgBin\pg_ctl.exe" -D $pgData -l $pgLog -o "-p 5432" start
    Start-Sleep -Seconds 2
}

# --- Redis ---
$redisRunning = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
if ($redisRunning) {
    Write-Host "Redis already running."
} else {
    Write-Host "Starting Redis..."
    Start-Process -FilePath (Join-Path $redisHome "redis-server.exe") `
        -ArgumentList "--port 6379 --save `"`"" `
        -WindowStyle Hidden `
        -RedirectStandardOutput $redisLog
    Start-Sleep -Seconds 1
}

Write-Host "Postgres: localhost:5432 (db: paxbook, user: paxbook)"
Write-Host "Redis:    localhost:6379"
