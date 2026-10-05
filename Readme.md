# VulnLab - Intentionally Insecure Demo App

**For local security testing only.** Do not deploy to production or expose to the internet.

A small full-stack app with built-in vulnerabilities for testing:dddDd

- SAST (static code analysis)
- Secret scanning
- DAST / vulnerability scanners (OWASP ZAP, Burp, etc.)
- Dependency scanning
- Manual penetration testing

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React + Vite (port 5173)      |
| Backend  | Python Flask API (port 5000)  |
| Database | SQLite                        |

## Quick Start

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

API runs at http://127.0.0.1:5000

### 2. Frontend (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

UI runs at http://127.0.0.1:5173

## Demo Accounts

| Username | Password    | Role  |
|----------|-------------|-------|
| alice    | password123 | user  |
| bob      | qwerty      | user  |
| admin    | admin123    | admin |

## Built-in Vulnerabilities

| Category | Location | Example Payload |
|----------|----------|-----------------|
| SQL Injection | `/api/login`, `/api/products/search` | `admin' OR '1'='1' --` |
| Stored XSS | Product comments | `<script>alert(1)</script>` |
| Reflected XSS | `/api/greet`, Greeting UI | `<img src=x onerror=alert(1)>` |
| Command Injection | `/api/tools/ping` | `127.0.0.1 & whoami` |
| Path Traversal | `/api/files/read` | `private/secret.txt` |
| SSRF | `/api/fetch` | `http://127.0.0.1:5000/api/debug/config` |
| Insecure Deserialization | `/api/session/load` | Malicious pickle blob |
| Code Injection (eval) | `/api/calc` | `__import__('os').system('whoami')` |
| IDOR | `/api/orders/:id`, `/api/users/:id` | Access any ID without auth |
| Broken Access Control | `/api/admin/*` | No login required |
| Info Disclosure | `/api/debug/config` | Secrets + environment variables |
| Hardcoded Secrets | `backend/app.py` | `API_KEY`, `ADMIN_PASSWORD`, etc. |
| Weak Hashing | `/api/register` | MD5 passwords |
| CORS Misconfiguration | All routes | `origins="*"` + credentials |
| Debug Mode | Flask app | `debug=True` |

Open the **Vuln Map** page in the UI for a full testing guide.

## Scanner Suggestions

- **Secret scanning:** Gitleaks, TruffleHog, GitHub secret scanning
- **SAST:** Bandit (Python), Semgrep, CodeQL, SonarQube
- **Dependency scan:** `pip-audit`, npm audit, Snyk, Dependabot
- **DAST:** OWASP ZAP (target http://127.0.0.1:5173), Burp Suite
- **Container/IaC:** Not applicable (local dev app)

### Example: Bandit (Python SAST)

```powershell
pip install bandit
bandit -r backend/app.py
```

### Example: pip-audit

```powershell
pip install pip-audit
pip-audit -r backend/requirements.txt
```

## Project Structure

```
DemoApp/
├── backend/
│   ├── app.py              # Vulnerable Flask API
│   ├── requirements.txt
│   └── data/               # SQLite DB + files
├── frontend/
│   ├── src/pages/          # UI for each vuln category
│   └── vite.config.js      # Proxies /api to Flask
└── Readme.md
```

## Disclaimer

This application is deliberately insecure. Use only in isolated local environments for education and security tool evaluation.
