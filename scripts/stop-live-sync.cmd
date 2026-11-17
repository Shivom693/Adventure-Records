@echo off
cd /d "%~dp0\.."
echo Stopping Adventure Records Live Sync Deployment Watcher...
node scripts/stop-sync.mjs
pause
