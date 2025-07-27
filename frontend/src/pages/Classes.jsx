import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import { AuthContext } from '../contexts/AuthContext';
import { Box, Grid, Card, CardContent, CardActions, Typography, CircularProgress } from '@mui/material';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
import '../styles/Layout.css';

const Classes = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // This data-fetching pattern is identical to StudentList.jsx
    const fetchClasses = async () => {
      try {
        console.log("About to fetch classes", api.defaults.headers.common['Authorization']);
        const [stuRes, clsRes] = await Promise.all([
          api.get('/students'),
          api.get('/classes')
        ]);
        console.log("Classes fetched", clsRes.data.data);
        setStudents(stuRes.data.data);
        setClasses(clsRes.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          // It's good practice to log other errors
          console.error("Failed to fetch classes:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [logout, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography className="page-heading" variant="h4">All Classes</Typography>
        <button className="button-primary" onClick={() => navigate('/classes/new')}>
          Create Class
        </button>
      </Box>

      <Grid container spacing={3}>
        {classes.map((cls) => (
          <Grid item xs={12} sm={6} md={4} key={cls._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{cls.name}</Typography>
                <Typography color="text.secondary">{cls.subject} — Grade {cls.grade}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="soft"
                  onClick={() => navigate(`/classes/${cls._id}`)}
                  startDecorator={<Add />}
                  sx={{ backgroundColor: 'var(--asparagus)', color: 'white', '&:hover': { backgroundColor: 'var(--sunglow)' } }}
                >
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Classes;