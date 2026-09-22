@echo off
title Career Flow - 1-Click Startup
echo ========================================================
echo        STARTING CAREER FLOW (AI CAREER PLATFORM)
echo ========================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this system.
    echo Please install Node.js (v18 or higher) from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...

:: Backend dependencies
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend && call npm install && cd ..
)

:: Frontend dependencies
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

echo.
echo [2/3] Starting Backend Server (Port 5000)...
start "Career Flow Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo [3/3] Starting Frontend Dev Server (Port 5173)...
start "Career Flow Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul

echo.
echo ========================================================
echo   Career Flow is now running!
echo   Opening http://localhost:5173 in your default browser...
echo ========================================================
start http://localhost:5173
