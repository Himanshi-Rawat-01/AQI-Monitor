@echo off
echo ============================================================
echo        AQI MONITOR - FRONTEND SERVER STARTER
echo ============================================================
echo.
echo Starting frontend server on http://localhost:8000
echo.
echo IMPORTANT:
echo - Backend must be running on http://localhost:5000
echo - Open http://localhost:8000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo ============================================================
echo.

cd frontend
python -m http.server 8000
