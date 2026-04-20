@echo off
echo ============================================================
echo        AQI MONITOR - BACKEND SERVER STARTER
echo ============================================================
echo.
echo Checking configuration...
echo.

cd backend

REM Activate root virtual environment
call ..\..\.venv\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo.
    echo Please create .env file:
    echo   1. Copy .env.example to .env
    echo   2. Add your MongoDB URI
    echo   3. Add your OpenWeatherMap API key
    echo.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing/updating dependencies...
pip install -q -r requirements.txt

REM Test configuration
echo.
echo Testing configuration...
python test_config.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Configuration test failed! Please fix errors above.
    pause
    exit /b 1
)

REM Start the server
echo.
echo ============================================================
echo Starting Flask backend server...
echo ============================================================
echo.
python app.py

pause
