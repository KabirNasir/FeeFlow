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
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer, toast } from 'react-toastify'; // 1. Import toast
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Layout.css';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // --- Delete confirmation state ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data.data);
      } catch (err) {
        toast.error("Failed to fetch classes."); // Error toast for fetch
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

  const handleDeleteClick = (classId) => {
    setClassToDelete(classId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (classToDelete) {
      try {
        await api.delete(`/classes/${classToDelete}`);
        setClasses(currentClasses => currentClasses.filter(c => c._id !== classToDelete));
        toast.success('Class deleted successfully!'); // 2. Add success toast
      } catch (err) {
        toast.error("Failed to delete class."); // 3. Add error toast
        setError("Failed to delete class.");

        console.error("Failed to delete class:", err);
      } finally {
        setConfirmOpen(false);
        setClassToDelete(null);
      }
    }
  };

  const filteredClasses = classes.filter(cls =>
    (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.subject && cls.subject.toLowerCase().includes(searchTerm.toLowerCase()))
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
      {/* 4. Add ToastContainer */}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography className="page-heading" variant="h4">All Classes</Typography>
        <Button
          className="button-primary"
          onClick={() => navigate('/classes/new')}
        >
          Create Class
        </Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

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
              <TableCell className="table-header-cell" align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses.map((cls) => (
              <TableRow key={cls._id} hover>
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
                  <IconButton onClick={() => handleDeleteClick(cls._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Class"
        message="Are you sure you want to delete this class? This will also unenroll all students and cannot be undone."
      />
    </Box>
  );
};

export default Classes;
