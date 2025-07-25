// src/pages/ClassDetail.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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


  // ─── NEW: store the class’s name/details for breadcrumbs ────────────────
  const [classInfo, setClassInfo] = useState(null);
  // --- Students tab state ---
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [allStudents, setAllStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  // --- Fees tab state ---
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

  const [payDialog, setPayDialog] = useState({ open: false, feeId: null });
  const [payAmount, setPayAmount] = useState('');

  // fetch enrolled students when component mounts
  useEffect(() => {
    (async () => {
      try {
        // const res = await api.get(`/classes/${classId}/students`);
        // setStudents(res.data.data);

        // ─── NEW: fetch the class itself ───────────────────────────────
        const classRes = await api.get(`/classes/${classId}`);
        setClassInfo(classRes.data.data);

        // then fetch students as before
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

  // fetch fees whenever the Fees tab is activated
  useEffect(() => {
    if (tab !== 1) return;
    (async () => {
      setLoadingFees(true);
      try {
        const res = await api.get(`/classes/${classId}/fees`);
        setFees(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoadingFees(false);
      }
    })();
  }, [tab, classId, logout, navigate]);

  // open “Enroll student” dialog
  const openEnrollDialog = async () => {
    setDialogOpen(true);
    if (!allStudents.length) {
      const res = await api.get('/students');
      setAllStudents(res.data.data);
    }
  };

  // handle enrolling an existing student
  const handleEnroll = async () => {
    try {
      await api.post(`/classes/${classId}/enroll`, { studentId: selectedStudent });
      const res = await api.get(`/classes/${classId}/students`);
      setStudents(res.data.data);
      setDialogOpen(false);
      setSelectedStudent('');
    } catch (err) {
      console.error(err);
    }
  };

  // open “Pay fee” dialog
  const openPayDialog = (fee) => {
    setPayDialog({ open: true, feeId: fee._id });
    setPayAmount('');
  };

  // record a payment
  const handlePay = async () => {
    try {
      await api.put(`/fees/${payDialog.feeId}/pay`, { amountPaid: Number(payAmount) });
      // refresh fee list
      const res = await api.get(`/classes/${classId}/fees`);
      setFees(res.data.data);
      setPayDialog({ open: false, feeId: null });
    } catch (err) {
      console.error(err);
    }
  };
  const handleUnenroll = async (studentId) => {
    if (window.confirm('Are you sure you want to unenroll this student?')) {
      try {
        await api.put(`/classes/${classId}/unenroll`, { studentId });
        // Refresh student list
        const res = await api.get(`/classes/${classId}/students`);
        setStudents(res.data.data);
      } catch (err) {
        console.error('Failed to unenroll student:', err);
        // Optionally, show an error to the user
      }
    }
  };

  // Group students by status
  const activeStudents = students.filter(s => s.enrollmentStatus === 'active');
  const inactiveStudents = students.filter(s => s.enrollmentStatus !== 'active');

  return (
    <Box sx={{ p: 3 }}>

      {/* ─── NEW: show “Dashboard > Your Classes > This Class” ───────────── */}
      {classInfo && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2, fontUnderline: 'none' }}
        >
          <Link component={RouterLink} to="/dashboard">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/dashboard">
            Your Classes
          </Link>
          <Typography color="text.primary">
            {classInfo.name}
          </Typography>
        </Breadcrumbs>
      )
      }
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography className="page-heading">Class Detail</Typography>
        <Button
          className="button-primary"
          onClick={() => navigate(`/classes/${classId}/edit`)}
          startDecorator={<EditIcon />}
        >
          Edit Class
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Students" />
        <Tab label="Fees" />
      </Tabs>

      {/* ================= STUDENTS TAB ================= */}
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
          <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <Paper sx={{ backgroundColor: '#f0f7f2', borderRadius: '16px' }}>
            {activeStudents.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'green' }}>Active Students</Typography>
                <List className='students-list'>
                  {activeStudents.map(s => (
                    <ListItem key={s._id} divider secondaryAction={
                      // <IconButton
                      //   edge="end"
                      //   aria-label="unenroll"
                      //   onClick={() => handleUnenroll(s._id)}
                      // >
                      //   <DeleteIcon color="inherit" sx={{ color: 'green' }} />
                      // </IconButton>
                      <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleUnenroll(s._id)}
                      sx={{ minWidth: 0, px: 1.5, fontWeight: 600 }}
                    >
                      Unenroll
                    </Button>
                    }>
                      <ListItemText
                        primary={s.name}
                        secondary={
                          <>
                            {s.parentInfo?.email || s.email}
                            <span style={{ marginLeft: 8, color: 'green' }}>
                              ({s.enrollmentStatus})
                            </span>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {inactiveStudents.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'gray' }}>Inactive Students</Typography>
                <List className='students-list'>
                  {inactiveStudents.map(s => (
                    <ListItem key={s._id} divider>
                      <ListItemText
                        primary={s.name}
                        secondary={
                          <>
                            {s.parentInfo?.email || s.email}
                            <span style={{ marginLeft: 8, color: 'gray' }}>
                              ({s.enrollmentStatus})
                            </span>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {students.length === 0 && (
              <Box sx={{ p: 2 }}>No students enrolled yet.</Box>
            )}
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
                {allStudents.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name} ({s.parentInfo?.email || s.email})
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


      {/* ================= FEES TAB ================= */}
      <TabPanel value={tab} index={1}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            className="button-primary"
            onClick={async () => {
              await api.post(`/classes/${classId}/generate-fees`);
              const r = await api.get(`/classes/${classId}/fees`);
              setFees(r.data.data);
            }}
          >
            Generate Fees
          </Button>
        </Box>

        {loadingFees ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Paid / Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map(f => (
                <TableRow key={f._id}>
                  <TableCell>
                    {f.enrollment.student.name}
                  </TableCell>
                  <TableCell>{f.period.month}/{f.period.year}</TableCell>
                  <TableCell>
                    {new Date(f.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {f.amountPaid} / {f.amount}
                  </TableCell>
                  <TableCell>{f.status}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openPayDialog(f)}>
                      <PaymentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pay dialog */}
        <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false })}>
          <DialogTitle>Record a Payment</DialogTitle>
          <DialogContent>
            <TextField
              label="Amount to Pay"
              type="number"
              fullWidth
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              className="button-primary"
              onClick={handlePay}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>
    </Box>
  );
};

export default ClassDetail;
