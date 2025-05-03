import React, { useState } from 'react';

//Material UI Components
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

//Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';

//CSS
import '../styles/Login.css';

const Login = () => {
    
    const inputLabelStyle = { 
        color: '#44210a',
        width: '100%', 
        borderRadius: '40%', 
        m:1,
        '& .MuiOutlinedInput-root': {
        borderRadius: '30px',
        },
        '& .MuiFilledInput-root': {
        borderRadius: '30px',
        overflow: 'hidden',  
        }
    }

    const formControlStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10px'
    }

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Login submitted:', formData);
        // Add login logic here
    };

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="heading-h1">Welcome Back!</h1>
                <div className='subheading'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>

                <FormControl sx={formControlStyle}>
                    <Box
                        component="form"
                        sx={{ '& .MuiTextField-root': { m: 1, width: '600px' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <FormControl sx={formControlStyle}>
                            <div>
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Email"
                                    defaultValue="Hello World"
                                    name="username"
                                    className="input-field"
                                    sx={inputLabelStyle}
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </FormControl>

                        <FormControl sx={formControlStyle} variant="outlined" required>
                            <div>
                            <TextField
                                required
                                id="outlined-password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="input-field"
                                sx={inputLabelStyle}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                            aria-label={showPassword ? 'hide the password' : 'display the password'}
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                            >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            </div>
                        </FormControl>
                    </Box>
                    <a className='fgt-pwd' href='\forgot-password'>
                        Forgot Password?
                    </a>
                    <Button
                        variant="outlined"
                        className="button-submit"
                        onClick={handleSubmit}>
                        Sign In
                    </Button>
                    <div class="separator">
                        <span>or continue with</span>
                    </div>
                    <div className='other-options'>
                        <IconButton
                            href='https://www.gmail.com'
                        >
                            <GoogleIcon 
                                sx={{ 
                                    color: 'white',
                                    scale: 2,
                                    bgcolor: '#44210a',
                                    borderRadius: '50%',
                                }} />
                        </IconButton>
                    </div>
                    <div className='register'>
                        Not a Member?  
                        <a className='register-now' href='/Registration'>Register Now</a>
                    </div>
                </FormControl>
            </div>

            {/* IMAGE ON THE RIGHT DIV */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                    src={require('../resources/images/login.jpg')}
                    alt="Login Illustration"
                    style={{ width: '90%', maxHeight: '90%', borderRadius: '50px'}}
                />
            </div>
        </div>
    );
};

export default Login;