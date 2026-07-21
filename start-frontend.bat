@echo off
echo Starting VulnLab Frontend...
cd /d "%~dp0frontend"
if not exist node_modules (
  call npm install
)
call npm run dev
