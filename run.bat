@echo off
title SheetForge Pro - 10L+ Rows Excel Cleaner
echo ========================================================
echo   SheetForge Pro - High-Speed Excel ^& CSV Data Cleaner
echo   Engineered for 10 Lakhs+ (1,000,000+) Rows
echo ========================================================
echo.

set PYTHON_CMD=python
where python >nul 2>nul
if %errorlevel% neq 0 (
    set PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
)

echo Starting SheetForge Web Server on http://127.0.0.1:8000 ...
echo Press Ctrl+C in this terminal window to stop the server.
echo.

start "" http://127.0.0.1:8000
%PYTHON_CMD% -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
