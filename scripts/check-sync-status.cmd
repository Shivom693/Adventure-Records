@echo off
cd /d "%~dp0\.."
node scripts/status-sync.mjs
pause
