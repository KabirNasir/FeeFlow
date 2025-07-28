import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ConfirmDialog from '../components/ConfirmDialog';
import EnrollDialog from '../components/EnrollDialog';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Link
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
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [initialStudentIds, setInitialStudentIds] = useState([]);


  // fetch students + classes
  useEffect(() => {
    (async () => {
      try {
        const [stuRes, clsRes] = await Promise.all([
          api.get('/students'),
          api.get('/classes')
        ]);
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

  const openEnrollDialog = (stuId) => {
    setInitialStudentIds(stuId ? [stuId] : []);
    setEnrollDialogOpen(true);
  };

  const handleEnroll = async ({ classId, studentIds }) => {
    try {
      // *** CHANGE 1: Corrected the API endpoint to handle multiple students ***
      await api.post(`/classes/${classId}/enroll-multiple`, { studentIds });
      setEnrollDialogOpen(false);
      toast.success('Student(s) enrolled successfully!');
    } catch (err) {
      toast.error("Failed to enroll student(s).")
      setError('Failed to enroll student(s).');
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
        toast.success('Student deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete student.');
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" className="page-heading">All Students</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* *** CHANGE 2: Added a button for bulk enrollment *** */}
          <Button
            className="button-primary"
            onClick={() => openEnrollDialog()}
          >
            Enroll Students
          </Button>
          <Button
          className="button-primary"
          onClick={() => navigate('/students/new')}
          >
            New Student
          </Button>
        </Box>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

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
         
                <TableCell className='table-body-cell'>{stu.name}</TableCell>

                <TableCell className='table-body-cell'>{stu.email || '—'}</TableCell>
                <TableCell className='table-body-cell'>{stu.parentInfo?.email || '—'}</TableCell>
                <TableCell align="right">
                  <Button className='student-table-actions'
                    size="small"
                    onClick={() => openEnrollDialog(stu._id)}
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

      <EnrollDialog
        open={enrollDialogOpen}
        onClose={() => setEnrollDialogOpen(false)}
        onEnroll={handleEnroll}
        studentsList={students}
        classList={classes}
        initialSelectedStudentIds={initialStudentIds}
      />

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
