@echo off
chcp 65001 >nul
title UniLMS Backend Runner
echo Khoi dong UniLMS Spring Boot Backend...
cd /d "%~dp0backend"

set "MAVEN_CMD=mvn"
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MAVEN_CMD=D:\Idea\DATA IDEA\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd"
    )
)

"%MAVEN_CMD%" spring-boot:run
pause
