# View Logs Helper
# Usage: .\view-logs.ps1

$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Service Logs Viewer" -ForegroundColor Cyan
Write-Host ""
Write-Host "Each service runs in its own terminal window." -ForegroundColor Gray
Write-Host ""

Write-Host "Tips for viewing logs:" -ForegroundColor Yellow
Write-Host "  - Look for terminal windows titled:" -ForegroundColor Gray
Write-Host "    * 'SSO Server'" -ForegroundColor Cyan
Write-Host "    * 'Datacore Server'" -ForegroundColor Magenta
Write-Host "    * 'TSS Backend'" -ForegroundColor Yellow
Write-Host "    * 'TSS Frontend'" -ForegroundColor Green
Write-Host ""

Write-Host "Log files (if configured):" -ForegroundColor White
Write-Host "  - Spring Boot: target/spring-boot-app.log" -ForegroundColor Gray
Write-Host "  - Frontend: Console output in terminal" -ForegroundColor Gray
Write-Host ""

$showWindows = Read-Host "Show running service windows? (y/n)"

if ($showWindows -eq "y") {
    Write-Host ""
    Write-Host "Searching for service windows..." -ForegroundColor Yellow
    
    $windows = Get-Process | Where-Object { 
        $_.MainWindowTitle -like "*SSO Server*" -or
        $_.MainWindowTitle -like "*Datacore Server*" -or
        $_.MainWindowTitle -like "*TSS Backend*" -or
        $_.MainWindowTitle -like "*TSS Frontend*"
    }
    
    if ($windows) {
        Write-Host ""
        Write-Host "Running services:" -ForegroundColor Green
        $windows | ForEach-Object {
            Write-Host "  - $($_.MainWindowTitle) (PID: $($_.Id))" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "Click terminal windows to view logs" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "No service windows found." -ForegroundColor Red
        Write-Host "Run .\start-all.ps1 to start services." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
