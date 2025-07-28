
// src/pages/CreateStudent.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';

import '../styles/Layout.css';
import { toast } from 'react-toastify'
const CreateStudent = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    parentInfo: { name: '', email: '', phone: '', preferredContact: 'email' }
  });
  // const [error, setError] = useState(''); // delete
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('parentInfo.')) {
      const key = name.split('.')[1];
      setForm(f => ({
        ...f,
        parentInfo: { ...f.parentInfo, [key]: value }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // setError('');
    setSubmitting(true);
    setErrors({});

    // simple validation
    // if (!form.name || !form.parentInfo.name || !form.parentInfo.email || !form.parentInfo.phone) {
    //   setError('Please fill in all required student & parent fields');
    //   setSubmitting(false);
    //   return;
    // }

    try {
      await api.post('/students', form);
      toast.success('Student created successfully!');
      navigate('/students');
    } catch (err) {
      // if (err.response?.status === 401) {
      //   logout();
      //   navigate('/login');
      // } else {
      //   setError(err.response?.data?.message || 'Failed to create student');
      // }
      if (err.response?.status === 400 && err.response.data.errors) {
        // Handle validation errors from the backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        // setErrors({ general: err.response?.data?.message || 'Failed to create student' });
        const errorMessage = err.response?.data?.message || 'Failed to create student';
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // if (submitting) {
  //   return (
  //     <Box sx={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }} elevation={4}>
        <Typography className="page-heading" gutterBottom>
          Enter Student Details
        </Typography>

        {/* {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>} */}
        {errors.general && <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Student Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            fullWidth
            label="Student Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            error={!!errors.email}
            helperText={errors.email}
            />

          <TextField
            fullWidth
            label="Student Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
            error={!!errors.phone}
            helperText={errors.phone}
            />

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Parent / Guardian Info</Typography>

          <TextField
            fullWidth
            label="Parent Name"
            name="parentInfo.name"
            value={form.parentInfo.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            error={!!errors['parentInfo.name']}
            helperText={errors['parentInfo.name']}
          />

          <TextField
            fullWidth
            label="Parent Email"
            name="parentInfo.email"
            value={form.parentInfo.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            error={!!errors['parentInfo.email']}
            helperText={errors['parentInfo.email']}
          />

          <TextField
            fullWidth
            label="Parent Phone"
            name="parentInfo.phone"
            value={form.parentInfo.phone}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            error={!!errors['parentInfo.phone']}
            helperText={errors['parentInfo.phone']}
          />

          <Button
            className="button-primary"
            variant="contained"
            type="submit"
            sx={{ mt: 3 }}
          >
            Save Student
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateStudent;
