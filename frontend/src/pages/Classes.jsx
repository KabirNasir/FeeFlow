import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/joy/Button';
import Add from '@mui/icons-material/Add';
import '../styles/Layout.css';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
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
    };
    fetchClasses();
  }, [logout, navigate]);

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This will also unenroll all students.')) {
      try {
        await api.delete(`/classes/${classId}`);
        setClasses(currentClasses => currentClasses.filter(c => c._id !== classId));
      } catch (err) {
        console.error("Failed to delete class:", err);
        // Optionally show an error alert to the user
      }
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by class name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Classes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="table-header-cell">Class Name</TableCell>
              <TableCell className="table-header-cell">Subject</TableCell>
              <TableCell className="table-header-cell">Grade</TableCell>
              <TableCell className="table-header-cell">Fee Amount</TableCell>
              {/* <TableCell>Class Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Fee Amount</TableCell> */}
              <TableCell className="table-header-cell"  align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses.map((cls) => (
              <TableRow key={cls._id}>
                <TableCell className='table-body-cell'>{cls.name}</TableCell>
                <TableCell className='table-body-cell'>{cls.subject}</TableCell>
                <TableCell className='table-body-cell'>{cls.grade}</TableCell>
                <TableCell className='table-body-cell'>INR {cls.fees?.amount || 'N/A'}</TableCell>
                <TableCell align="right"> 
                  <Button
                    size="medium"
                    variant="soft"
                    color="success"
                    endDecorator={<KeyboardArrowRight />} 
                    onClick={() => navigate(`/classes/${cls._id}`)}
                  >
                    View
                  </Button>
                  <IconButton onClick={() => navigate(`/classes/${cls._id}/edit`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(cls._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Classes;

// import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// import { AuthContext } from '../contexts/AuthContext';
// import { Box, Grid, Card, CardContent, CardActions, Typography, CircularProgress } from '@mui/material';
// import Button from '@mui/joy/Button';
// import Add from '@mui/icons-material/Add';
// import '../styles/Layout.css';

// const Classes = () => {
//   const [students, setStudents] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // This data-fetching pattern is identical to StudentList.jsx
//     const fetchClasses = async () => {
//       try {
//         console.log("About to fetch classes", api.defaults.headers.common['Authorization']);
//         const [stuRes, clsRes] = await Promise.all([
//           api.get('/students'),
//           api.get('/classes')
//         ]);
//         console.log("Classes fetched", clsRes.data.data);
//         setStudents(stuRes.data.data);
//         setClasses(clsRes.data.data);
//       } catch (err) {
//         if (err.response?.status === 401) {
//           logout();
//           navigate('/login');
//         } else {
//           // It's good practice to log other errors
//           console.error("Failed to fetch classes:", err);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClasses();
//   }, [logout, navigate]);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography className="page-heading" variant="h4">All Classes</Typography>
//         <button className="button-primary" onClick={() => navigate('/classes/new')}>
//           Create Class
//         </button>
//       </Box>

//       <Grid container spacing={3}>
//         {classes.map((cls) => (
//           <Grid item xs={12} sm={6} md={4} key={cls._id}>
//             <Card sx={{ borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
//               <CardContent sx={{ flexGrow: 1 }}>
//                 <Typography variant="h6" gutterBottom>{cls.name}</Typography>
//                 <Typography color="text.secondary">{cls.subject} — Grade {cls.grade}</Typography>
//               </CardContent>
//               <CardActions>
//                 <Button
//                   size="small"
//                   variant="soft"
//                   onClick={() => navigate(`/classes/${cls._id}`)}
//                   startDecorator={<Add />}
//                   sx={{ backgroundColor: 'var(--asparagus)', color: 'white', '&:hover': { backgroundColor: 'var(--sunglow)' } }}
//                 >
//                   View
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// };

// export default Classes;