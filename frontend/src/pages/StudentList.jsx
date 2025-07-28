
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
import '../styles/StudentList.css';
import SearchIcon from '@mui/icons-material/Search';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

const StudentList = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // fetch students + classes
  useEffect(() => {
    (async () => {
      try {
        const [stuRes, clsRes] = await Promise.all([
          api.get('/students'),
          api.get('/classes')
        ]);
        setStudents(stuRes.data.data);
        setClasses(clsRes.data.data);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${studentId}`);
        setStudents((students) =>
          students.filter((s) => s._id !== studentId)
        );
      } catch (err) {
        console.error(err);
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
          className="button-primary"
          onClick={() => navigate('/students/new')}
        >
          + Add New Student
        </Button>
      </Box>

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
              <TableCell className='student-table-row-header'>Name</TableCell>
              <TableCell className='student-table-row-header'>Email</TableCell>
              <TableCell className='student-table-row-header'>Parent</TableCell>
              <TableCell className='student-table-row-header' align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* === THIS IS THE ONLY CHANGE === */}
            {/* Use the 'filteredStudents' array here instead of 'students' */}
            {filteredStudents.map((stu) => (
              <TableRow key={stu._id}>
                <TableCell className='student-table-name'>{stu.name}</TableCell>
                {/* <TableCell className='student-table-name'> */}
                  {/* MAKE THE NAME A CLICKABLE LINK */}
                  {/* <Link */}
                    {/* component={RouterLink} */}
                    {/* to={`/students/${stu._id}/profile`} */}
                    {/* sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }} */}
                  {/* > */}
                    {/* {stu.name} */}
                  {/* </Link> */}
                {/* // </TableCell> */}
                <TableCell className='student-table-email'>{stu.email || '—'}</TableCell>
                <TableCell className='student-table-parent-email'>{stu.parentInfo.email}</TableCell>
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
                  <IconButton className="student-list-icon" onClick={() => handleDelete(stu._id)}>
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
    </Box>
  );
};

export default StudentList;