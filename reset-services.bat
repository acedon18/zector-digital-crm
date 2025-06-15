@echo off
echo Running service file reset script...
node scripts/reset-services.cjs
echo.
echo Verifying TypeScript compilation...
call verify-typescript-fix.bat
echo.
echo Done!
