@echo off
setlocal
echo ============================================================
echo        AQI MONITOR - BACKEND SERVER STARTER
echo ============================================================
echo.
echo [1/4] Entering backend directory...
cd backend

echo [2/4] Activating virtual environment...
if exist "..\..\.venv\Scripts\activate.bat" (
    call ..\..\.venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found at ..\..\.venv
    echo Please ensure the .venv folder exists in the project root.
    pause
    exit /b 1
)

echo [3/4] Checking configuration...
if not exist ".env" (
    echo ERROR: .env file missing in backend folder!
    echo Please copy .env.example to .env and fill in your keys.
    pause
    exit /b 1
)

python test_config.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Configuration test failed. Please check your .env settings.
    pause
    exit /b 1
)

echo [4/4] Starting Flask Server on port 5001...
echo.
echo ============================================================
echo SERVER STARTING...
echo ============================================================
python app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Backend crashed or failed to start.
    echo Check if another process is using port 5001.
)
pause
