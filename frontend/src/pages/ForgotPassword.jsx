// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Alert, CircularProgress
} from '@mui/material';
import api from '../services/api';
import '../styles/Layout.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/forgotpassword', { email });
            setMessage('An email has been sent with password reset instructions.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h4" className="page-heading">Forgot Password</Typography>
                <Typography sx={{ mb: 2 }}>
                    Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className="button-primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ForgotPassword;