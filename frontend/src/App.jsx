import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Tools from './pages/Tools'
import Admin from './pages/Admin'
import VulnMap from './pages/VulnMap'

export default function App() {
  const user = JSON.parse(localStorage.getItem('vulnlab_user') || 'null')

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <h1>VulnLab Shop</h1>
          <nav>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/tools">Tools</NavLink>
            <NavLink to="/admin">Admin</NavLink>
            <NavLink to="/vulnerabilities">Vuln Map</NavLink>
          </nav>
          {user && <span className="user-badge">Logged in: {user.username}</span>}
        </header>
        <div className="banner">
          Intentionally insecure demo app for security testing (SAST, DAST, secret scanning). Local use only.
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/vulnerabilities" element={<VulnMap />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
