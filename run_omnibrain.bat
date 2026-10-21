@echo off
chcp 65001 >nul
title OmniBrain AI Platform Runner
echo ==============================================================================
echo                OMNIBRAIN AI PLATFORM (ORCHESTRATOR + OLLAMA)
echo ==============================================================================
echo.

:: 1. Kiem tra va khoi dong Ollama Engine (Port 11434)
echo [1/2] Kiem tra Ollama AI Engine (Port 11434)...
netstat -ano | findstr :11434 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo  -> Ollama dang chay tot tren port 11434.
) else (
    echo  -> Dang khoi dong Ollama Engine chay nen...
    start "Ollama AI Engine" ollama serve
    timeout /t 3 >nul
)

:: 2. Khoi dong FastAPI Orchestrator (Port 8000)
echo.
echo [2/2] Khoi dong OmniBrain FastAPI Orchestrator (Port 8000)...
cd /d "D:\OmniBrain AI Platform"
echo  -> API Swagger Docs tai: http://127.0.0.1:8000/docs
echo  -> Chat Completion API : http://127.0.0.1:8000/api/v1/chat/completions
echo.

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
