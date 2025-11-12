# Restart Single Service
# Usage: .\restart-service.ps1 [service-name]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "sso", "datacore", "frontend", IgnoreCase=$true)]
    [string]$Service
)

$projectRoot = Split-Path -Parent $PSScriptRoot

function Show-Menu {
    Write-Host "Restart Single Service" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. TSS Backend (Port 10001)"
    Write-Host "2. SSO Server (Port 10003)"
    Write-Host "3. Datacore Server (Port 10005)"
    Write-Host "4. TSS Frontend (Port 10004)"
    Write-Host "5. Exit"
    Write-Host ""
}

function Restart-Service {
    param([string]$Name, [string]$TitlePattern, [string]$Path, [string]$Command, [string]$Color)
    
    Write-Host "Stopping $Name..." -ForegroundColor Yellow
    
    $processes = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitlePattern*" }
    if ($processes) {
        $processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
        Write-Host "  Stopped" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  Service not running" -ForegroundColor DarkGray
    }
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    
    $scriptBlock = @"
`$Host.UI.RawUI.WindowTitle = '$TitlePattern'
Set-Location '$Path'
Write-Host '$Name is restarting...' -ForegroundColor $Color
$Command
Write-Host '$Name stopped. Press any key to close...' -ForegroundColor Red
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
    Write-Host "  Started in new window" -ForegroundColor Green
}

if ($Service) {
    switch ($Service.ToLower()) {
        "backend"  { Restart-Service -Name "TSS Backend" -TitlePattern "TSS Backend" -Path "$projectRoot\HCMUT-TSS-Backend" -Command ".\mvnw.cmd spring-boot:run" -Color "Yellow" }
        "sso"      { Restart-Service -Name "SSO Server" -TitlePattern "SSO Server" -Path "$projectRoot\HCMUT-SSO-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Cyan" }
        "datacore" { Restart-Service -Name "Datacore Server" -TitlePattern "Datacore Server" -Path "$projectRoot\HCMUT-DATACORE-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Magenta" }
        "frontend" { Restart-Service -Name "TSS Frontend" -TitlePattern "TSS Frontend" -Path "$projectRoot\HCMUT-TSS-Frontend" -Command "npm run dev" -Color "Green" }
    }
    return
}

while ($true) {
    Show-Menu
    $choice = Read-Host "Select service (1-5)"
    
    switch ($choice) {
        "1" { Restart-Service -Name "TSS Backend" -TitlePattern "TSS Backend" -Path "$projectRoot\HCMUT-TSS-Backend" -Command ".\mvnw.cmd spring-boot:run" -Color "Yellow"; break }
        "2" { Restart-Service -Name "SSO Server" -TitlePattern "SSO Server" -Path "$projectRoot\HCMUT-SSO-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Cyan"; break }
        "3" { Restart-Service -Name "Datacore Server" -TitlePattern "Datacore Server" -Path "$projectRoot\HCMUT-DATACORE-MIMIC" -Command ".\mvnw.cmd spring-boot:run" -Color "Magenta"; break }
        "4" { Restart-Service -Name "TSS Frontend" -TitlePattern "TSS Frontend" -Path "$projectRoot\HCMUT-TSS-Frontend" -Command "npm run dev" -Color "Green"; break }
        "5" { Write-Host "Goodbye!" -ForegroundColor Gray; return }
        default { Write-Host "Invalid choice." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
    
    Write-Host ""
    $continue = Read-Host "Restart another? (y/n)"
    if ($continue -ne "y") { break }
    Clear-Host
}
