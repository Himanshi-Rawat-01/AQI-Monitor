@echo off
echo ============================================================
echo        AQI MONITOR - FRONTEND SERVER STARTER
echo ============================================================
echo.
echo Starting frontend server on http://localhost:3000
echo.
echo IMPORTANT:
echo - Backend must be running on http://localhost:5000
echo - Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

cd react-app
if not exist "node_modules" (
    echo WARNING: node_modules folder is missing.
    echo Running npm install...
    npm install
)
npm run dev
