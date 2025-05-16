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
  TextField
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography className="page-heading">Class Detail</Typography>

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
          <Paper>
            {students.length
              ? <List>
                {students.map(s => (
                  <ListItem key={s._id} divider>
                    <ListItemText
                      primary={s.name}
                      secondary={s.parentInfo?.email || s.email}
                    />
                  </ListItem>
                ))}
              </List>
              : <Box sx={{ p: 2 }}>No students enrolled yet.</Box>
            }
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
