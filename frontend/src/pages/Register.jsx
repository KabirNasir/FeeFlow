// import React, { useState } from 'react';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext'; 

// MUI Components
import { Box, FormControl, TextField, Button, InputAdornment, IconButton, Divider } from '@mui/material'; // Add Divider
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin
// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

// Styles
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get the login function
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
      login(res.data.token); // Log in the new user
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-Up Failed', err);
      // You might want a specific error state for this
    }
  };

  const handleGoogleError = () => {
    console.log('Google Sign-Up Failed');
  };
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', res.data.token);
      navigate('/'); // or navigate to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <Box  component="form" onSubmit={handleRegister} noValidate>
            <TextField
              required
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
            />
            <TextField
              required
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              sx={inputLabelStyle}
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
            />

            {error && <p style={{ color: 'red' }}>{error}</p>}
              
            <Button
              variant="contained"
              className="button-submit"
              type="submit"
              sx={{ marginTop: 2 }}
            >
              Register
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </Box>

          {/* <div className="separator"><span>or continue with</span></div> */}

          {/* <IconButton href='https://www.gmail.com'>
            <GoogleIcon sx={{
              color: 'white',
              scale: 2,
              bgcolor: '#4caf50',
              borderRadius: '50%'
            }} />
          </IconButton> */}

          <div className='register'>
            Already a Member? <a className='register-now' href='/'>Login</a>
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
