import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/StudentList.css';


const StudentList = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // fetch students + classes
  useEffect(() => {
    (async () => {
      try {
        const [stuRes, clsRes] = await Promise.all([
          api.get('/students'),
          api.get('/classes')
        ]);
        // Assuming the API returns data in a 'data' property
        setStudents(stuRes.data.data || stuRes.data);
        setClasses(clsRes.data.data || clsRes.data);
      } catch (err) {
        setError('Failed to fetch data.');
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [logout, navigate]);

  const openEnroll = (stuId) => {
    setSelectedStudent(stuId);
    setDialogOpen(true);
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/classes/${selectedClass}/enroll`, {
        studentId: selectedStudent
      });
      setDialogOpen(false);
      // Maybe add a success message here
    } catch (err) {
      setError('Failed to enroll student.');
      console.error(err);
    }
  };

  const handleDeleteClick = (id) => {
    setStudentToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await api.delete(`/students/${studentToDelete}`);
        setStudents(students.filter((student) => student._id !== studentToDelete));
      } catch (err) {
        setError('Failed to delete student.');
        console.error(err);
      } finally {
        setConfirmOpen(false);
        setStudentToDelete(null);
      }
    }
  };

  // Filter students based on the search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" className="page-heading">All Students</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-student')}
        >
          New Student
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by student name..."
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

      {/* Student Table */}
      <Paper>
        <Table className='student-table' sx={{ marginTop: '2rem' }}>
          <TableHead>
            <TableRow>
              <TableCell className="table-header-cell">Name</TableCell>
              <TableCell className="table-header-cell">Email</TableCell>
              <TableCell className="table-header-cell">Parent</TableCell>
              <TableCell className="table-header-cell" align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((stu) => (
              <TableRow key={stu._id} hover>
                {/* <TableCell className='table-body-cell'>
                  <Link to={`/students/${stu._id}`} className="student-name-link">
                    {stu.name}
                  </Link>
                </TableCell> */}
                <TableCell className='table-body-cell'>{stu.name}</TableCell>

                <TableCell className='table-body-cell'>{stu.email || '—'}</TableCell>
                <TableCell className='table-body-cell'>{stu.parentInfo?.email || '—'}</TableCell>
                <TableCell align="right">
                  <Button className='student-table-actions'
                    size="small"
                    onClick={() => openEnroll(stu._id)}
                  >
                    Enroll
                  </Button>
                  <IconButton
                    className="student-list-icon"
                    onClick={() => navigate(`/students/${stu._id}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton className="student-list-icon" onClick={() => handleDeleteClick(stu._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    className="student-list-icon"
                    onClick={() => navigate(`/students/${stu._id}/profile`)}
                    title="View Profile"
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Enroll Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Enroll Student in Class</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              value={selectedClass}
              label="Class"
              onChange={e => setSelectedClass(e.target.value)}
            >
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedClass}
            onClick={handleEnroll}
          >
            Enroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This will remove all their records and cannot be undone."
      />
    </Box>
  );
};

export default StudentList;