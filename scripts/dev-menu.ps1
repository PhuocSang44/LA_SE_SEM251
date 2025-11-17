# Development Menu for LA_SE_SEM251
# Usage: .\dev-menu.ps1

function Show-MainMenu {
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host " LA_SE_SEM251 Development Control Panel  " -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  1. Start All Services" -ForegroundColor Green
    Write-Host "  2. Stop All Services" -ForegroundColor Red
    Write-Host "  3. Restart Single Service" -ForegroundColor Yellow
    Write-Host "  4. Check Service Status" -ForegroundColor Cyan
    Write-Host "  5. View Logs" -ForegroundColor Magenta
    Write-Host "  6. Clean Build (Maven)" -ForegroundColor DarkYellow
    Write-Host "  7. Open Dev Guide" -ForegroundColor Blue
    Write-Host "  8. Open Service URLs" -ForegroundColor DarkCyan
    Write-Host "  9. Exit" -ForegroundColor Gray
    Write-Host ""
}

function Open-BrowserURLs {
    Write-Host ""
    Write-Host "Opening service URLs..." -ForegroundColor Cyan
    Start-Process "http://localhost:10004"
    Start-Sleep -Milliseconds 500
    Write-Host "  Frontend: http://localhost:10004" -ForegroundColor Green
    Write-Host "  Backend:  http://localhost:10001" -ForegroundColor Gray
    Write-Host "  SSO:      http://localhost:10003" -ForegroundColor Gray
    Write-Host "  Datacore: http://localhost:10005" -ForegroundColor Gray
    Write-Host ""
    Pause
}

function Clean-Build {
    Write-Host ""
    Write-Host "Cleaning Maven builds..." -ForegroundColor Yellow
    Write-Host ""
    
    $projects = @("HCMUT-SSO-MIMIC", "HCMUT-DATACORE-MIMIC", "HCMUT-TSS-Backend")
    
    foreach ($project in $projects) {
        $projectPath = Join-Path $projectRoot $project
        Write-Host "Cleaning $project..." -ForegroundColor Gray
        Set-Location $projectPath
        & .\mvnw.cmd clean -q
        Write-Host "  $project cleaned" -ForegroundColor Green
    }
    
    Set-Location $projectRoot
    Write-Host ""
    Write-Host "All Maven projects cleaned!" -ForegroundColor Green
    Write-Host ""
    Pause
}

function Open-DevGuide {
    $devGuidePath = Join-Path $scriptDir "DEV_GUIDE.md"
    if (Test-Path $devGuidePath) {
        Start-Process $devGuidePath
        Write-Host "Opening Development Guide..." -ForegroundColor Blue
    } else {
        Write-Host "DEV_GUIDE.md not found!" -ForegroundColor Red
    }
    Start-Sleep -Seconds 1
}

$scriptDir = $PSScriptRoot
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

while ($true) {
    Show-MainMenu
    $choice = Read-Host "Select option (1-9)"
    
    switch ($choice) {
        "1" { Clear-Host; & "$scriptDir\start-all.ps1"; Write-Host ""; Pause }
        "2" { Clear-Host; & "$scriptDir\stop-all.ps1"; Write-Host ""; Pause }
        "3" { Clear-Host; & "$scriptDir\restart-service.ps1" }
        "4" { Clear-Host; & "$scriptDir\check-status.ps1"; Write-Host ""; Pause }
        "5" { Clear-Host; & "$scriptDir\view-logs.ps1" }
        "6" { Clean-Build }
        "7" { Open-DevGuide }
        "8" { Open-BrowserURLs }
        "9" { Write-Host ""; Write-Host "Goodbye!" -ForegroundColor Cyan; Write-Host ""; exit }
        default { Write-Host ""; Write-Host "Invalid choice. Select 1-9." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
}
