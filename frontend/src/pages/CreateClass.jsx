// src/pages/CreateClass.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

import '../styles/Layout.css'; // for .page-heading, .button-primary, etc.
import { toast } from 'react-toastify';
const DAYS = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
];
const FREQUENCIES = ['weekly','monthly','quarterly','yearly'];

const CreateClass = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    subject: '',
    grade: '',
    description: '',
    schedule: { days: [] },
    fees: { amount: '', currency: 'INR', frequency: 'monthly', dueDay: 1 }
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['amount','currency','frequency','dueDay'].includes(name)) {
      setForm(f => ({
        ...f,
        fees: { ...f.fees, [name]: value }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleDayToggle = (day) => {
    setForm(f => {
      const days = f.schedule.days.includes(day)
        ? f.schedule.days.filter(d => d!==day)
        : [...f.schedule.days, day];
      return { ...f, schedule: { days } };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!form.name || !form.subject || !form.grade || form.schedule.days.length === 0) {
      setError('Please fill all required fields and select at least one day.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/classes', form);
      toast.success('Class created successfully!');
      navigate('/classes');
    } catch (err) {
      // if token expired or invalid, force logout
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to create class';
        // 3. (Optional) Show an error toast
        toast.error(errorMessage);
        setError(errorMessage);
        // setError(err.response?.data?.message || 'Failed to create class');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '60vh',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }} elevation={4}>
        <Typography className="page-heading" gutterBottom>
          Create New Class
        </Typography>

        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Class Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Subject */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Grade */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Grade"
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
            </Grid>

            {/* Schedule Days */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule Days *
              </Typography>
              <FormGroup row>
                {DAYS.map(day => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={form.schedule.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* Fees fields */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Fee Amount"
                name="amount"
                type="number"
                value={form.fees.amount}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Currency"
                name="currency"
                value={form.fees.currency}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={form.fees.frequency}
                  label="Frequency"
                  onChange={handleChange}
                >
                  {FREQUENCIES.map(f => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Due Day (1–31)"
                name="dueDay"
                type="number"
                inputProps={{ min: 1, max: 31 }}
                value={form.fees.dueDay}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                className="button-primary"
                variant="contained"
                type="submit"
                sx={{ px: 4 }}
              >
                Create Class
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateClass;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Grid,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Paper,
//   Alert
// } from '@mui/material';

// const DAYS = [
//   'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
// ];
// const FREQUENCIES = ['weekly','monthly','quarterly','yearly'];

// const CreateClass = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     subject: '',
//     grade: '',
//     description: '',
//     schedule: { days: [] },
//     fees: { amount: '', currency: 'INR', frequency: 'monthly', dueDay: 1 }
//   });
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // nested for fees.*
//     if (['amount','currency','frequency','dueDay'].includes(name)) {
//       setForm(f => ({
//         ...f,
//         fees: { ...f.fees, [name]: value }
//       }));
//     } else {
//       setForm(f => ({ ...f, [name]: value }));
//     }
//   };

//   const handleDayToggle = (day) => {
//     setForm(f => {
//       const days = f.schedule.days.includes(day)
//         ? f.schedule.days.filter(d => d!==day)
//         : [...f.schedule.days, day];
//       return { ...f, schedule: { days } };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     // Basic validation
//     if (!form.name || !form.subject || !form.grade || form.schedule.days.length===0) {
//       return setError('Please fill all required fields and select at least one day.');
//     }

//     try {
//       await api.post('/classes', form);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create class');
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }} elevation={4}>
//         <Typography variant="h4" sx={{ mb: 2 }}>
//           Create New Class
//         </Typography>

//         {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

//         <Box component="form" onSubmit={handleSubmit} noValidate>
//           <Grid container spacing={2}>
//             {/* Name */}
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Class Name"
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 required
//                 fullWidth
//               />
//             </Grid>

//             {/* Subject */}
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Subject"
//                 name="subject"
//                 value={form.subject}
//                 onChange={handleChange}
//                 required
//                 fullWidth
//               />
//             </Grid>

//             {/* Grade */}
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Grade"
//                 name="grade"
//                 value={form.grade}
//                 onChange={handleChange}
//                 required
//                 fullWidth
//               />
//             </Grid>

//             {/* Description */}
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Description"
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 multiline
//                 rows={2}
//                 fullWidth
//               />
//             </Grid>

//             {/* Schedule Days */}
//             <Grid item xs={12}>
//               <Typography variant="subtitle1" gutterBottom>
//                 Schedule Days *
//               </Typography>
//               <FormGroup row>
//                 {DAYS.map(day => (
//                   <FormControlLabel
//                     key={day}
//                     control={
//                       <Checkbox
//                         checked={form.schedule.days.includes(day)}
//                         onChange={() => handleDayToggle(day)}
//                       />
//                     }
//                     label={day}
//                   />
//                 ))}
//               </FormGroup>
//             </Grid>

//             {/* Fee Amount */}
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 label="Fee Amount"
//                 name="amount"
//                 type="number"
//                 value={form.fees.amount}
//                 onChange={handleChange}
//                 required
//                 fullWidth
//               />
//             </Grid>

//             {/* Currency */}
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 label="Currency"
//                 name="currency"
//                 value={form.fees.currency}
//                 onChange={handleChange}
//                 fullWidth
//               />
//             </Grid>

//             {/* Frequency */}
//             <Grid item xs={12} sm={4}>
//               <FormControl fullWidth>
//                 <InputLabel>Frequency</InputLabel>
//                 <Select
//                   name="frequency"
//                   value={form.fees.frequency}
//                   label="Frequency"
//                   onChange={handleChange}
//                 >
//                   {FREQUENCIES.map(f => (
//                     <MenuItem key={f} value={f}>{f}</MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Due Day */}
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 label="Due Day (1–31)"
//                 name="dueDay"
//                 type="number"
//                 inputProps={{ min: 1, max: 31 }}
//                 value={form.fees.dueDay}
//                 onChange={handleChange}
//                 fullWidth
//               />
//             </Grid>

//             {/* Submit */}
//             <Grid item xs={12}>
//               <Button
//                 variant="contained"
//                 type="submit"
//                 sx={{
//                   bgcolor: '#44210a',
//                   '&:hover': { bgcolor: '#331704' },
//                   px: 4
//                 }}
//               >
//                 Create Class
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default CreateClass;
