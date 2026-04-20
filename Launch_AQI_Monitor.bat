@echo off
echo ============================================================
echo        AQI MONITOR - MASTER LAUNCHER
echo ============================================================
echo.
echo 1. Starting Backend Server...
start "AQI Backend" cmd /c "cd pollution-app && start_backend.bat"

echo 2. Starting Frontend Server...
start "AQI Frontend" cmd /c "cd pollution-app && start_frontend.bat"

echo 3. Opening Browser...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo Servers are launching in separate windows.
echo You can close this window now.
echo.
pause
