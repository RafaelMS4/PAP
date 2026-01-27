import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
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
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#1c1e1e',
          minHeight: '100vh',
          ml: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* outras rotas */}
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}