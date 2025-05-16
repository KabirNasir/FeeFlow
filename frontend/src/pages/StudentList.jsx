import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

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
  CircularProgress
} from '@mui/material';

import '../styles/Layout.css';

const StudentList = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography className="page-heading">All Students</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((stu) => (
              <TableRow key={stu._id}>
                <TableCell>{stu.name}</TableCell>
                <TableCell>{stu.email || '—'}</TableCell>
                <TableCell>{stu.parentInfo.email}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => openEnroll(stu._id)}
                  >
                    Enroll
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

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
