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
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'descending' });
  const [filterStudent, setFilterStudent] = useState('');

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
  // Sorting logic
  // const sortedFees = React.useMemo(() => {
  //   let sortableFees = [...fees];
  //   if (sortConfig !== null) {
  //     sortableFees.sort((a, b) => {
  //       if (a[sortConfig.key] < b[sortConfig.key]) {
  //         return sortConfig.direction === 'ascending' ? -1 : 1;
  //       }
  //       if (a[sortConfig.key] > b[sortConfig.key]) {
  //         return sortConfig.direction === 'ascending' ? 1 : -1;
  //       }
  //       return 0;
  //     });
  //   }
  //   return sortableFees;
  // }, [fees, sortConfig]);

  const sortedFees = React.useMemo(() => {
    let sortableFees = [...fees];
    if (sortConfig.key) {
      sortableFees.sort((a, b) => {
        // Access nested student name correctly
        const aValue = sortConfig.key === 'studentName' ? a.enrollment.student.name : a[sortConfig.key];
        const bValue = sortConfig.key === 'studentName' ? b.enrollment.student.name : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFees;
  }, [fees, sortConfig]);

  // Filtering logic
  const filteredAndSortedFees = sortedFees.filter(fee => {
    if (!filterStudent) return true;
    return fee.enrollment.student._id === filterStudent;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
          <Link component={RouterLink} to="/classes">
            Your Classes
          </Link>
          <Typography color="text.primary">
            {classInfo.name}
          </Typography>
        </Breadcrumbs>
      )
      }
      {classInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          {/* <Box>
            <Typography className="page-heading">{classInfo.name}</Typography>
            <Typography color="text.secondary">
              Fee: ₹{classInfo.fees.amount} ({classInfo.fees.frequency})
            </Typography>
          </Box> */}
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {classInfo.name} - Grade {classInfo.grade}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Fee: ₹{classInfo.fees.amount} ({classInfo.fees.frequency})
            </Typography>
          </Box>
          <Button
            className="button-primary"
            onClick={() => navigate(`/classes/${classId}/edit`)}
            startDecorator={<EditIcon />}
          >
            Edit Class
          </Button>
        </Box>
      )}

      {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography className="page-heading">Class Detail</Typography>
        <Button
          className="button-primary"
          onClick={() => navigate(`/classes/${classId}/edit`)}
          startDecorator={<EditIcon />}
        >
          Edit Class
        </Button>
      </Box> */}

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* Student Filter Dropdown */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filter by Active Student</InputLabel>
            <Select
              value={filterStudent}
              label="Filter by Active Student"
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <MenuItem value=""><em>All Students</em></MenuItem>
              {activeStudents.map(s => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

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
            {/* <TableHead> */}
              {/* <TableRow> */}
                {/* Make TableCell headers clickable */}
                {/* <TableCell onClick={() => requestSort('studentName')}>Student</TableCell> */}
                {/* <TableCell>Period</TableCell> */}
                {/* <TableCell onClick={() => requestSort('dueDate')}>Due Date</TableCell> */}
                {/* <TableCell onClick={() => requestSort('status')}>Status</TableCell> */}
                {/* <TableCell>Paid / Due</TableCell> */}
                {/* <TableCell align="right">Action</TableCell> */}
              {/* </TableRow> */}
            {/* </TableHead> */}
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={() => requestSort('studentName')}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Student
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                  <TableCell
                    onClick={() => requestSort('dueDate')}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    onClick={() => requestSort('status')}
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Paid / Due</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
            <TableBody>
              {/* Use the new filtered and sorted array */}
              {filteredAndSortedFees.map(f => (
                <TableRow key={f._id}>
                  <TableCell>{f.enrollment.student.name}</TableCell>
                  <TableCell>{f.period.month}/{f.period.year}</TableCell>
                  <TableCell>
                    {new Date(f.dueDate).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{f.status}</TableCell>
                  <TableCell>₹{f.amountPaid} / ₹{f.amount}</TableCell>
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
        {/* ... (Pay dialog remains the same) ... */}
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
