@echo off
echo Running service file fixer...
node scripts/fix-services.js
echo.
echo Verifying TypeScript compilation...
call verify-typescript-fix.bat
echo.
echo Done!
