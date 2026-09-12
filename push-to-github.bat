@echo off
setlocal enabledelayedexpansion
title Push Project to New GitHub Repository
echo ======================================================================
echo          Push Workspace to New GitHub Repository
echo ======================================================================
echo.

cd /d "%~dp0"

:: Default unique repo name with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set dt=%%I
set TIMESTAMP=%dt:~0,8%_%dt:~8,4%
if "%TIMESTAMP%"=="" set TIMESTAMP=%date:~-4%%date:~4,2%%date:~7,2%

set DEFAULT_NAME=sitesync-ai-core-%TIMESTAMP%
echo Suggested Unique Repo Name: %DEFAULT_NAME%
echo.
set /p REPO_NAME="Enter repo name (Press ENTER to use '%DEFAULT_NAME%'): "
if "%REPO_NAME%"=="" set REPO_NAME=%DEFAULT_NAME%

echo.
echo Target Repository: %REPO_NAME%
echo.

:: Initialize Git if not initialized
if not exist ".git" (
    echo [*] Initializing new Git repository...
    git init -b main
) else (
    echo [*] Git repository already initialized. Ensuring branch is main...
    git branch -M main
)

:: Stage files
echo [*] Staging files (ignoring node_modules, venvs, binaries)...
git add .

:: Commit
echo [*] Committing files...
git commit -m "feat: initial commit for %REPO_NAME% (Frontend, Backend, and AI Engine)"

echo.
echo ======================================================================
echo Trying automatic GitHub repository creation via GitHub CLI (gh)...
echo ======================================================================

where gh >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] GitHub CLI detected. Creating and pushing to remote...
    gh repo create %REPO_NAME% --public --source=. --remote=origin --push
    if %errorlevel% equ 0 (
        echo.
        echo ==================================================================
        echo [SUCCESS] Repository created and pushed successfully!
        echo ==================================================================
        goto done
    )
)

echo.
echo [*] GitHub CLI not authenticated or not installed.
echo If you created '%REPO_NAME%' manually on https://github.com/new:
echo.
set /p GITHUB_USER="Enter your GitHub username (e.g. harshithdraj02): "
if "%GITHUB_USER%"=="" set GITHUB_USER=harshithdraj02

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo.
echo [*] Pushing to https://github.com/%GITHUB_USER%/%REPO_NAME%.git ...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==================================================================
    echo [SUCCESS] Pushed to https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo ==================================================================
) else (
    echo.
    echo [NOTE] If the remote repository does not exist yet:
    echo 1. Go to https://github.com/new
    echo 2. Name it '%REPO_NAME%'
    echo 3. Click 'Create repository'
    echo 4. Run this script again or run:
    echo    git push -u origin main
)

:done
echo.
pause
