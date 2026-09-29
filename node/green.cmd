@echo off
cd /d "c:\Users\HP\Desktop\music"
node -e "require('fs').appendFileSync('CONTRIBUTIONS.md', '\n- Contribution: ' + new Date().toLocaleString())"
git add .
git commit --author="Shiv Om Tripathi <tripathishivom573@gmail.com>" -m "feat: daily contribution update"
git pull --rebase origin main
git push origin main
echo.
echo ================================================
echo   [SUCCESS] TODAY'S GREEN CONTRIBUTION PUSHED!  
echo ================================================
