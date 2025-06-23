# Project Cleanup Script - Remove test files, docs, and development artifacts
# PowerShell version

Write-Host "🧹 Starting Zector Digital CRM Project Cleanup..." -ForegroundColor Green

# Root directory test files
Write-Host "📁 Cleaning root directory test files..." -ForegroundColor Yellow
Remove-Item -Path "test-main-domain.js" -ErrorAction SilentlyContinue
Remove-Item -Path "test-local-apis.js" -ErrorAction SilentlyContinue
Remove-Item -Path "test-git-master.js" -ErrorAction SilentlyContinue
Remove-Item -Path "test-deployment.js" -ErrorAction SilentlyContinue
Remove-Item -Path "test-db.js" -ErrorAction SilentlyContinue
Remove-Item -Path "tracking-test.html" -ErrorAction SilentlyContinue
Remove-Item -Path "lead-tracking-test.html" -ErrorAction SilentlyContinue

# pulse-main test files
Write-Host "📁 Cleaning pulse-main test files..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/tracking-test.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-script-generation.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-enhanced-tracking.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-db.js" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-corrected-tracking.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-api.js" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-api.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-api.ps1" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-filter-api.cjs" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-node.cjs" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/test-typescript-fix.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/verify-typescript-fix.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/api/test.js" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/api/test-es.js" -ErrorAction SilentlyContinue

# Documentation and planning files
Write-Host "📁 Cleaning documentation and planning files..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/30_DAY_TRACKER.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/BUSINESS_STRATEGY.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/CUSTOMER_ACQUISITION_TRACKER.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/CUSTOMER_ONBOARDING_GUIDE.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/DEPENDENCY-UPDATES.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/DEPLOYMENT_GUIDE.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/DEPLOYMENT_STRATEGY.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/EMAIL_TEMPLATES.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/ESTRATEGIA_NEGOCIO_ESPANA.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/FEATURE-COMPLETION.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/FEATURE_ROADMAP.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/INVESTIGACION_PROSPECTS_ESPANA.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/LAUNCH_TODAY_CHECKLIST.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/PRODUCTION_CHECKLIST.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/progress-report.txt" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/PROJECT-ISSUES-PRIORITIES.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/PROJECT_COMPLETION_SUMMARY.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/PROSPECT_RESEARCH.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/SYSTEM_STATUS.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/TYPESCRIPT-ERRORS.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/TYPESCRIPT-FIX-IMPLEMENTATION.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/UNUSED-FILES-CLEANUP.md" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/USER_ACQUISITION_PLAN.md" -ErrorAction SilentlyContinue

# Development scripts and batch files
Write-Host "📁 Cleaning development scripts..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/check-typescript.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/cleanup-backups.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/fix-service-files.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/fix-services.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/fix-typescript-imports.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/reset-services.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/start-backend.bat" -ErrorAction SilentlyContinue

# Alternative tracking scripts
Write-Host "📁 Cleaning duplicate tracking scripts..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/corrected-tracking-script.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/robust-tracking-script.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/zector-digital-tracking-script.html" -ErrorAction SilentlyContinue

# Demo and example files
Write-Host "📁 Cleaning demo and example files..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/.env.example" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/public/demo.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/landing-page-espana.html" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/landing-page.html" -ErrorAction SilentlyContinue

# Development server files
Write-Host "📁 Cleaning development server files..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/server-test.cjs" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/server.cjs" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/seed-data.cjs" -ErrorAction SilentlyContinue

# Backup and cleanup files
Write-Host "📁 Cleaning backup files..." -ForegroundColor Yellow
Remove-Item -Path "pulse-main/backup-files" -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/scripts/cleanup-backup-files.js" -ErrorAction SilentlyContinue
Remove-Item -Path "pulse-main/src/i18n/locales/sv_backup.json" -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete! Project is now cleaner and ready for production." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Remaining production files:" -ForegroundColor Cyan
Write-Host "  ✅ api/ - Production API endpoints" -ForegroundColor Green
Write-Host "  ✅ frontend/ - Production frontend" -ForegroundColor Green
Write-Host "  ✅ pulse-main/src/ - Main application source" -ForegroundColor Green
Write-Host "  ✅ pulse-main/api/ - Additional API endpoints" -ForegroundColor Green
Write-Host "  ✅ zector-digital-tracking-script.html - Production tracking script" -ForegroundColor Green
Write-Host "  ✅ vercel.json - Deployment configuration" -ForegroundColor Green
Write-Host "  ✅ package.json - Dependencies" -ForegroundColor Green
