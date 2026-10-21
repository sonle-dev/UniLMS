@echo off
chcp 65001 >nul
title UniLMS - Cloudflare Public Internet Tunnel
echo ==============================================================================
echo           UNILMS - DUA HE THONG LEN MANG INTERNET (CLOUDFLARE TUNNEL)
echo ==============================================================================
echo.
echo [HUONG DAN]:
echo 1. Hay dam bao ban da bat he thong qua 'run_all.bat' hoac cac service tuong ung.
echo 2. Doi 5 giay de Cloudflare cap duong link HTTPS cong khai...
echo.
echo ==============================================================================
echo.
"%~dp0tools\cloudflared.exe" tunnel --protocol http2 --no-prechecks --edge-ip-version 4 --url http://localhost:5173
pause
