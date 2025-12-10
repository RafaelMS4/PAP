import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import '../styles/dashboard.css'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getCurrentUser()
        setUser(response.data.user)
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>IT HelpDesk</h1>
        </div>
        <div className="navbar-user">
          <span>{user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {user?.username}!</h2>
          <p>Role: <strong>{user?.role}</strong></p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Tickets</h3>
            <p>Manage support tickets</p>
          </div>
          <div className="dashboard-card">
            <h3>Stock</h3>
            <p>Equipment inventory</p>
          </div>
          <div className="dashboard-card">
            <h3>Users</h3>
            <p>User management</p>
          </div>
          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>System reports</p>
          </div>
        </div>
      </main>
    </div>
  )
}
