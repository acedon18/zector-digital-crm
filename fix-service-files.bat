@echo off
echo Fixing TypeScript Service Files...

:: Add ts-node for running TypeScript scripts directly
npx ts-node ./scripts/fix-service-files.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Service files fixed successfully!
    echo.
    echo Changes made:
    echo 1. Changed import.meta.env to process.env
    echo 2. Fixed import paths from @/types/* to relative paths
    echo.
    echo Next test TypeScript compilation:
    echo npx tsc --noEmit --skipLibCheck ./src/services/realVisitorTrackingService.ts
) else (
    echo.
    echo Error fixing service files. Please check the output above.
)
