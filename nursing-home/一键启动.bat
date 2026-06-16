@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   Starting Nursing Home System...
echo ========================================
echo.
echo [1/2] Starting backend (port 3001)...
start cmd /c node server/index.js
echo [2/2] Starting frontend (port 5173)...
start cmd /c npx vite --host
echo.
echo Open http://localhost:5173
timeout /t 3 >nul
start http://localhost:5173
pause