@echo off
chcp 65001 >nul
title UniLMS & OmniBrain - All-In-One Launcher
echo ==============================================================================
echo           UNILMS ENTERPRISE & OMNIBRAIN AI - ALL-IN-ONE RUNNER
echo ==============================================================================
echo.

set "MAVEN_CMD=mvn"
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MAVEN_CMD=D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd"
    )
)

:: 1. Backend Spring Boot
echo [1/3] Khoi dong Backend Spring Boot (Port 8080)...
start "UniLMS Backend (:8080)" cmd /k "cd /d ""%~dp0backend"" && ""%MAVEN_CMD%"" spring-boot:run"

:: 2. OmniBrain AI Platform + Ollama
echo [2/3] Khoi dong OmniBrain AI Platform (Port 8000 + Ollama)...
start "OmniBrain AI (:8000)" cmd /k ""%~dp0run_omnibrain.bat""

:: 3. Frontend React Vite
echo [3/3] Khoi dong Frontend React + Vite (Port 5173)...
start "UniLMS Frontend (:5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ==============================================================================
echo   Toan bo he thong dang duoc khoi dong tren 3 cua so rieng biet!
echo   - Frontend: http://localhost:5173
echo   - Backend : http://localhost:8080/api/v1
echo   - AI Brain: http://127.0.0.1:8000/docs
echo.
echo   * Khi can public len Internet: Nhan dup vao 'run_public_internet.bat'
echo ==============================================================================
echo.
timeout /t 6 >nul
start http://localhost:5173
exit
