// frontend/src/pages/ResetPassword.jsx

import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Link
} from '@mui/material';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Layout.css';

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await api.put(`/auth/resetpassword/${resettoken}`, { password });
            // Log the user in with the new token
            login(res.data.token);
            setSuccess('Password has been reset successfully! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. The token may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h4" className="page-heading">Reset Password</Typography>
                <Typography sx={{ mb: 2 }}>
                    Please enter your new password.
                </Typography>

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {!success && (
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                        </Button>
                    </Box>
                )}
                {success && (
                    <Link component={RouterLink} to="/login" variant="body2">
                        Go to Login
                    </Link>
                )}
            </Paper>
        </Box>
    );
};

export default ResetPassword;