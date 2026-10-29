# OmniConvert Launch Script for Windows PowerShell
Write-Host "=== Launching OmniConvert ===" -ForegroundColor Cyan

$backendPath = "$PSScriptRoot\..\backend"
$frontendPath = "$PSScriptRoot\..\frontend"

Write-Host "Starting Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendJob = Start-Process -FilePath "$backendPath\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -WorkingDirectory $backendPath -PassThru

Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location $frontendPath
try {
    npm run dev
} finally {
    Write-Host "Stopping backend..." -ForegroundColor Yellow
    if ($backendJob -and -not $backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force
    }
}
