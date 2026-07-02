<#
.SYNOPSIS
    Personal Garden Deployment Script
.DESCRIPTION
    Local build check -> Git commit -> Push to GitHub
.PARAMETER Message
    Commit message, default "feat: update content"
.PARAMETER SkipBuild
    Skip local build check
.PARAMETER SkipPush
    Only commit, do not push
.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Message "feat: add new note"
    .\deploy.ps1 -SkipBuild
#>

param(
    [string]$Message = "feat: update content",
    [switch]$SkipBuild,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"

function Write-Step { param($msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-OK { param($msg) Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Err { param($msg) Write-Host "    ERR: $msg" -ForegroundColor Red }

Write-Host "`n=== Personal Garden Deploy Tool ===" -ForegroundColor Yellow

# ===== 1. Check Environment =====
Write-Step "Checking environment..."

try {
    $nodeVer = node --version 2>$null
    Write-OK "Node.js $nodeVer"
} catch {
    Write-Err "Node.js not found. Install from: https://nodejs.org/"
    exit 1
}

try {
    $npmVer = npm --version 2>$null
    Write-OK "npm $npmVer"
} catch {
    Write-Err "npm not found"
    exit 1
}

try {
    $gitVer = git --version 2>$null
    Write-OK "Git $gitVer"
} catch {
    Write-Err "Git not found. Install from: https://git-scm.com/"
    exit 1
}

# ===== 2. Check Dependencies =====
Write-Step "Checking dependencies..."

if (-not (Test-Path "node_modules")) {
    Write-Host "    Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to install dependencies"
        exit 1
    }
    Write-OK "Dependencies installed"
} else {
    Write-OK "Dependencies OK"
}

# ===== 3. Local Build =====
if (-not $SkipBuild) {
    Write-Step "Building locally..."

    if (Test-Path "dist") {
        Remove-Item -Recurse -Force dist
    }

    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Build failed! Please fix errors before deploying."
        exit 1
    }
    Write-OK "Build successful"
} else {
    Write-Step "Skipping local build"
}

# ===== 4. Git Operations =====
Write-Step "Git commit..."

$status = git status --porcelain
if (-not $status) {
    Write-Host "    No changes to commit" -ForegroundColor Yellow
    exit 0
}

git add -A
Write-OK "Staged all changes"

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Err "Commit failed"
    exit 1
}
Write-OK "Committed: $Message"

if (-not $SkipPush) {
    Write-Step "Pushing to GitHub..."
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Push failed. Check network or permissions."
        exit 1
    }
    Write-OK "Pushed to GitHub"
    Write-Host "`n=== Deploy Complete! ===" -ForegroundColor Green
    Write-Host "GitHub Actions will auto-build and deploy to GitHub Pages" -ForegroundColor Gray
    Write-Host "Check status: https://github.com/Tommie-P-xl/personal-garden/actions" -ForegroundColor Gray
} else {
    Write-Host "`n=== Committed (not pushed) ===" -ForegroundColor Yellow
    Write-Host "Manual push: git push" -ForegroundColor Gray
}
