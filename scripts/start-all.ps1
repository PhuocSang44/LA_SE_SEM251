# Start All Services Script for LA_SE_SEM251
# Usage: .\start-all.ps1

Write-Host "Starting LA_SE_SEM251 Development Environment..." -ForegroundColor Green
Write-Host ""

function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    $scriptBlock = @"
`$Host.UI.RawUI.WindowTitle = '$Name'
Set-Location '$Path'
Write-Host '$Name is starting...' -ForegroundColor $Color
$Command
Write-Host '$Name stopped. Press any key to close...' -ForegroundColor Red
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    Start-Sleep -Milliseconds 500
}

$projectRoot = Split-Path -Parent $PSScriptRoot

Start-Service -Name "SSO Server" -Path "$projectRoot\HCMUT-SSO-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Cyan"
Start-Sleep -Seconds 3

Start-Service -Name "Datacore Server" -Path "$projectRoot\HCMUT-DATACORE-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Magenta"
Start-Sleep -Seconds 3

Start-Service -Name "TSS Backend" -Path "$projectRoot\HCMUT-TSS-Backend" -Command ".\mvnw.cmd spring-boot:run" -Color "Yellow"
Start-Sleep -Seconds 3

Start-Service -Name "TSS Frontend" -Path "$projectRoot\HCMUT-TSS-Frontend" -Command "npm run dev" -Color "Green"

Write-Host ""
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor White
Write-Host "  - SSO Server      - Check terminal window" -ForegroundColor Cyan
Write-Host "  - Datacore Server - Check terminal window" -ForegroundColor Magenta
Write-Host "  - TSS Backend     - Check terminal window" -ForegroundColor Yellow
Write-Host "  - TSS Frontend    - http://localhost:10004" -ForegroundColor Green
Write-Host ""
Write-Host "Tip: Close terminal windows to stop services" -ForegroundColor Gray
Write-Host "To stop all: .\stop-all.ps1" -ForegroundColor Gray
