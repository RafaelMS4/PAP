import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UserDashboardPage from './pages/UserDashboardPage'
import TicketsPage from './pages/TicketsPage'
import MyTicketsPage from './pages/MyTicketsPage'
import AdminQueuePage from './pages/AdminQueuePage'
import TicketDetailPage from './pages/TicketDetailPage'
import UsersPage from './pages/UsersPage'
import UserDetailPage from './pages/UserDetailPage'
import EquipmentPage from './pages/EquipmentPage'
import EquipmentDetailPage from './pages/EquipmentDetailPage'
import ProfilePage from './pages/ProfilePage'
import Navbar from './components/Navbar.jsx'
import NotificationContainer from './components/NotificationContainer.jsx'
import './styles/global.css'

function PrivateRoute() {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
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

function UserRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'admin' ? children : <Navigate to="/user-dashboard" replace />
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'admin' ? children : <Navigate to="/user-dashboard" replace />
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/user-dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<UserRoute><DashboardPage /></UserRoute>} />
          <Route path="/user-dashboard" element={<UserDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-tickets" element={<AdminRoute><MyTicketsPage /></AdminRoute>} />
          <Route path="/tickets" element={<AdminRoute><TicketsPage /></AdminRoute>} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/admin/queue" element={<AdminRoute><AdminQueuePage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/users/:id" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
          <Route path="/equipment" element={<AdminRoute><EquipmentPage /></AdminRoute>} />
          <Route path="/equipment/:id" element={<AdminRoute><EquipmentDetailPage /></AdminRoute>} />
        </Route>
        <Route path="/" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}