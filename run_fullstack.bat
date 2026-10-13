@echo off
chcp 65001 >nul
title UniLMS Fullstack Runner
echo =====================================================================
echo           UniLMS - ENTERPRISE LEARNING MANAGEMENT SYSTEM
echo                   Khoi chay toan bo he thong Fullstack
echo =====================================================================
echo.

set "MAVEN_CMD=mvn"
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MAVEN_CMD=D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd"
    ) else (
        echo [CANH BAO] Khong tim thay Maven trong PATH.
    )
)

echo [1/3] Kiem tra Co so du lieu PostgreSQL (Port 5432)...
netstat -ano | findstr :5432 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  -> PostgreSQL dang hoat dong tot!
) else (
    echo  -> [CHU Y] PostgreSQL chua bat tren port 5432. Vui long bat PostgreSQL service!
)

echo.
echo [2/3] Khoi dong Backend Spring Boot (Port 8080)...
start "UniLMS Backend (Spring Boot :8080)" cmd /k "cd /d ""%~dp0backend"" && ""%MAVEN_CMD%"" spring-boot:run"

echo.
echo [3/3] Khoi dong Frontend React + Vite (Port 5173)...
start "UniLMS Frontend (React :5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo =====================================================================
echo  Da phat lenh khoi dong Backend va Frontend tren 2 cua so doc lap!
echo  Frontend se san sang tai: http://localhost:5173
echo  Backend API san sang tai: http://localhost:8080/api/v1
echo =====================================================================
echo.
timeout /t 5 >nul
start http://localhost:5173
exit
