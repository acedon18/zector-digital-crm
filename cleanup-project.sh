#!/bin/bash
# Project Cleanup Script - Remove test files, docs, and development artifacts

echo "🧹 Starting Zector Digital CRM Project Cleanup..."

# Root directory test files
echo "📁 Cleaning root directory test files..."
rm -f "test-main-domain.js"
rm -f "test-local-apis.js"
rm -f "test-git-master.js"
rm -f "test-deployment.js"
rm -f "test-db.js"
rm -f "tracking-test.html"
rm -f "lead-tracking-test.html"

# pulse-main test files
echo "📁 Cleaning pulse-main test files..."
rm -f "pulse-main/tracking-test.html"
rm -f "pulse-main/test.html"
rm -f "pulse-main/test-script-generation.html"
rm -f "pulse-main/test-enhanced-tracking.html"
rm -f "pulse-main/test-db.js"
rm -f "pulse-main/test-corrected-tracking.html"
rm -f "pulse-main/test-api.js"
rm -f "pulse-main/test-api.bat"
rm -f "pulse-main/test-api.ps1"
rm -f "pulse-main/test-filter-api.cjs"
rm -f "pulse-main/test-node.cjs"
rm -f "pulse-main/test-typescript-fix.bat"
rm -f "pulse-main/verify-typescript-fix.bat"
rm -f "pulse-main/api/test.js"
rm -f "pulse-main/api/test-es.js"

# Documentation and planning files
echo "📁 Cleaning documentation and planning files..."
rm -f "pulse-main/30_DAY_TRACKER.md"
rm -f "pulse-main/BUSINESS_STRATEGY.md"
rm -f "pulse-main/CUSTOMER_ACQUISITION_TRACKER.md"
rm -f "pulse-main/CUSTOMER_ONBOARDING_GUIDE.md"
rm -f "pulse-main/DEPENDENCY-UPDATES.md"
rm -f "pulse-main/DEPLOYMENT_GUIDE.md"
rm -f "pulse-main/DEPLOYMENT_STRATEGY.md"
rm -f "pulse-main/EMAIL_TEMPLATES.md"
rm -f "pulse-main/ESTRATEGIA_NEGOCIO_ESPANA.md"
rm -f "pulse-main/FEATURE-COMPLETION.md"
rm -f "pulse-main/FEATURE_ROADMAP.md"
rm -f "pulse-main/INVESTIGACION_PROSPECTS_ESPANA.md"
rm -f "pulse-main/LAUNCH_TODAY_CHECKLIST.md"
rm -f "pulse-main/PRODUCTION_CHECKLIST.md"
rm -f "pulse-main/progress-report.txt"
rm -f "pulse-main/PROJECT-ISSUES-PRIORITIES.md"
rm -f "pulse-main/PROJECT_COMPLETION_SUMMARY.md"
rm -f "pulse-main/PROSPECT_RESEARCH.md"
rm -f "pulse-main/SYSTEM_STATUS.md"
rm -f "pulse-main/TYPESCRIPT-ERRORS.md"
rm -f "pulse-main/TYPESCRIPT-FIX-IMPLEMENTATION.md"
rm -f "pulse-main/UNUSED-FILES-CLEANUP.md"
rm -f "pulse-main/USER_ACQUISITION_PLAN.md"

# Development scripts and batch files
echo "📁 Cleaning development scripts..."
rm -f "pulse-main/check-typescript.bat"
rm -f "pulse-main/cleanup-backups.bat"
rm -f "pulse-main/fix-service-files.bat"
rm -f "pulse-main/fix-services.bat"
rm -f "pulse-main/fix-typescript-imports.bat"
rm -f "pulse-main/reset-services.bat"
rm -f "pulse-main/start-backend.bat"

# Alternative tracking scripts
echo "📁 Cleaning duplicate tracking scripts..."
rm -f "pulse-main/corrected-tracking-script.html"
rm -f "pulse-main/robust-tracking-script.html"
rm -f "pulse-main/zector-digital-tracking-script.html"

# Demo and example files
echo "📁 Cleaning demo and example files..."
rm -f "pulse-main/.env.example"
rm -f "pulse-main/public/demo.html"
rm -f "pulse-main/landing-page-espana.html"
rm -f "pulse-main/landing-page.html"

# Development server files
echo "📁 Cleaning development server files..."
rm -f "pulse-main/server-test.cjs"
rm -f "pulse-main/server.cjs"
rm -f "pulse-main/seed-data.cjs"

# Backup and cleanup files
echo "📁 Cleaning backup files..."
rm -rf "pulse-main/backup-files"
rm -f "pulse-main/scripts/cleanup-backup-files.js"
rm -f "pulse-main/src/i18n/locales/sv_backup.json"

echo "✅ Cleanup complete! Project is now cleaner and ready for production."
echo ""
echo "📋 Remaining production files:"
echo "  ✅ api/ - Production API endpoints"
echo "  ✅ frontend/ - Production frontend"
echo "  ✅ pulse-main/src/ - Main application source"
echo "  ✅ pulse-main/api/ - Additional API endpoints"
echo "  ✅ zector-digital-tracking-script.html - Production tracking script"
echo "  ✅ vercel.json - Deployment configuration"
echo "  ✅ package.json - Dependencies"
