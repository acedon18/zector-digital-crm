@echo off
echo ===========================================
echo Zector Digital CRM - API Filter Test Script
echo ===========================================

echo.
echo Testing API endpoints...
echo.

echo 1. Testing health endpoint...
curl -s http://localhost:3001/health
echo.
echo.

echo 2. Testing all companies endpoint...
curl -s http://localhost:3001/api/companies/leads | findstr "length"
echo.

echo 3. Testing hot companies filter...
curl -s http://localhost:3001/api/companies/filtered?status=hot | findstr "name domain status"
echo.

echo 4. Testing warm companies filter...
curl -s http://localhost:3001/api/companies/filtered?status=warm | findstr "name domain status"
echo.

echo 5. Testing tech industry, sorted by score...
curl -s "http://localhost:3001/api/companies/filtered?industry=Technology&sortBy=score" | findstr "name score industry"
echo.

echo Test completed! If you see JSON responses above, the filtering is working correctly.
echo.
pause
