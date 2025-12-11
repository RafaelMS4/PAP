import './components.css'

export default function Navbar({ brand, user, onLogout }) {
  return (
    <nav className="navbar">
      <div>
        <h1>{brand}</h1>
      </div>
      <div className="navbar-user">
        {user && (
          <>
            <span className="navbar-username">{user.username}</span>
            <span className="navbar-role">{user.role}</span>
          </>
        )}
        {onLogout && (
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
