@echo off
REM ILex Pre-Onboarding Tool Setup Script for Windows
REM This script will set up the entire application for first-time use

echo ========================================
echo ILex Pre-Onboarding Tool - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

node -v
npm -v
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd server
if not exist .env (
    echo Creating server/.env from template...
    copy .env.example .env
    echo WARNING: Please edit server/.env with your AWS SES credentials
)
call npm install
echo Backend dependencies installed
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\client
if not exist .env (
    echo Creating client/.env from template...
    copy .env.example .env
)
call npm install --legacy-peer-deps
echo Frontend dependencies installed
echo.

cd ..

REM Create start script
echo Creating launch scripts...

echo @echo off > start.bat
echo echo Starting ILex Pre-Onboarding Tool... >> start.bat
echo echo. >> start.bat
echo start "Backend Server" cmd /k "cd server && npm run dev" >> start.bat
echo timeout /t 3 /nobreak >> start.bat
echo start "Frontend Server" cmd /k "cd client && npm start" >> start.bat
echo echo. >> start.bat
echo echo Both servers started! >> start.bat
echo echo Backend: http://localhost:3001 >> start.bat
echo echo Frontend: http://localhost:3000 >> start.bat
echo pause >> start.bat

REM Create stop script
echo @echo off > stop.bat
echo echo Stopping servers... >> stop.bat
echo for /f "tokens=5" %%%%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%%%a 2^>nul >> stop.bat
echo for /f "tokens=5" %%%%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%%%a 2^>nul >> stop.bat
echo echo Servers stopped >> stop.bat
echo pause >> stop.bat

echo Launch scripts created
echo.

REM Summary
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Configure environment variables:
echo    - Edit server\.env (add AWS SES credentials for email tests)
echo    - Edit client\.env (should work with defaults)
echo.
echo 2. Start the application:
echo    Option A - Use launch script:
echo      start.bat
echo.
echo    Option B - Manual start:
echo      Terminal 1: cd server && npm run dev
echo      Terminal 2: cd client && npm start
echo.
echo 3. Open browser:
echo    http://localhost:3000
echo.
echo 4. Stop servers:
echo    Run: stop.bat
echo.
echo Documentation:
echo    - README.md          - Full project documentation
echo    - QUICKSTART.md      - Quick start guide
echo    - DEPLOYMENT.md      - AWS deployment guide
echo    - TESTING.md         - Testing scenarios
echo    - TROUBLESHOOTING.md - Common issues and solutions
echo.
echo Need help?
echo    - Read the documentation files above
echo    - Email: support@ilex.sg
echo.
echo Happy testing!
echo.
pause
