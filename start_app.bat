@echo off
title Warranty Pro Launcher
color 0A

echo ========================================================
echo       WARRANTY PRO - STARTUP SEQUENCE
echo ========================================================

echo.
echo [1/2] Checking Environment...
if not exist "node_modules" (
    echo    Installing API dependencies...
    call npm install
)
if not exist "frontend\node_modules" (
    echo    Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

echo.
echo [2/2] Launching Services...

:: Start Backend
start "Warranty Pro Backend" cmd /k "node api/server.js"
echo    Backend started on port 3000.

:: Start Frontend
cd frontend
start "Warranty Pro Frontend" cmd /k "npm run dev -- --host"
echo    Frontend request sent.

echo.
echo ========================================================
echo   SUCCESS! The application is running.
echo.
echo   1. Keep the two black windows OPEN.
echo   2. Access the app at:
echo      http://localhost:5173
echo.
echo   To allow mobile access:
echo   1. Look at the "Frontend" window.
echo   2. Find the "Network" URL (e.g., http://192.168.x.x:5173).
echo   3. Open that URL on your phone.
echo ========================================================
pause
