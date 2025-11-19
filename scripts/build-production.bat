@echo off
REM Production Build Script for Windows
REM Builds the application for production deployment

echo =========================================
echo Starting Production Build
echo =========================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

echo Node version:
node --version
echo NPM version:
npm --version

REM Install dependencies
echo.
echo Installing dependencies...
call npm ci --production=false
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

REM Build frontend
echo.
echo Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    exit /b 1
)

REM Check if build directory exists
if not exist "build" (
    echo Error: Build directory not created
    exit /b 1
)

REM Remove development dependencies
echo.
echo Removing development dependencies...
call npm prune --production

echo.
echo =========================================
echo Production Build Complete!
echo =========================================
echo.
echo Build artifacts are in the 'build' directory
echo Ready for deployment
