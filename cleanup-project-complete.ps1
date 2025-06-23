# Zector Digital CRM - Complete Project Cleanup Script (PowerShell)
# This script removes all non-production files, test files, mockups, and duplicates

Write-Host "🧹 Starting Zector Digital CRM Project Cleanup..." -ForegroundColor Green
Write-Host "⚠️  This will permanently delete test files, backups, and unused code" -ForegroundColor Yellow
Write-Host "📋 Creating backup before cleanup..." -ForegroundColor Cyan

# Create timestamp for backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "cleanup_backup_$timestamp"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "📦 Backing up files to $backupDir..." -ForegroundColor Cyan

# Function to backup and remove file if it exists
function Remove-FileWithBackup {
    param([string]$FilePath)
    if (Test-Path $FilePath) {
        Write-Host "🗑️  Removing: $FilePath" -ForegroundColor Red
        try {
            Copy-Item $FilePath "$backupDir\$(Split-Path $FilePath -Leaf)" -ErrorAction SilentlyContinue
            Remove-Item $FilePath -Force
        } catch {
            Write-Host "   ⚠️  Could not remove: $FilePath" -ForegroundColor Yellow
        }
    }
}

# Function to backup and remove directory if it exists
function Remove-DirectoryWithBackup {
    param([string]$DirPath)
    if (Test-Path $DirPath) {
        Write-Host "🗑️  Removing directory: $DirPath" -ForegroundColor Red
        try {
            Copy-Item $DirPath "$backupDir\" -Recurse -ErrorAction SilentlyContinue
            Remove-Item $DirPath -Recurse -Force
        } catch {
            Write-Host "   ⚠️  Could not remove: $DirPath" -ForegroundColor Yellow
        }
    }
}

Write-Host "🧹 Cleaning up root directory test files..." -ForegroundColor Yellow

# Root level test files
Remove-FileWithBackup "lead-tracking-test.html"
Remove-FileWithBackup "test-db.js"
Remove-FileWithBackup "test-deployment.js"
Remove-FileWithBackup "test-git-master.js"
Remove-FileWithBackup "test-local-apis.js"
Remove-FileWithBackup "test-main-domain.js"
Remove-FileWithBackup "tracking-test.html"
Remove-FileWithBackup "test-enhanced-tracking.html"
Remove-FileWithBackup "test-script-generation.html"
Remove-FileWithBackup "corrected-tracking-script.html"
Remove-FileWithBackup "robust-tracking-script.html"
Remove-FileWithBackup "server-test.cjs"
Remove-FileWithBackup "test-api.bat"
Remove-FileWithBackup "test-api.js"
Remove-FileWithBackup "test-api.ps1"
Remove-FileWithBackup "test-corrected-tracking.html"
Remove-FileWithBackup "test-enhanced-tracking.html"
Remove-FileWithBackup "test-filter-api.cjs"
Remove-FileWithBackup "test-node.cjs"
Remove-FileWithBackup "test.html"
Remove-FileWithBackup "server.cjs"

Write-Host "🧹 Cleaning up documentation files..." -ForegroundColor Yellow

# Documentation and markdown files (keeping essential ones)
Remove-FileWithBackup "30_DAY_TRACKER.md"
Remove-FileWithBackup "BUSINESS_STRATEGY.md"
Remove-FileWithBackup "CUSTOMER_ACQUISITION_TRACKER.md"
Remove-FileWithBackup "CUSTOMER_ONBOARDING_GUIDE.md"
Remove-FileWithBackup "DEPENDENCY-UPDATES.md"
Remove-FileWithBackup "DEPLOYMENT_GUIDE.md"
Remove-FileWithBackup "DEPLOYMENT_STRATEGY.md"
Remove-FileWithBackup "EMAIL_TEMPLATES.md"
Remove-FileWithBackup "ESTRATEGIA_NEGOCIO_ESPANA.md"
Remove-FileWithBackup "FEATURE_ROADMAP.md"
Remove-FileWithBackup "FEATURE-COMPLETION.md"
Remove-FileWithBackup "INVESTIGACION_PROSPECTS_ESPANA.md"
Remove-FileWithBackup "LAUNCH_TODAY_CHECKLIST.md"
Remove-FileWithBackup "PRODUCTION_CHECKLIST.md"
Remove-FileWithBackup "progress-report.txt"
Remove-FileWithBackup "PROJECT_COMPLETION_SUMMARY.md"
Remove-FileWithBackup "PROJECT-ISSUES-PRIORITIES.md"
Remove-FileWithBackup "PROSPECT_RESEARCH.md"
Remove-FileWithBackup "README-BACKEND.md"
Remove-FileWithBackup "SYSTEM_STATUS.md"
Remove-FileWithBackup "TRACKING_SETUP.md"
Remove-FileWithBackup "TYPESCRIPT-ERRORS.md"
Remove-FileWithBackup "TYPESCRIPT-FIX-IMPLEMENTATION.md"
Remove-FileWithBackup "UNUSED-FILES-CLEANUP.md"
Remove-FileWithBackup "USER_ACQUISITION_PLAN.md"

Write-Host "🧹 Cleaning up script files..." -ForegroundColor Yellow

# Script files
Remove-FileWithBackup "check-typescript.bat"
Remove-FileWithBackup "cleanup-backups.bat"
Remove-FileWithBackup "fix-service-files.bat"
Remove-FileWithBackup "fix-services.bat"
Remove-FileWithBackup "fix-typescript-imports.bat"
Remove-FileWithBackup "reset-services.bat"
Remove-FileWithBackup "start-backend.bat"
Remove-FileWithBackup "test-typescript-fix.bat"
Remove-FileWithBackup "verify-typescript-fix.bat"
Remove-FileWithBackup "seed-data.cjs"

Write-Host "🧹 Cleaning up HTML files..." -ForegroundColor Yellow

# HTML files (keeping only the production tracking script)
Remove-FileWithBackup "index.html"
Remove-FileWithBackup "landing-page-espana.html"
Remove-FileWithBackup "landing-page.html"

Write-Host "🧹 Cleaning up duplicate directories..." -ForegroundColor Yellow

# Remove entire duplicate structures
Remove-DirectoryWithBackup "src"
Remove-DirectoryWithBackup "backend"
Remove-DirectoryWithBackup "scripts"
Remove-DirectoryWithBackup "backup-files"
Remove-DirectoryWithBackup "db"
Remove-DirectoryWithBackup "docs"
Remove-DirectoryWithBackup "public"

Write-Host "🧹 Cleaning up pulse-main directory..." -ForegroundColor Yellow

# Clean up pulse-main directory (keeping only essential src)
if (Test-Path "pulse-main") {
    Push-Location "pulse-main"
    
    # Remove test and documentation files from pulse-main
    Remove-FileWithBackup "30_DAY_TRACKER.md"
    Remove-FileWithBackup "BUSINESS_STRATEGY.md"
    Remove-FileWithBackup "check-typescript.bat"
    Remove-FileWithBackup "cleanup-backups.bat"
    Remove-FileWithBackup "components.json"
    Remove-FileWithBackup "corrected-tracking-script.html"
    Remove-FileWithBackup "CUSTOMER_ACQUISITION_TRACKER.md"
    Remove-FileWithBackup "CUSTOMER_ONBOARDING_GUIDE.md"
    Remove-FileWithBackup "DEPENDENCY-UPDATES.md"
    Remove-FileWithBackup "DEPLOYMENT_GUIDE.md"
    Remove-FileWithBackup "DEPLOYMENT_STRATEGY.md"
    Remove-FileWithBackup "EMAIL_TEMPLATES.md"
    Remove-FileWithBackup "eslint.config.js"
    Remove-FileWithBackup "ESTRATEGIA_NEGOCIO_ESPANA.md"
    Remove-FileWithBackup "FEATURE_ROADMAP.md"
    Remove-FileWithBackup "FEATURE-COMPLETION.md"
    Remove-FileWithBackup "fix-service-files.bat"
    Remove-FileWithBackup "fix-services.bat"
    Remove-FileWithBackup "fix-typescript-imports.bat"
    Remove-FileWithBackup "index.html"
    Remove-FileWithBackup "INVESTIGACION_PROSPECTS_ESPANA.md"
    Remove-FileWithBackup "jest.config.js"
    Remove-FileWithBackup "landing-page-espana.html"
    Remove-FileWithBackup "landing-page.html"
    Remove-FileWithBackup "LAUNCH_TODAY_CHECKLIST.md"
    Remove-FileWithBackup "LICENSE"
    Remove-FileWithBackup "postcss.config.js"
    Remove-FileWithBackup "PRODUCTION_CHECKLIST.md"
    Remove-FileWithBackup "progress-report.txt"
    Remove-FileWithBackup "PROJECT_COMPLETION_SUMMARY.md"
    Remove-FileWithBackup "PROJECT-ISSUES-PRIORITIES.md"
    Remove-FileWithBackup "PROSPECT_RESEARCH.md"
    Remove-FileWithBackup "README-BACKEND.md"
    Remove-FileWithBackup "reset-services.bat"
    Remove-FileWithBackup "robust-tracking-script.html"
    Remove-FileWithBackup "seed-data.cjs"
    Remove-FileWithBackup "server-test.cjs"
    Remove-FileWithBackup "server.cjs"
    Remove-FileWithBackup "start-backend.bat"
    Remove-FileWithBackup "SYSTEM_STATUS.md"
    Remove-FileWithBackup "tailwind.config.ts"
    Remove-FileWithBackup "test-api.bat"
    Remove-FileWithBackup "test-api.js"
    Remove-FileWithBackup "test-api.ps1"
    Remove-FileWithBackup "test-corrected-tracking.html"
    Remove-FileWithBackup "test-enhanced-tracking.html"
    Remove-FileWithBackup "test-filter-api.cjs"
    Remove-FileWithBackup "test-node.cjs"
    Remove-FileWithBackup "test-script-generation.html"
    Remove-FileWithBackup "test-typescript-fix.bat"
    Remove-FileWithBackup "test.html"
    Remove-FileWithBackup "tracking-test.html"
    Remove-FileWithBackup "tsconfig.app.json"
    Remove-FileWithBackup "tsconfig.backend.json"
    Remove-FileWithBackup "tsconfig.node.json"
    Remove-FileWithBackup "TYPESCRIPT-ERRORS.md"
    Remove-FileWithBackup "TYPESCRIPT-FIX-IMPLEMENTATION.md"
    Remove-FileWithBackup "UNUSED-FILES-CLEANUP.md"
    Remove-FileWithBackup "USER_ACQUISITION_PLAN.md"
    Remove-FileWithBackup "verify-typescript-fix.bat"
    Remove-FileWithBackup "zector-digital-tracking-script.html"
    
    # Remove duplicate directories in pulse-main
    Remove-DirectoryWithBackup "backup-files"
    Remove-DirectoryWithBackup "db"
    Remove-DirectoryWithBackup "docs"
    Remove-DirectoryWithBackup "public"
    Remove-DirectoryWithBackup "scripts"
      # Clean up API directory in pulse-main, keeping only essential APIs (keep core 4, remove extras)
    if (Test-Path "api") {
        Push-Location "api"
        Remove-FileWithBackup "discover-leads.js"
        Remove-FileWithBackup "enrich.js"
        Remove-FileWithBackup "test.js"
        Remove-FileWithBackup "test-es.js"
        Remove-FileWithBackup "track-new.js"
        Remove-FileWithBackup "track-simple.js"
        Remove-FileWithBackup "visitors.js"
        Remove-FileWithBackup "models.cjs"
        # Keep: companies.js, database-status.js, health.js, track.js (development versions)
        Pop-Location
    }
    
    Pop-Location
}

Write-Host "🧹 Cleaning up configuration duplicates..." -ForegroundColor Yellow

# Keep only essential config files in root
Remove-FileWithBackup "eslint.config.js"
Remove-FileWithBackup "jest.config.js"
Remove-FileWithBackup "postcss.config.js"
Remove-FileWithBackup "tailwind.config.ts"
Remove-FileWithBackup "tsconfig.app.json"
Remove-FileWithBackup "tsconfig.backend.json"
Remove-FileWithBackup "tsconfig.node.json"
Remove-FileWithBackup "vite.config.ts"

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host "📁 Backup created in: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Production files remaining:" -ForegroundColor Green
Write-Host "   📁 api/ (production APIs)" -ForegroundColor White
Write-Host "   📁 frontend/ (production frontend)" -ForegroundColor White
Write-Host "   📁 pulse-main/src/ (main application source)" -ForegroundColor White
Write-Host "   📄 package.json (root package)" -ForegroundColor White
Write-Host "   📄 vercel.json (deployment config)" -ForegroundColor White
Write-Host "   📄 zector-digital-tracking-script.html (production tracking script)" -ForegroundColor White
Write-Host ""
Write-Host "✨ Project is now clean and ready for production!" -ForegroundColor Green
