import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

// Components
import Card from '@mui/joy/Card';
import {
  CardContent,
  Typography,
  CardActions,
  Button,
  Grid,
  CardCover
} from '@mui/joy';
import { PieChart} from '@mui/x-charts/PieChart';

// icons
import Add from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// CSS Styles
import '../styles/Dashboard.css';

const DashboardReimagined = () => {
  const [summary, setSummary] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, classesRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/classes'),
        ]);

        setSummary(summaryRes.data.data);
        setClasses(classesRes.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Failed to load dashboard data.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [logout, navigate]);

  if (loading) {
    return <Typography level="body-md">Loading dashboard...</Typography>;
  }

  if (error) {
    return <Typography level="body-md" color="danger">{error}</Typography>;
  }

  const pieData = [
    { label: 'Total Paid Amount in USD', value: summary?.totalPaid || 0 , color: 'var(--sunglow)' },
    { label: 'Total Outstanding Amount in USD', value: summary?.totalOutstanding || 0 , color: 'var(--asparagus)' },
  ];

  return (
    <div className="dashboard-container">
      {/* <Typography level="h1" sx={{ color: 'var(--darkgreen)' }}>Dashboard</Typography> */}
      <Typography level="h3" sx={{ color: 'var(--asparagus)' }}>
        Welcome, {summary?.user?.name || 'User'}!
      </Typography>
      <br/>
      <br />
      <Grid container columns={15} spacing={1} sx={{ flexGrow: 1 }}>
        {/* Total Students Card */}
        <Grid item xs={5}> 
          <Card variant="solid" color="success" invertedColors>
          <CardContent orientation="horizontal">
              <PersonIcon fontSize="large" sx={{scale: '1.2'}}/>
          <CardContent>
                  <Typography level="body-md">Total Students</Typography>
                  <Typography level="h2">{summary?.totalStudents}</Typography>
                </CardContent>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
        </Grid>

        {/* Total Classes Card */}
        <Grid item xs={5}> 
          <Card variant="solid" color="success" invertedColors>
          <CardContent orientation="horizontal">
              <ClassIcon fontSize="large" sx={{scale: '1.2'}}/>
          <CardContent>
                  <Typography level="body-md">Total Classes</Typography>
                  <Typography level="h2">{summary?.totalClasses}</Typography>
                </CardContent>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
        </Grid>

        {/* Total Unpaid Card */}
        <Grid item xs={5}> 
          <Card variant="solid" color="success" invertedColors>
          <CardContent orientation="horizontal">
              <AttachMoneyIcon fontSize="large" sx={{scale: '1.2'}}/>
          <CardContent>
                  <Typography level="body-md">Total Classes</Typography>
                  <Typography level="h2">$ {summary?.totalOutstanding}</Typography>
                </CardContent>
              </CardContent>
              <CardActions>
              </CardActions>
            </Card>
        </Grid>

      </Grid>
    
      <br/>
      <br />
      <Typography level="h3" sx={{ color: 'var(--darkgreen)' }}>Your Classes</Typography>

      <br />
      <div>
        <Grid container columns={16} spacing={3} sx={{ flexGrow: 1 }}>
        {classes.map((cls) => (
          <Grid item xs={4}>
            <Card
              color="success"
              variant="soft"
              invertedColors
              sx={{
                width: '100%',
                color: 'var(--asparagus)', 
                // margin: '10px' ,
                '&:hover': {
                  scale: 1.05, // slightly enlarge on hover
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)', // subtle shadow on hover for effect
                  cursor: 'pointer', // show pointer cursor on hover
                },
              }}
            >
              <CardCover>
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/007/550/615/small_2x/back-to-school-seamless-outline-pattern-free-vector.jpg"
                  loading="lazy"
                  alt=""
                  className='bgimage'
                />
              </CardCover>
              <CardContent>
                <Typography level="body-md">{cls.name.split(' ')[0]}</Typography>
                <Typography level="h2">
                  {cls.name.split(' ').slice(1).join(' ') || 'Grade X'}
                </Typography>
              </CardContent>
              <CardActions>
                {/* <Button variant="soft" size="sm" sx={{ color: 'var(--asparagus)' }}>
                  View
                </Button> */}
                <Button variant="solid" size="sm" sx={{ color: 'var(--white)' }} startDecorator={<Add />} onClick={() => navigate(`/classes/${cls._id}`)}>
                  View
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        </Grid>

        <br/>
        <br/>
        {/* Fee Status Overview */}
        <Typography level="h3" sx={{ color: 'var(--darkgreen)' }}>Fee Status Overview</Typography>
        <br/>
        <Grid>
            <Card 
            variant="soft" 
            color="success" 
            invertedColors
            >
            <CardContent orientation="horizontal">
               <CardCover>
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/007/550/615/small_2x/back-to-school-seamless-outline-pattern-free-vector.jpg"
                  loading="lazy"
                  alt=""
                  className='bgimage'
                />
              </CardCover>
              <CardContent>
                <PieChart
                  series={[{ innerRadius: 50, outerRadius: 100, data: pieData, arcLabel: 'value' }]}
                  width={200}
                  height={200}
                />
              </CardContent>
            </CardContent>
          </Card>
        </Grid>

      </div>
    </div>
  );
};

export default DashboardReimagined;