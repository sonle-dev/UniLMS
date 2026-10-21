@echo off
chcp 65001 >nul
title UniLMS - Cloudflare Public Internet Tunnel
echo ==============================================================================
echo           UNILMS - ĐƯA HỆ THỐNG LÊN MẠNG INTERNET (CLOUDFLARE TUNNEL)
echo ==============================================================================
echo.
echo Đang kiểm tra cổng Frontend (localhost:5173)...
echo.
echo [HƯỚNG DẪN]:
echo 1. Hãy đảm bảo bạn đã bật Backend (port 8080), AI Engine (port 8000) và Frontend (port 5173).
echo 2. Đợi 5 giây để Cloudflare cấp đường link HTTPS công khai...
echo.
echo ==============================================================================
echo.
"%~dp0tools\cloudflared.exe" tunnel --protocol http2 --url http://localhost:5173
pause
