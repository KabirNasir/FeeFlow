import React, { useState , useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// MUI Components
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

// Styles
import '../styles/Login.css';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Save token and redirect
      localStorage.setItem('token', res.data.token);
      login(res.data.token); 
      navigate('/dashboard'); // your dashboard route
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 className="heading-h1">Welcome Back!</h1>
        <div className='subheading'>
          Sign in to manage your classes and student fees.
        </div>

        <FormControl sx={formControlStyle}>
          <Box component="form" onSubmit={handleLogin} noValidate>
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <a className='fgt-pwd' href='/forgot-password'>Forgot Password?</a>
            <Button
              variant="contained"
              className="button-submit"
              type="submit"
              sx={{ marginTop: 2 }}
            >
              Sign In
            </Button>
          </Box>

          <div className="separator"><span>or continue with</span></div>
          <IconButton href='https://www.gmail.com'>
            <GoogleIcon sx={{
              color: 'white',
              scale: 2,
              bgcolor: '#4caf50',
              borderRadius: '50%'
            }} />
          </IconButton>

          <div className='register'>
            Not a Member? <a className='register-now' href='/register'>Register Now</a>
          </div>
        </FormControl>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={require('../resources/images/login.jpg')}
          alt="Login Illustration"
          style={{ width: '90%', maxHeight: '90%', borderRadius: '50px' }}
        />
      </div>
    </div>
  );
};

export default Login;
