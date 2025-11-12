# Stop All Services Script
# Usage: .\stop-all.ps1

Write-Host "Stopping LA_SE_SEM251 Services..." -ForegroundColor Red
Write-Host ""

function Stop-ServiceByTitle {
    param([string]$TitlePattern, [string]$Name)
    
    $processes = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitlePattern*" }
    
    if ($processes) {
        Write-Host "Stopping $Name..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped PID: $($_.Id)" -ForegroundColor Gray
        }
    } else {
        Write-Host "$Name not running" -ForegroundColor DarkGray
    }
}

Stop-ServiceByTitle -TitlePattern "SSO Server" -Name "SSO Server"
Stop-ServiceByTitle -TitlePattern "Datacore Server" -Name "Datacore Server"
Stop-ServiceByTitle -TitlePattern "TSS Backend" -Name "TSS Backend"
Stop-ServiceByTitle -TitlePattern "TSS Frontend" -Name "TSS Frontend"

Write-Host ""
Write-Host "Cleaning up Java processes..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*spring-boot*" -or $_.CommandLine -like "*mvnw*"
} | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
