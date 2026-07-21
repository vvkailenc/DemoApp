import { useState } from 'react'
import { apiPost, saveUser } from '../api'

export default function Login() {
  const [username, setUsername] = useState('alice')
  const [password, setPassword] = useState('password123')
  const [result, setResult] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    const { status, data } = await apiPost('/login', { username, password })
    setResult({ status, data })
    if (data.success) saveUser(data.user)
  }

  async function handleRegister(e) {
    e.preventDefault()
    const { status, data } = await apiPost('/register', {
      username,
      password,
      email: `${username}@test.com`,
    })
    setResult({ status, data })
  }

  return (
    <div className="card">
      <span className="tag">SQL Injection</span>
      <span className="tag">Weak Hashing (MD5)</span>
      <h2>Login / Register</h2>
      <p className="hint">
        Try SQLi: username <code>admin' OR '1'='1' --</code> with any password.
        Search products with <code>' OR 1=1 --</code> on the Products page.
      </p>

      <form onSubmit={handleLogin}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="grid-2">
          <button type="submit">Login</button>
          <button type="button" className="secondary" onClick={handleRegister}>Register (MD5)</button>
        </div>
      </form>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}
