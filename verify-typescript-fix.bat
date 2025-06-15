@echo off
echo Comparing TypeScript files...

REM Check if files are different
fc /b src\backend\trackingServer.ts src\backend\trackingServer.fixed.ts > nul

IF %ERRORLEVEL% EQU 0 (
    echo Files are identical. TrackingServer.ts has been fixed!
) ELSE (
    echo Files are different. Please check the differences and ensure trackingServer.ts is updated with the fixes.
)

echo.
echo To fully test TypeScript compilation for backend files, you'll need to:
echo 1. Fix the imports in service files (import.meta.env references)
echo 2. Update the TypeScript configuration to support those patterns
echo 3. Or modify service files to use process.env instead of import.meta.env

echo.
echo Trying to compile just the trackingServer.ts file...
npx tsc src\backend\trackingServer.ts --skipLibCheck --target ES2020 --module CommonJS --esModuleInterop --noEmit

IF %ERRORLEVEL% EQU 0 (
    echo TypeScript compilation successful!
    echo.
    echo Fixed TypeScript errors and properly typed Express endpoints.
    echo.
    echo ^> Next steps:
    echo 1. Update package.json to include TypeScript compilation in build process
    echo 2. Consider migrating server.cjs to TypeScript fully
) ELSE (
    echo TypeScript compilation failed. Please check the errors above.
)
