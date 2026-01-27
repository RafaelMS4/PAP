import { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Box, Divider, Avatar } from '@mui/material';
import { Dashboard, People, Assignment, Computer, ChevronLeft, Menu, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [user, setUser] = useState({ username: 'User' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Utilizadores', icon: <People />, path: '/users' },
    { text: 'Tickets', icon: <Assignment />, path: '/tickets' },
    { text: 'Equipamentos', icon: <Computer />, path: '/equipment' },
  ];

  const drawerWidth = open ? 250 : 70;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          bgcolor: '#1c1e1e',
          color: '#fff',
          boxSizing: 'border-box',
          borderRight: '1px solid #2a2a2a',
          overflowX: 'hidden',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header com user info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          p: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: 'rgb(61, 106, 255)',
                fontSize: '16px',
              }}
            >
              {user.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Box sx={{ fontSize: '15px', fontWeight: 600 }}>
                {user.username || 'User'}
              </Box>
              <Box sx={{ fontSize: '12px', color: '#999' }}>
                {user.role || 'Admin'}
              </Box>
            </Box>
          </Box>
        )}
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            color: '#fff',
            '&:hover': { bgcolor: '#2a2a2a' },
          }}
        >
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>
      </Box>

      <Divider sx={{ bgcolor: '#2a2a2a' }} />

      {/* Menu items */}
      <List sx={{ pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  justifyContent: open ? 'initial' : 'center',
                  bgcolor: isActive ? '#2a2a2a' : 'transparent',
                  '&:hover': {
                    bgcolor: '#2a2a2a',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'rgb(61, 106, 255)' : '#999',
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '15px',
                        fontWeight: isActive ? 600 : 500,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ bgcolor: '#2a2a2a' }} />

      {/* Logout button no fundo */}
      <List sx={{ pb: 2 }}>
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              justifyContent: open ? 'initial' : 'center',
              '&:hover': {
                bgcolor: '#2a2a2a',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'rgb(61, 106, 255)',
                minWidth: 0,
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <Logout />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Logout"
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '15px',
                    fontWeight: 500,
                    color: 'rgb(61, 106, 255)',
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}