@echo off
echo ==========================================
echo Zector Digital CRM - Backend Startup Script
echo ==========================================

echo.
echo Checking environment...
if not exist .env (
  echo ERROR: .env file not found.
  echo Please create an .env file with your MongoDB connection string.
  echo Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/zector-digital-crm
  exit /b 1
)

echo.
echo Starting backend server...
npm run backend

echo.
echo If the server started successfully, you can access:
echo - API: http://localhost:3001
echo - Health check: http://localhost:3001/health
echo - API test: http://localhost:3001/api/test
