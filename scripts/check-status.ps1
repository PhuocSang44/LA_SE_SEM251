# Check Service Status
# Usage: .\check-status.ps1

Write-Host "Checking Service Status..." -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param([string]$Hostname = "localhost", [int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($Hostname, $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

function Check-Service {
    param([string]$Name, [int]$Port, [string]$Url)
    
    $status = Test-Port -Port $Port
    
    if ($status) {
        Write-Host "[OK] $Name" -ForegroundColor Green -NoNewline
        Write-Host " - Running on port $Port" -ForegroundColor Gray
        if ($Url) {
            Write-Host "     $Url" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "[--] $Name" -ForegroundColor Red -NoNewline
        Write-Host " - Not running (port: $Port)" -ForegroundColor Gray
    }
}

Write-Host "Service Status:" -ForegroundColor White
Write-Host ""

Check-Service -Name "TSS Backend     " -Port 10001 -Url "http://localhost:10001/api"
Check-Service -Name "SSO Server      " -Port 10003 -Url "http://localhost:10003"
Check-Service -Name "TSS Frontend    " -Port 10004 -Url "http://localhost:10004"
Check-Service -Name "Datacore Server " -Port 10005 -Url "http://localhost:10005"

Write-Host ""
Write-Host "If not running, use: .\start-all.ps1" -ForegroundColor Gray
