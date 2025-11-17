# Start All Services in VS Code Terminals
# Usage: .\start-all-vscode.ps1 (run from VS Code terminal)

Write-Host "Starting LA_SE_SEM251 Development Environment in VS Code..." -ForegroundColor Green
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# Check if running in VS Code
if (-not $env:TERM_PROGRAM -eq "vscode") {
    Write-Host "Warning: This script is designed to run in VS Code terminal." -ForegroundColor Yellow
    Write-Host "It may not work correctly outside VS Code." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit }
}

Write-Host "Creating VS Code terminals for each service..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "  1. Four new terminals will be created in VS Code" -ForegroundColor Gray
Write-Host "  2. Each terminal will run a service" -ForegroundColor Gray
Write-Host "  3. Use Terminal dropdown to switch between them" -ForegroundColor Gray
Write-Host "  4. Press Ctrl+C in each terminal to stop services" -ForegroundColor Gray
Write-Host ""

# Create VS Code tasks.json for terminals
$tasksJson = @"
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start SSO Server",
            "type": "shell",
            "command": "cd HCMUT-SSO-MIMIC; .\\mvnw.cmd spring-boot:run",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "new",
                "focus": false
            },
            "isBackground": true
        },
        {
            "label": "Start Datacore Server",
            "type": "shell",
            "command": "cd HCMUT-DATACORE-MIMIC; .\\mvnw.cmd spring-boot:run",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "new",
                "focus": false
            },
            "isBackground": true
        },
        {
            "label": "Start TSS Backend",
            "type": "shell",
            "command": "cd HCMUT-TSS-Backend; .\\mvnw.cmd spring-boot:run",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "new",
                "focus": false
            },
            "isBackground": true
        },
        {
            "label": "Start TSS Frontend",
            "type": "shell",
            "command": "cd HCMUT-TSS-Frontend; npm run dev",
            "problemMatcher": [],
            "presentation": {
                "reveal": "always",
                "panel": "new",
                "focus": false
            },
            "isBackground": true
        },
        {
            "label": "Start All Services",
            "dependsOn": [
                "Start SSO Server",
                "Start Datacore Server",
                "Start TSS Backend",
                "Start TSS Frontend"
            ],
            "problemMatcher": []
        }
    ]
}
"@

# Ensure .vscode directory exists
$vscodeDir = Join-Path $projectRoot ".vscode"
if (-not (Test-Path $vscodeDir)) {
    New-Item -ItemType Directory -Path $vscodeDir | Out-Null
    Write-Host "Created .vscode directory" -ForegroundColor Gray
}

# Write tasks.json
$tasksPath = Join-Path $vscodeDir "tasks.json"
$tasksJson | Out-File -FilePath $tasksPath -Encoding UTF8
Write-Host "Created VS Code tasks configuration" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Manual Steps Required" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start all services in VS Code terminals:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Press Ctrl+Shift+P (Command Palette)" -ForegroundColor Cyan
Write-Host "  2. Type: Tasks: Run Task" -ForegroundColor Cyan
Write-Host "  3. Select: Start All Services" -ForegroundColor Cyan
Write-Host ""
Write-Host "OR start services individually:" -ForegroundColor White
Write-Host "  - Start SSO Server" -ForegroundColor Gray
Write-Host "  - Start Datacore Server" -ForegroundColor Gray
Write-Host "  - Start TSS Backend" -ForegroundColor Gray
Write-Host "  - Start TSS Frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "Tip: You can also use Terminal menu -> Run Task..." -ForegroundColor Gray
Write-Host ""

Write-Host "Configuration complete! Follow the steps above to start." -ForegroundColor Green
