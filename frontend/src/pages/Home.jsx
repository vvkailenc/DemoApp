import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="card">
        <h2>Welcome to VulnLab</h2>
        <p>
          A small e-commerce demo with built-in security flaws for testing scanners,
          penetration tools, and secure coding practices.
        </p>
        <p>Start with the <Link to="/vulnerabilities">Vulnerability Map</Link> to see what to test.</p>
      </div>

      <div className="card">
        <h2>Demo Accounts</h2>
        <ul>
          <li><strong>alice</strong> / password123</li>
          <li><strong>bob</strong> / qwerty</li>
          <li><strong>admin</strong> / admin123</li>
        </ul>
      </div>

      <div className="card">
        <h2>Quick Test Ideas</h2>
        <div className="vuln-list">
          <div className="vuln-item">
            <strong>SQL Injection</strong>
            Login with <code>admin' OR '1'='1' --</code> and any password
          </div>
          <div className="vuln-item">
            <strong>Stored XSS</strong>
            Post a comment with <code>{'<script>alert(1)</script>'}</code>
          </div>
          <div className="vuln-item">
            <strong>Secret Scanning</strong>
            Scan <code>backend/app.py</code> for hardcoded API keys
          </div>
        </div>
      </div>
    </>
  )
}
