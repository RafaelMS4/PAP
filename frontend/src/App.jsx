import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import Sidebar from './components/Navbar.jsx'
import './styles/global.css'

function PrivateRoute() {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '250px', padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública - SEM sidebar */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas protegidas - COM sidebar */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Adiciona aqui as outras rotas protegidas */}
          {/* <Route path="/users" element={<UsersPage />} /> */}
          {/* <Route path="/tickets" element={<TicketsPage />} /> */}
          {/* <Route path="/equipment" element={<EquipmentPage />} /> */}
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
