import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';

import '../styles/Layout.css';

function TabPanel({ children, value, index }) {
  return value === index && (
    <Box sx={{ p: 2 }}>
      {children}
    </Box>
  );
}

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [tab, setTab] = useState(0);

  // students in this class
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // list of all students (for enrolling)
  const [allStudents, setAllStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    // fetch enrolled students
    (async () => {
      try {
        const res = await api.get(`/classes/${classId}/students`);
        setStudents(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoadingStudents(false);
      }
    })();
  }, [classId, logout, navigate]);

  const openEnrollDialog = async () => {
    setDialogOpen(true);
    // fetch all students only once
    if (!allStudents.length) {
      const res = await api.get('/students');
      setAllStudents(res.data.data);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/classes/${classId}/enroll`, {
        studentId: selectedStudent
      });
      // refresh list
      const res = await api.get(`/classes/${classId}/students`);
      setStudents(res.data.data);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      // handle errors as needed
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography className="page-heading">Class Detail</Typography>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Students" />
        <Tab label="Fees (coming soon)" disabled />
      </Tabs>

      {/* STUDENTS TAB */}
      <TabPanel value={tab} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Enrolled Students</Typography>
          <Button
            className="button-primary"
            variant="contained"
            onClick={openEnrollDialog}
          >
            + Enroll Student
          </Button>
        </Box>

        {loadingStudents ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <List>
              {students.map((stu) => (
                <ListItem key={stu._id} divider>
                  <ListItemText
                    primary={stu.name}
                    secondary={stu.parentInfo?.email || stu.email}
                  />
                </ListItem>
              ))}
              {!students.length && (
                <ListItem>
                  <ListItemText primary="No students enrolled yet." />
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Enroll Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Enroll Existing Student</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudent}
                label="Student"
                onChange={e => setSelectedStudent(e.target.value)}
              >
                {allStudents.map((stu) => (
                  <MenuItem key={stu._id} value={stu._id}>
                    {stu.name} ({stu.parentInfo?.email || stu.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedStudent}
              onClick={handleEnroll}
            >
              Enroll
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* FEES TAB */}
      <TabPanel value={tab} index={1}>
        <Typography>Fee management coming in Phase 3.</Typography>
      </TabPanel>
    </Box>
  );
};

export default ClassDetail;
