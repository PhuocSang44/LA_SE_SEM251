# PowerShell Script to Add Sample PDF Files to Library
# Usage: .\add-sample-library-files.ps1 -PdfPath "path\to\file.pdf" -Title "Title" -CourseCode "MT1003"

param(
    [Parameter(Mandatory=$false)]
    [string]$PdfPath,

    [Parameter(Mandatory=$false)]
    [string]$Title,

    [Parameter(Mandatory=$false)]
    [string]$Description = "",

    [Parameter(Mandatory=$false)]
    [string]$CourseCode = "MT1003",

    [Parameter(Mandatory=$false)]
    [string]$Tags = "",

    [Parameter(Mandatory=$false)]
    [string]$Visibility = "PUBLIC",

    [Parameter(Mandatory=$false)]
    [string]$LibraryUrl = "http://localhost:10006"
)

function Show-Menu {
    Write-Host "`n=== Library File Upload Tool ===" -ForegroundColor Cyan
    Write-Host "1. Upload a PDF file"
    Write-Host "2. List existing library items"
    Write-Host "3. Exit"
    Write-Host "`n"
}

function Upload-File {
    param($FilePath, $FileTitle, $FileDescription, $FileCourseCode, $FileTags, $FileVisibility)

    if (-not (Test-Path $FilePath)) {
        Write-Host "Error: File not found at $FilePath" -ForegroundColor Red
        return
    }

    Write-Host "Uploading file: $FilePath" -ForegroundColor Yellow

    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $fileName = [System.IO.Path]::GetFileName($FilePath)

    $LF = "`r`n"
    $bodyLines = @()
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`""
    $bodyLines += "Content-Type: application/pdf"
    $bodyLines += ""

    $body = ($bodyLines -join $LF) + $LF
    $body += [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes) + $LF

    $bodyLines = @()
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"title`""
    $bodyLines += ""
    $bodyLines += $FileTitle
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"description`""
    $bodyLines += ""
    $bodyLines += $FileDescription
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"courseCode`""
    $bodyLines += ""
    $bodyLines += $FileCourseCode
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"tags`""
    $bodyLines += ""
    $bodyLines += $FileTags
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"visibility`""
    $bodyLines += ""
    $bodyLines += $FileVisibility
    $bodyLines += "--$boundary--"

    $body += ($bodyLines -join $LF)

    try {
        $response = Invoke-WebRequest -Uri "$LibraryUrl/api/library/items" `
            -Method POST `
            -ContentType "multipart/form-data; boundary=$boundary" `
            -Body ([System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($body))

        Write-Host "Success! File uploaded." -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "Error uploading file: $_" -ForegroundColor Red
    }
}

function Test-LibraryConnection {
    Write-Host "Checking library service connection..." -ForegroundColor Yellow
    $maxRetries = 3
    $retryCount = 0

    while ($retryCount -lt $maxRetries) {
        try {
            $null = Invoke-RestMethod -Uri "$LibraryUrl/api/library/items" -Method GET -TimeoutSec 5
            Write-Host "Library service is running!" -ForegroundColor Green
            return $true
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "Connection attempt $retryCount failed. Retrying..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            }
        }
    }

    Write-Host "Cannot connect to library service at $LibraryUrl" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "  1. Make sure library service is running" -ForegroundColor White
    Write-Host "  2. Wait 30-60 seconds for services to fully start" -ForegroundColor White
    Write-Host "  3. Check if port 10006 is available" -ForegroundColor White
    Write-Host ""
    return $false
}

function List-LibraryItems {
    param($SearchCourseCode)

    try {
        $url = "$LibraryUrl/api/library/items"
        if ($SearchCourseCode) {
            $url += "?courseCode=$SearchCourseCode"
        }

        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10

        if ($response.Count -eq 0) {
            Write-Host "No items found" -ForegroundColor Yellow
        } else {
            Write-Host "`nFound $($response.Count) item(s):" -ForegroundColor Green
            $response | ForEach-Object {
                Write-Host "  ID: $($_.id) | Title: $($_.title) | Course: $($_.courseCode) | File: $($_.originalName)" -ForegroundColor Cyan
            }
        }
    } catch {
        Write-Host "Error fetching items: $_" -ForegroundColor Red
    }
}

# Main script logic
if ($PdfPath -and $Title) {
    # Direct upload mode
    if (-not (Test-LibraryConnection)) {
        exit 1
    }
    Upload-File -FilePath $PdfPath -FileTitle $Title -FileDescription $Description -FileCourseCode $CourseCode -FileTags $Tags -FileVisibility $Visibility
} else {
    # Interactive mode
    Write-Host ""
    if (-not (Test-LibraryConnection)) {
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = Read-Host
        exit 1
    }
    Write-Host ""

    while ($true) {
        Show-Menu
        $choice = Read-Host "Select an option (1-3)"

        switch ($choice) {
            "1" {
                $file = Read-Host "Enter PDF file path"
                $title = Read-Host "Enter title"
                $desc = Read-Host "Enter description (optional)"
                $course = Read-Host "Enter course code (default: MT1003)"
                if (-not $course) { $course = "MT1003" }
                $fileTags = Read-Host "Enter tags (optional)"

                Upload-File -FilePath $file -FileTitle $title -FileDescription $desc -FileCourseCode $course -FileTags $fileTags -FileVisibility "PUBLIC"
            }
            "2" {
                $searchCourse = Read-Host "Enter course code to filter (or press Enter for all)"
                List-LibraryItems -SearchCourseCode $searchCourse
            }
            "3" {
                Write-Host "Exiting..." -ForegroundColor Cyan
                exit
            }
            default {
                Write-Host "Invalid option. Please select 1-3." -ForegroundColor Red
            }
        }

        Write-Host ""
        Read-Host "Press Enter to continue"
        Clear-Host
    }
}

