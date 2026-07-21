import { useState } from 'react'
import { apiGet } from '../api'

export default function Orders() {
  const [orderId, setOrderId] = useState('1')
  const [userId, setUserId] = useState('1')
  const [order, setOrder] = useState(null)
  const [user, setUser] = useState(null)

  async function fetchOrder(e) {
    e.preventDefault()
    const data = await apiGet(`/orders/${orderId}`)
    setOrder(data)
  }

  async function fetchUser(e) {
    e.preventDefault()
    const data = await apiGet(`/users/${userId}`)
    setUser(data)
  }

  return (
    <>
      <div className="card">
        <span className="tag">IDOR</span>
        <span className="tag">Data Exposure</span>
        <h2>Orders & Users (no auth check)</h2>
        <p className="hint">
          Any user can view any order or user profile, including passwords.
          Try order IDs 1-3 and user IDs 1-3.
        </p>

        <div className="grid-2">
          <form onSubmit={fetchOrder}>
            <label>Order ID</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <button type="submit">Get Order</button>
          </form>

          <form onSubmit={fetchUser}>
            <label>User ID</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} />
            <button type="submit">Get User</button>
          </form>
        </div>

        {order && <pre>{JSON.stringify(order, null, 2)}</pre>}
        {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
      </div>
    </>
  )
}
