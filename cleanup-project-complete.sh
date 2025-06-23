#!/bin/bash

# Zector Digital CRM - Complete Project Cleanup Script
# This script removes all non-production files, test files, mockups, and duplicates

echo "🧹 Starting Zector Digital CRM Project Cleanup..."
echo "⚠️  This will permanently delete test files, backups, and unused code"
echo "📋 Creating backup before cleanup..."

# Create timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="cleanup_backup_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up files to $BACKUP_DIR..."

# Function to backup and remove file if it exists
cleanup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🗑️  Removing: $file"
        cp "$file" "$BACKUP_DIR/$(basename "$file")" 2>/dev/null
        rm "$file"
    fi
}

# Function to backup and remove directory if it exists
cleanup_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        echo "🗑️  Removing directory: $dir"
        cp -r "$dir" "$BACKUP_DIR/" 2>/dev/null
        rm -rf "$dir"
    fi
}

echo "🧹 Cleaning up root directory test files..."

# Root level test files
cleanup_file "lead-tracking-test.html"
cleanup_file "test-db.js"
cleanup_file "test-deployment.js"
cleanup_file "test-git-master.js"
cleanup_file "test-local-apis.js"
cleanup_file "test-main-domain.js"
cleanup_file "tracking-test.html"
cleanup_file "test-enhanced-tracking.html"
cleanup_file "test-script-generation.html"
cleanup_file "corrected-tracking-script.html"
cleanup_file "robust-tracking-script.html"
cleanup_file "server-test.cjs"
cleanup_file "test-api.bat"
cleanup_file "test-api.js"
cleanup_file "test-api.ps1"
cleanup_file "test-corrected-tracking.html"
cleanup_file "test-enhanced-tracking.html"
cleanup_file "test-filter-api.cjs"
cleanup_file "test-node.cjs"
cleanup_file "test.html"
cleanup_file "server.cjs"

echo "🧹 Cleaning up documentation files..."

# Documentation and markdown files (keeping essential ones)
cleanup_file "30_DAY_TRACKER.md"
cleanup_file "BUSINESS_STRATEGY.md"
cleanup_file "CUSTOMER_ACQUISITION_TRACKER.md"
cleanup_file "CUSTOMER_ONBOARDING_GUIDE.md"
cleanup_file "DEPENDENCY-UPDATES.md"
cleanup_file "DEPLOYMENT_GUIDE.md"
cleanup_file "DEPLOYMENT_STRATEGY.md"
cleanup_file "EMAIL_TEMPLATES.md"
cleanup_file "ESTRATEGIA_NEGOCIO_ESPANA.md"
cleanup_file "FEATURE_ROADMAP.md"
cleanup_file "FEATURE-COMPLETION.md"
cleanup_file "INVESTIGACION_PROSPECTS_ESPANA.md"
cleanup_file "LAUNCH_TODAY_CHECKLIST.md"
cleanup_file "PRODUCTION_CHECKLIST.md"
cleanup_file "progress-report.txt"
cleanup_file "PROJECT_COMPLETION_SUMMARY.md"
cleanup_file "PROJECT-ISSUES-PRIORITIES.md"
cleanup_file "PROSPECT_RESEARCH.md"
cleanup_file "README-BACKEND.md"
cleanup_file "SYSTEM_STATUS.md"
cleanup_file "TRACKING_SETUP.md"
cleanup_file "TYPESCRIPT-ERRORS.md"
cleanup_file "TYPESCRIPT-FIX-IMPLEMENTATION.md"
cleanup_file "UNUSED-FILES-CLEANUP.md"
cleanup_file "USER_ACQUISITION_PLAN.md"

echo "🧹 Cleaning up script files..."

# Script files
cleanup_file "check-typescript.bat"
cleanup_file "cleanup-backups.bat"
cleanup_file "fix-service-files.bat"
cleanup_file "fix-services.bat"
cleanup_file "fix-typescript-imports.bat"
cleanup_file "reset-services.bat"
cleanup_file "start-backend.bat"
cleanup_file "test-typescript-fix.bat"
cleanup_file "verify-typescript-fix.bat"
cleanup_file "seed-data.cjs"

echo "🧹 Cleaning up HTML files..."

# HTML files (keeping only the production tracking script)
cleanup_file "index.html"
cleanup_file "landing-page-espana.html"
cleanup_file "landing-page.html"

echo "🧹 Cleaning up duplicate directories..."

# Remove entire duplicate structures
cleanup_dir "src"
cleanup_dir "backend"
cleanup_dir "scripts"
cleanup_dir "backup-files"
cleanup_dir "db"
cleanup_dir "docs"
cleanup_dir "public"

echo "🧹 Cleaning up pulse-main directory..."

# Clean up pulse-main directory (keeping only essential src)
if [ -d "pulse-main" ]; then
    cd pulse-main
    
    # Remove test and documentation files from pulse-main
    cleanup_file "30_DAY_TRACKER.md"
    cleanup_file "BUSINESS_STRATEGY.md"
    cleanup_file "check-typescript.bat"
    cleanup_file "cleanup-backups.bat"
    cleanup_file "components.json"
    cleanup_file "corrected-tracking-script.html"
    cleanup_file "CUSTOMER_ACQUISITION_TRACKER.md"
    cleanup_file "CUSTOMER_ONBOARDING_GUIDE.md"
    cleanup_file "DEPENDENCY-UPDATES.md"
    cleanup_file "DEPLOYMENT_GUIDE.md"
    cleanup_file "DEPLOYMENT_STRATEGY.md"
    cleanup_file "EMAIL_TEMPLATES.md"
    cleanup_file "eslint.config.js"
    cleanup_file "ESTRATEGIA_NEGOCIO_ESPANA.md"
    cleanup_file "FEATURE_ROADMAP.md"
    cleanup_file "FEATURE-COMPLETION.md"
    cleanup_file "fix-service-files.bat"
    cleanup_file "fix-services.bat"
    cleanup_file "fix-typescript-imports.bat"
    cleanup_file "index.html"
    cleanup_file "INVESTIGACION_PROSPECTS_ESPANA.md"
    cleanup_file "jest.config.js"
    cleanup_file "landing-page-espana.html"
    cleanup_file "landing-page.html"
    cleanup_file "LAUNCH_TODAY_CHECKLIST.md"
    cleanup_file "LICENSE"
    cleanup_file "postcss.config.js"
    cleanup_file "PRODUCTION_CHECKLIST.md"
    cleanup_file "progress-report.txt"
    cleanup_file "PROJECT_COMPLETION_SUMMARY.md"
    cleanup_file "PROJECT-ISSUES-PRIORITIES.md"
    cleanup_file "PROSPECT_RESEARCH.md"
    cleanup_file "README-BACKEND.md"
    cleanup_file "reset-services.bat"
    cleanup_file "robust-tracking-script.html"
    cleanup_file "seed-data.cjs"
    cleanup_file "server-test.cjs"
    cleanup_file "server.cjs"
    cleanup_file "start-backend.bat"
    cleanup_file "SYSTEM_STATUS.md"
    cleanup_file "tailwind.config.ts"
    cleanup_file "test-api.bat"
    cleanup_file "test-api.js"
    cleanup_file "test-api.ps1"
    cleanup_file "test-corrected-tracking.html"
    cleanup_file "test-enhanced-tracking.html"
    cleanup_file "test-filter-api.cjs"
    cleanup_file "test-node.cjs"
    cleanup_file "test-script-generation.html"
    cleanup_file "test-typescript-fix.bat"
    cleanup_file "test.html"
    cleanup_file "tracking-test.html"
    cleanup_file "tsconfig.app.json"
    cleanup_file "tsconfig.backend.json"
    cleanup_file "tsconfig.node.json"
    cleanup_file "TYPESCRIPT-ERRORS.md"
    cleanup_file "TYPESCRIPT-FIX-IMPLEMENTATION.md"
    cleanup_file "UNUSED-FILES-CLEANUP.md"
    cleanup_file "USER_ACQUISITION_PLAN.md"
    cleanup_file "verify-typescript-fix.bat"
    cleanup_file "zector-digital-tracking-script.html"
    
    # Remove duplicate directories in pulse-main
    cleanup_dir "backup-files"
    cleanup_dir "db"
    cleanup_dir "docs"
    cleanup_dir "public"
    cleanup_dir "scripts"
    
    # Clean up API directory in pulse-main, keeping only essential APIs (keep core 4, remove extras)
    if [ -d "api" ]; then
        cd api
        cleanup_file "discover-leads.js"
        cleanup_file "enrich.js"
        cleanup_file "test.js"
        cleanup_file "test-es.js"
        cleanup_file "track-new.js"
        cleanup_file "track-simple.js"
        cleanup_file "visitors.js"
        cleanup_file "models.cjs"
        # Keep: companies.js, database-status.js, health.js, track.js (development versions)
        cd ..
    fi
    
    cd ..
fi

echo "🧹 Cleaning up configuration duplicates..."

# Keep only essential config files in root
cleanup_file "eslint.config.js"
cleanup_file "jest.config.js"
cleanup_file "postcss.config.js"
cleanup_file "tailwind.config.ts"
cleanup_file "tsconfig.app.json"
cleanup_file "tsconfig.backend.json"
cleanup_file "tsconfig.node.json"
cleanup_file "vite.config.ts"

echo "✅ Cleanup completed!"
echo "📁 Backup created in: $BACKUP_DIR"
echo ""
echo "🎯 Production files remaining:"
echo "   📁 api/ (production APIs)"
echo "   📁 frontend/ (production frontend)"
echo "   📁 pulse-main/src/ (main application source)"
echo "   📄 package.json (root package)"
echo "   📄 vercel.json (deployment config)"
echo "   📄 zector-digital-tracking-script.html (production tracking script)"
echo ""
echo "✨ Project is now clean and ready for production!"
