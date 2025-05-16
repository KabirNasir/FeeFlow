import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';

import '../styles/Layout.css';  // for .page-heading, .button-primary, etc.

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [logout, navigate]);

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
    <Box sx={{ p: 3 }}>
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography className="page-heading">Your Classes</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            className="button-primary"
            onClick={() => navigate('/classes/new')}
          >
            Create Class
          </Button>
          
          <Button
            className="button-primary"
            onClick={() => navigate('/students')}
          >
            List Students
          </Button>
          <Button
            className="button-primary"
            onClick={() => navigate('/students/new')}
          >
            Enter Student Details
          </Button>
        </Box>
      </Box>

      {/* Cards grid */}
      <Grid container spacing={3}>
        {classes.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {cls.name}
                </Typography>
                <Typography color="text.secondary">
                  {cls.subject} — Grade {cls.grade}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/classes/${cls._id}`)}>
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {!classes.length && (
          <Grid item xs={12}>
            <Typography>No classes yet. Create one to get started!</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;


