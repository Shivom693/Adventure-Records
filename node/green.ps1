$env:PATH = "c:\Users\HP\Desktop\music\node;$env:PATH"
Set-Location "c:\Users\HP\Desktop\music"
node -e "require('fs').appendFileSync('CONTRIBUTIONS.md', '\n- Contribution: ' + new Date().toLocaleString())"
git add .
git commit --author="Shiv Om Tripathi <tripathishivom573@gmail.com>" -m "feat: daily contribution update"
git pull --rebase origin main
git push origin main
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   [SUCCESS] TODAY'S GREEN CONTRIBUTION PUSHED!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
