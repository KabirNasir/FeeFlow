// src/components/Layout.jsx
import React, { useContext, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
// import ClassIcon from '@mui/icons-material/Class';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ClassIcon from '@mui/icons-material/Class';
import ReceiptIcon from '@mui/icons-material/Receipt';
const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon sx={{ color: 'var(--white)' }} />, path: '/dashboard' },
  // { text: 'Your Classes', icon: <ClassIcon />, path: '/dashboard' }, // same as dashboard
  { text: 'Students', icon: <GroupIcon sx={{ color: 'var(--white)' }} />, path: '/students' },
  { text: 'Classes', icon: <ClassIcon sx={{ color: 'var(--white)' }} />, path: '/classes' },
  { text: 'Fees', icon: <ReceiptIcon sx={{ color: 'var(--white)' }} />, path: '/fees' },
];

const quickActions = [
  { text: 'New Class', icon: <AddIcon sx={{ color: 'var(--white)' }} />, path: '/classes/new' },
  { text: 'New Student', icon: <AddIcon sx={{ color: 'var(--white)' }} />, path: '/students/new' },
  { text: 'Reports', icon: <AssessmentIcon sx={{ color: 'var(--white)' }} />, path: '/reports' },
];

const Layout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(open => !open);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar>
        <img
          src="/circleLogo.png"
          alt="FeeFlow Logo"
          style={{ width: 50, height: 50, marginRight: 20 , marginTop: 10}}
        />
        <Typography variant="h5" noWrap>
          FeeFlow
        </Typography>
      </Toolbar>
      <Divider />

      <List>
        {navItems.map(({ text, icon, path }) => (
          <ListItemButton key={text} onClick={() => navigate(path)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List 
      className='quick-actions-list'
      subheader={
        <Typography variant="subtitle2" sx={{ pl: 2, pt: 1 }}>Quick Actions</Typography>
      }>
        {quickActions.map(({ text, icon, path }) => (
          <ListItemButton key={text} onClick={() => navigate(path)}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />

      <List>
        <ListItemButton onClick={() => navigate('/profile')}>
          <ListItemIcon><AccountCircle sx={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon sx={{ color: '#fff' }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ color: '#fff' }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Permanent drawer on desktop, swipeable on mobile */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: '#053827ff',  
              color: '#fff'         
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          // ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
