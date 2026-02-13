@echo off
echo ========================================
echo CB Organic Backend Startup
echo ========================================
echo.

echo Step 1: Checking if node_modules exists...
if not exist "node_modules" (
    echo node_modules not found! Installing dependencies...
    call npm install
) else (
    echo node_modules found!
)
echo.

echo Step 2: Starting server...
echo.
node server.js

pause
