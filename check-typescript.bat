@echo off
echo Running TypeScript compilation test...
npx tsc src/backend/trackingServer.ts --noEmit
echo.
echo Checking for service file errors...
npx tsc src/services/realVisitorTrackingService.ts --noEmit
echo.
echo Done!
