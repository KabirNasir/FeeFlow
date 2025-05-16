// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data);
      } catch (err) {
        // If unauthorized, clear token and redirect to login
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          console.error('Failed to load classes:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [navigate, logout]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4">Your Classes</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/classes/new')}
        >
          + Create Class
        </Button>
      </Box>

      {classes.length === 0 ? (
        <Typography>No classes found. Create one to get started!</Typography>
      ) : (
        <List>
          {classes.map((cls) => (
            <ListItemButton
              key={cls._id}
              onClick={() => navigate(`/classes/${cls._id}`)}
              sx={{ borderRadius: 2, mb: 1 }}
            >
              <ListItemText
                primary={cls.name}
                secondary={`${cls.subject} — Grade ${cls.grade}`}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Dashboard;
