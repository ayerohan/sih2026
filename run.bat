@echo off
title SiteSync AI Construction Intelligence Runner
echo ======================================================================
echo    SiteSync AI Construction Intelligence Platform
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting AI Engine & Multi-Format Ingestion API (Port 8000)...
start "SiteSync AI Service" cmd /k "cd /d "%~dp0sitesync-platform\sih2026\ai-service" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting SiteSync Frontend UI (Port 5173)...
start "SiteSync Frontend UI" cmd /k "cd /d "%~dp0sitesync-platform\oil-industries" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo    All Core Services Running!
echo    - SiteSync Web Dashboard : http://localhost:5173
echo    - AI Multi-Format Engine : http://localhost:8000
echo    - Interactive API Docs   : http://localhost:8000/docs
echo.
echo    Sample Files (Primavera P6, MS Project, CSV, PDF) located at:
echo    sitesync-platform\sample_files\
echo ======================================================================
echo.
echo Opening browser to http://localhost:5173 ...
start http://localhost:5173
pause
