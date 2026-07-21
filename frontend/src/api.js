const API = '/api'

export async function apiGet(path) {
  const res = await fetch(`${API}${path}`)
  return res.json()
}

export async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: await res.json() }
}

export async function apiDelete(path) {
  const res = await fetch(`${API}${path}`, { method: 'DELETE' })
  return { status: res.status, data: await res.json() }
}

export function saveUser(user) {
  localStorage.setItem('vulnlab_user', JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem('vulnlab_user')
}

export function getUser() {
  return JSON.parse(localStorage.getItem('vulnlab_user') || 'null')
}
