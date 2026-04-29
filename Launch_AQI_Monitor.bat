@echo off
setlocal
echo ============================================================
echo        AQI MONITOR - MASTER LAUNCHER
echo ============================================================
echo.
echo 1. Starting Backend Server (Port 5001)...
start "AQI Backend" cmd /k "cd pollution-app && start_backend.bat"

echo 2. Starting Frontend Server (Port 3000)...
start "AQI Frontend" cmd /k "cd pollution-app && start_frontend.bat"

echo.
echo Waiting for servers to initialize...
timeout /t 8 /nobreak > nul

echo 3. Opening AirSense AQI Monitor...
start http://localhost:3000

echo.
echo ============================================================
echo Servers are launching in separate windows.
echo - BACKEND:  Check for "Running on http://0.0.0.0:5001"
echo - FRONTEND: Check for "Local: http://localhost:3000"
echo.
echo If the dashboard fails to load, check the Backend window.
echo ============================================================
echo.
pause
