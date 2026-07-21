const VULNS = [
  { id: 'A01', name: 'Broken Access Control', where: '/orders, /users, /admin/*', test: 'Access order/user IDs without login; delete users from Admin page' },
  { id: 'A02', name: 'Cryptographic Failures', where: '/register, /users', test: 'MD5 password hashing; plaintext passwords in DB for demo users' },
  { id: 'A03', name: 'Injection (SQL)', where: '/login, /products/search', test: "admin' OR '1'='1' --" },
  { id: 'A03', name: 'Injection (Command)', where: '/tools/ping', test: '127.0.0.1 & whoami' },
  { id: 'A03', name: 'Injection (Code eval)', where: '/calc', test: "__import__('os').system('whoami')" },
  { id: 'A05', name: 'Security Misconfiguration', where: 'app.py, /debug/config', test: 'Debug mode, CORS *, exposed env vars' },
  { id: 'A07', name: 'Identification & Auth Failures', where: '/login', test: 'SQLi bypass, weak admin password admin123' },
  { id: 'A08', name: 'Software/Data Integrity', where: '/session/load', test: 'Malicious pickle deserialization' },
  { id: 'A10', name: 'SSRF', where: '/fetch', test: 'Fetch http://127.0.0.1:5000/api/debug/config' },
  { id: 'XSS', name: 'Cross-Site Scripting', where: '/products comments, /greet', test: '<script>alert(1)</script>' },
  { id: 'PT', name: 'Path Traversal', where: '/files/read', test: 'private/secret.txt' },
  { id: 'SEC', name: 'Hardcoded Secrets', where: 'backend/app.py', test: 'Run secret scanner on repo (API_KEY, ADMIN_PASSWORD)' },
  { id: 'CORS', name: 'CORS Misconfiguration', where: 'All API routes', test: 'Origin: * with credentials enabled' },
]

export default function VulnMap() {
  return (
    <div className="card">
      <h2>Vulnerability Map</h2>
      <p>Use this table to target SAST, DAST, secret scanning, and manual testing.</p>
      <div className="vuln-list">
        {VULNS.map((v) => (
          <div key={`${v.id}-${v.name}`} className="vuln-item">
            <strong>{v.id}: {v.name}</strong>
            <div><em>Location:</em> {v.where}</div>
            <div><em>How to test:</em> {v.test}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
