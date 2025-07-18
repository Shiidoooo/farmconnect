@echo off
echo Starting HarvestConnect for Network Access...
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4 Address"') do set LOCAL_IP=%%i
set LOCAL_IP=%LOCAL_IP: =%

echo Your local IP address is: %LOCAL_IP%
echo.
echo Frontend will be available at: http://%LOCAL_IP%:8080
echo Backend will be available at: http://%LOCAL_IP%:5000
echo.

REM Start backend
echo Starting backend server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting...
echo Check the opened terminal windows for status.
echo.
pause
