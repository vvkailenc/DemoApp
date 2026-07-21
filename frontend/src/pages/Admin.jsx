import { useState } from 'react'
import { apiDelete, apiGet } from '../api'

export default function Admin() {
  const [users, setUsers] = useState(null)
  const [config, setConfig] = useState(null)
  const [deleteId, setDeleteId] = useState('2')
  const [deleteResult, setDeleteResult] = useState(null)

  async function loadUsers() {
    const data = await apiGet('/admin/users')
    setUsers(data)
  }

  async function loadConfig() {
    const data = await apiGet('/debug/config')
    setConfig(data)
  }

  async function deleteUser(e) {
    e.preventDefault()
    const result = await apiDelete(`/admin/delete-user/${deleteId}`)
    setDeleteResult(result)
    loadUsers()
  }

  return (
    <>
      <div className="card">
        <span className="tag">Broken Access Control</span>
        <span className="tag">Info Disclosure</span>
        <h2>Admin Panel (no authentication)</h2>
        <p className="hint">These endpoints require no login or admin role.</p>

        <div className="grid-2">
          <button type="button" onClick={loadUsers}>List All Users</button>
          <button type="button" onClick={loadConfig}>Expose Config / Secrets</button>
        </div>

        <form onSubmit={deleteUser} style={{ marginTop: '1rem' }}>
          <label>Delete User ID</label>
          <input value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
          <button type="submit" className="secondary">Delete User</button>
        </form>

        {users && <pre>{JSON.stringify(users, null, 2)}</pre>}
        {config && <pre>{JSON.stringify(config, null, 2)}</pre>}
        {deleteResult && <pre>{JSON.stringify(deleteResult, null, 2)}</pre>}
      </div>
    </>
  )
}
