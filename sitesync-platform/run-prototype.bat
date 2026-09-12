@echo off
title Construction Intelligence Prototype Runner
echo ======================================================================
echo    Starting Construction Intelligence Dashboard & AI Engine
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking and starting AI Service & Multi-Format Engine (Port 8000)...
cd sih2026\ai-service
start "SiteSync AI Service" cmd /k "pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Installing/Starting SiteSync Frontend (Port 5173)...
cd /d "%~dp0oil-industries"
start "SiteSync Frontend UI" cmd /k "npm install && npm run dev"

echo.
echo ======================================================================
echo    All Services Launching!
echo    - SiteSync Frontend UI: http://localhost:5173
echo    - AI & Multi-Format Ingestion API: http://localhost:8000
echo    - API Docs / Swagger: http://localhost:8000/docs
echo.
echo    Sample Files Ready in: sample_files\
echo      * sample_primavera_schedule.xer (Primavera P6)
echo      * sample_msproject_schedule.xml (MS Project)
echo      * sample_baseline_schedule.csv  (Schedule Sheet)
echo      * sample_dpr_progress.csv       (Progress Sheet)
echo      * POWER PLAY DPR -1.pdf         (PDF DPR)
echo ======================================================================
pause
