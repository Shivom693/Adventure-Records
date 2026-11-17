@echo off
cd /d "%~dp0\.."
echo Starting Adventure Records Live Sync Deployment Watcher...
node scripts/start-sync.mjs
pause
