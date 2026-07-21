@echo off
echo Starting VulnLab Backend...
cd /d "%~dp0backend"
if not exist .venv (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate.bat
)
python app.py
