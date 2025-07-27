// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

// MUI Components
import {
  Box, Grid, Paper, Typography, CircularProgress, Alert, Card, CardContent, CardActions
} from '@mui/material';

// Charting Library
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
// Styles
import '../styles/Dashboard.css';
import '../styles/Layout.css';

// A reusable summary card component
const SummaryCard = ({ title, value, linkTo }) => (
  <Paper component={Link} to={linkTo} className="summary-card" sx={{ textDecoration: 'none' }}>
    <Typography variant="h6" className="summary-card-title">{title}</Typography>
    <Typography variant="h3" className="summary-card-value">{value}</Typography>
  </Paper>
);

const Dashboard = () => {
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
          api.get('/classes')
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const pieData = [
    { name: 'Total Paid', value: summary?.totalPaid || 0 },
    { name: 'Total Outstanding', value: summary?.totalOutstanding || 0 },
  ];

  const COLORS = ['#6a994e', '#fccd56'];

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      {/* === 1. HEADER === */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" className="page-heading">Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <button className="button-primary" onClick={() => navigate('/students/new')}>Add Student</button>
          <button className="button-primary" onClick={() => navigate('/classes/new')}>Create Class</button>
        </Box>
      </Box>

      {/* === 2. SUMMARY CARDS === */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Total Students" value={summary?.totalStudents} linkTo="/students" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Classes" value={summary?.totalClasses} linkTo="#classes-section" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Total Unpaid" value={`$${summary?.totalOutstanding}`} linkTo="/reports" />
        </Grid>
      </Grid>

      {/* === 3. MAIN CONTENT AREA (CLASSES & CHART) === */}
      <Grid container spacing={3}>
        {/* Left Column: Class List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" className="page-heading" sx={{ mb: 2 }} id="classes-section">Your Classes</Typography>
          <Grid container spacing={3}>
            {classes.map((cls) => (
              <Grid item xs={12} sm={6} key={cls._id}>
                <Card sx={{ borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{cls.name}</Typography>
                    <Typography color="text.secondary">{cls.subject} — Grade {cls.grade}</Typography>
                  </CardContent>
                  {/* <CardActions>
                    <button className="button-primary-small" onClick={() => navigate(`/classes/${cls._id}`)}>
                      View Class
                    </button>
                  </CardActions> */}
                  <CardActions>
                    <Button
                      size="small"
                      variant="soft"
                      onClick={() => navigate(`/classes/${cls._id}`)}
                      startDecorator={<Add />}
                      sx={{
                        backgroundColor: 'var(--asparagus)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'var(--sunglow)',
                        }
                      }}
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {!loading && classes.length === 0 && (
              <Grid item xs={12}>
                <Typography>No classes yet. Create one to get started!</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Right Column: Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper className="chart-card">
            <Typography variant="h6" className="chart-title">Fee Status Overview</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

// // frontend/src/pages/Dashboard.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import api from '../services/api';
// import { AuthContext } from '../contexts/AuthContext';

// // MUI Components
// import {
//   Box, Grid, Paper, Typography, CircularProgress, Alert, Card, CardContent, CardActions,Button
// } from '@mui/material';

// // Charting Library
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// // Styles
// import '../styles/Dashboard.css';
// import '../styles/Layout.css';

// // A reusable summary card component
// const SummaryCard = ({ title, value, linkTo }) => (
//   <Paper component={Link} to={linkTo} className="summary-card" sx={{ textDecoration: 'none' }}>
//     <Typography variant="h6" className="summary-card-title">{title}</Typography>
//     <Typography variant="h3" className="summary-card-value">{value}</Typography>
//   </Paper>
// );

// const Dashboard = () => {
//   const [summary, setSummary] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const navigate = useNavigate();
//   const { logout } = useContext(AuthContext);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch both summary data and class list at the same time
//         const [summaryRes, classesRes] = await Promise.all([
//           api.get('/dashboard/summary'),
//           api.get('/classes')
//         ]);

//         setSummary(summaryRes.data.data);
//         setClasses(classesRes.data.data);

//       } catch (err) {
//         if (err.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           setError('Failed to load dashboard data.');
//           console.error(err);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [logout, navigate]);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return <Alert severity="error">{error}</Alert>;
//   }

//   const pieData = [
//     { name: 'Total Paid', value: summary?.totalPaid || 0 },
//     { name: 'Total Outstanding', value: summary?.totalOutstanding || 0 },
//   ];

//   const COLORS = ['#6a994e', '#fccd56']; // --asparagus and --sunglow

//   return (
//     <Box className="dashboard-container" sx={{ p: 3 }}>
//       <Typography variant="h4" className="page-heading" sx={{ mb: 3 }}>Dashboard</Typography>

//       {/* --- TOP ROW: SUMMARY & CHART --- */}
//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {/* Summary Cards */}
//         <Grid item xs={12} md={8}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={4}>
//               <SummaryCard title="Total Students" value={summary?.totalStudents} linkTo="/students" />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <SummaryCard title="Classes" value={summary?.totalClasses} linkTo="/dashboard" />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <SummaryCard title="Total Unpaid" value={`INR ${summary?.totalOutstanding}`} linkTo="/reports" />
//             </Grid>
//           </Grid>
//         </Grid>
//         {/* Pie Chart */}
//         <Grid item xs={12} md={4}>
//           <Paper className="chart-card">
//             <Typography variant="h6" className="chart-title">Fee Status Overview</Typography>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* --- BOTTOM SECTION: QUICK ACTIONS & CLASS LIST --- */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 4 }}>
//         <Typography className="page-heading" variant="h5">Quick Actions & Classes</Typography>
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <button className="button-primary" onClick={() => navigate('/students/new')}>Add Student</button>
//           <button className="button-primary" onClick={() => navigate('/classes/new')}>Create Class</button>
//         </Box>
//       </Box>

//       {/* Class Cards Grid */}
//       <Grid container spacing={3}>
//         {classes.map((cls) => (
//           <Grid item xs={12} sm={6} md={4} key={cls._id}>
//             <Card sx={{ borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
//               <CardContent sx={{ flexGrow: 1 }}>
//                 <Typography variant="h6" gutterBottom>{cls.name}</Typography>
//                 <Typography color="text.secondary">{cls.subject} — Grade {cls.grade}</Typography>
//               </CardContent>
//               <CardActions>
//                 <Button variant="contained" className="button-primary" size="small" onClick={() => navigate(`/classes/${cls._id}`)}>
//                   View Class
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>
//         ))}
//         {!loading && classes.length === 0 && (
//           <Grid item xs={12}>
//             <Typography>No classes yet. Create one to get started!</Typography>
//           </Grid>
//         )}
//       </Grid>
//     </Box>
//   );
// };

// export default Dashboard;

// import React, { useEffect, useState, useContext } from 'react';

// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import { AuthContext } from '../contexts/AuthContext';

// import {
//   Grid,
//   Card,
//   CardContent,
//   CardActions,
//   // Button,
//   CircularProgress,
//   Box,
//   Typography,
//   Alert
// } from '@mui/material';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// import Button from '@mui/joy/Button';
// import Add from '@mui/icons-material/Add';

// import '../styles/Layout.css';  // for .page-heading, .button-primary, etc.
// import '../styles/Dashboard.css'

// const Dashboard = () => {
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get('/classes');
//         setClasses(res.data.data);
//       } catch (err) {
//         if (err.response?.status === 401) {
//           logout();
//           navigate('/login');
//         }
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [logout, navigate]);

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           height: '100vh',
//           justifyContent: 'center',
//           alignItems: 'center'
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Page header */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           mb: 3
//         }}
//       >
//         <Typography className="page-heading" variant="h4" >Your Classes</Typography>
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Button
//             className="button-primary"
//             onClick={() => navigate('/classes/new')}
//           >
//             Create Class
//           </Button>
          
//           <Button
//             className="button-primary"
//             onClick={() => navigate('/students')}
//           >
//             List Students
//           </Button>
//           <Button
//             className="button-primary"
//             onClick={() => navigate('/students/new')}
//           >
//             Add New Student
//           </Button>
//         </Box>
//       </Box>

//       {/* Cards grid */}
//       <Grid container spacing={3}>
//         {classes.map((cls) => (
//           <Grid item xs={12} sm={6} md={4} key={cls._id}>
//             <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {cls.name}
//                 </Typography>
//                 <Typography color="text.secondary">
//                   {cls.subject} — Grade {cls.grade}
//                 </Typography>
//               </CardContent>
//               <CardActions>
//                 <Button 
//                   sx={{ 
//                     backgroundColor: 'var(--asparagus)',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: 'var(--sunglow)',
//                       boxShadow: 4,
//                       transition: 'backgroundColor 0.3s ease-in -out'
//                     }
//                   }} 
//                   size="small" 
//                   variant="soft" 
//                   onClick={() => navigate(`/classes/${cls._id}`)} 
//                   startDecorator={<Add />}>
//                   View
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>
//         ))}

//         {!classes.length && (
//           <Grid item xs={12}>
//             <Typography>No classes yet. Create one to get started!</Typography>
//           </Grid>
//         )}
//       </Grid>
//     </Box>
//   );
// };

// export default Dashboard;



// // // frontend/src/pages/Dashboard.jsx
// // import React, { useState, useEffect } from 'react';
// // import { Box, Grid, Paper, Typography, CircularProgress, Alert } from '@mui/material';
// // import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// // import { Link } from 'react-router-dom';
// // import api from '../services/api';
// // import '../styles/Dashboard.css';

// // const SummaryCard = ({ title, value, linkTo }) => (
// //   <Paper component={Link} to={linkTo} className="summary-card">
// //     <Typography variant="h6" className="summary-card-title">{title}</Typography>
// //     <Typography variant="h3" className="summary-card-value">{value}</Typography>
// //   </Paper>
// // );

// // const Dashboard = () => {
// //   const [summary, setSummary] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     const fetchSummary = async () => {
// //       try {
// //         const res = await api.get('/dashboard/summary');
// //         setSummary(res.data.data);
// //       } catch (err) {
// //         setError('Failed to load dashboard data.');
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchSummary();
// //   }, []);

// //   if (loading) {
// //     return (
// //       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   if (error) {
// //     return <Alert severity="error">{error}</Alert>;
// //   }

// //   const pieData = [
// //     { name: 'Total Paid', value: summary.totalPaid || 0 },
// //     { name: 'Total Outstanding', value: summary.totalOutstanding || 0 },
// //   ];

// //   const COLORS = ['#6a994e', '#fccd56']; // --asparagus and --sunglow from your CSS

// //   return (
// //     <Box className="dashboard-container">
// //       <Typography variant="h4" className="page-heading">Dashboard</Typography>
// //       <Grid container spacing={3}>
// //         {/* Summary Cards */}
// //         <Grid item xs={12} md={8}>
// //           <Grid container spacing={3}>
// //             <Grid item xs={12} sm={4}>
// //               <SummaryCard title="Total Students" value={summary.totalStudents} linkTo="/students" />
// //             </Grid>
// //             <Grid item xs={12} sm={4}>
// //               <SummaryCard title="Classes" value={summary.totalClasses} linkTo="/dashboard" />
// //             </Grid>
// //             <Grid item xs={12} sm={4}>
// //               <SummaryCard title="Total Unpaid" value={`$${summary.totalOutstanding}`} linkTo="/reports" />
// //             </Grid>
// //           </Grid>
// //         </Grid>

// //         {/* Pie Chart */}
// //         <Grid item xs={12} md={4}>
// //           <Paper className="chart-card">
// //             <Typography variant="h6" className="chart-title">Fee Status Overview</Typography>
// //             <ResponsiveContainer width="100%" height={250}>
// //               <PieChart>
// //                 <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
// //                   {pieData.map((entry, index) => (
// //                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //                   ))}
// //                 </Pie>
// //                 <Tooltip />
// //                 <Legend />
// //               </PieChart>
// //             </ResponsiveContainer>
// //           </Paper>
// //         </Grid>
// //       </Grid>
// //       {/* You can add "Quick Actions" and "Recent Activity" sections here later */}
// //     </Box>
// //   );
// // };

// // export default Dashboard;