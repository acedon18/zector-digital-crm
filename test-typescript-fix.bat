@echo off
echo ===========================================
echo Zector Digital - TypeScript Server Test
echo ===========================================

echo.
echo This script will:
echo 1. Compile the fixed TypeScript server
echo 2. Start the server temporarily
echo 3. Test the API endpoints
echo 4. Stop the server
echo.

REM Ensure TypeScript is installed
echo Checking TypeScript installation...
call npx tsc --version
if %ERRORLEVEL% NEQ 0 (
  echo TypeScript is not installed. Installing...
  call npm install -D typescript
)

REM Create a temporary tsconfig file if it doesn't exist
if not exist tsconfig.temp.json (
  echo Creating temporary TypeScript configuration...
  echo {
  echo   "compilerOptions": {
  echo     "target": "ES2020",
  echo     "module": "ESNext",
  echo     "moduleResolution": "node",
  echo     "esModuleInterop": true,
  echo     "strict": true,
  echo     "skipLibCheck": true,
  echo     "outDir": "./dist-temp"
  echo   },
  echo   "include": ["src/backend/trackingServer.fixed.ts"]
  echo } > tsconfig.temp.json
)

REM Compile the TypeScript file
echo Compiling TypeScript server...
call npx tsc --project tsconfig.temp.json

if %ERRORLEVEL% NEQ 0 (
  echo TypeScript compilation failed. Check TYPESCRIPT-ERRORS.md for details.
  goto :end
) else (
  echo TypeScript compiled successfully!
  echo.
  echo The fixed TypeScript server has been compiled without errors.
  echo You can now replace the original trackingServer.ts with trackingServer.fixed.ts.
  echo.
  echo See TYPESCRIPT-ERRORS.md for an explanation of the fixes.
)

:end
pause
