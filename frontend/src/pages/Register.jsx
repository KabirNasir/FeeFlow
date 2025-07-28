// import React, { useState } from 'react';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

// MUI Components
import { Box, FormControl, TextField, Button, InputAdornment, IconButton, Divider, Alert } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Styles
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const inputLabelStyle = {
    color: '#44210a',
    width: '100%',
    borderRadius: '40%',
    m: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: '30px',
    }
  };

  const formControlStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '10px'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await api.post('/auth/googlesignin', { idToken });
      login(res.data.token, res.data.user); // Pass both token and user
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-Up Failed', err);
      setErrors({ general: 'Google Sign-In failed. Please try again.' });
    }
  };

  const handleGoogleError = () => {
    console.log('Google Sign-Up Failed');
    setErrors({ general: 'Google Sign-In failed. Please try again.' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    // --- FIX #1: CORRECT PASSWORD MISMATCH CHECK ---
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      login(res.data.token, res.data.user); // Pass both token and user
      navigate('/dashboard');
    } catch (err) {
      // --- FIX #2: CORRECT ERROR HANDLING ---
      if (err.response?.status === 400 && err.response.data.errors) {
        // Handle specific validation errors from the backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      } else {
        // Handle general errors like "User already exists"
        setErrors({ general: err.response?.data?.message || 'Registration failed' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 className="heading-h1">Register Now!</h1>
        <div className='subheading'>
          Welcome to FeeFlow. Easily manage your classes and student payments.
        </div>

        <FormControl sx={formControlStyle}>
          <Box component="form" onSubmit={handleRegister} noValidate>

            {/* Display general errors */}
            {errors.general && <Alert severity="error" sx={{ mb: 2, borderRadius: '15px' }}>{errors.general}</Alert>}

            {/* --- FIX #3: ADD ERROR AND HELPERTEXT TO ALL FIELDS --- */}
            <TextField
              required
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
              error={!!errors.name}
              helperText={errors.name || ''}
            />
            <TextField
              required
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
              error={!!errors.email}
              helperText={errors.email || ''}
            />
            <TextField
              required
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
              error={!!errors.password}
              helperText={errors.password || ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              required
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword || ''}
            />

            {/* <Button
              variant="contained"
              className="button-submit"
              type="submit"
              sx={{ marginTop: 2 }}
            >
              Register
            </Button> */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                className="button-submit"
                type="submit"
                sx={{ marginTop: 2 }}
              >
                Register
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </Box>

          <div className='register'>
            Already a Member? <a className='register-now' href='/login'>Login</a>
          </div>
        </FormControl>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={require('../resources/images/login.jpg')}
          alt="Register Illustration"
          style={{ width: '90%', maxHeight: '90%', borderRadius: '50px' }}
        />
      </div>
    </div>
  );
};

export default Register;