# OmniConvert Setup Script for Windows PowerShell
$ErrorActionPreference = "Stop"

Write-Host "=== Setting up OmniConvert ===" -ForegroundColor Cyan

# 1. Check Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe") {
    $pythonCmd = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
} else {
    Write-Error "Python 3.11+ is required but not found in PATH or standard location."
}

Write-Host "[1/4] Using Python: $pythonCmd" -ForegroundColor Green

# 2. Setup Backend Virtual Environment
Set-Location "$PSScriptRoot\..\backend"
if (-not (Test-Path ".venv")) {
    Write-Host "[2/4] Creating virtual environment in backend/.venv..." -ForegroundColor Yellow
    & $pythonCmd -m venv .venv
} else {
    Write-Host "[2/4] Virtual environment backend/.venv already exists." -ForegroundColor Green
}

$venvPython = "$PSScriptRoot\..\backend\.venv\Scripts\python.exe"
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r requirements.txt

# 3. Setup Frontend
Set-Location "$PSScriptRoot\..\frontend"
Write-Host "[3/4] Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# 4. Done
Set-Location "$PSScriptRoot\.."
Write-Host "[4/4] OmniConvert setup complete! Run scripts/start.ps1 to start the application." -ForegroundColor Cyan
