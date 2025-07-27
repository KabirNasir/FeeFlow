import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import '../styles/Layout.css';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.put('/auth/updatedetails', formData);
            updateUser(res.data.data); // Update the user in the context
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }} elevation={4}>
                <Typography variant="h4" className="page-heading" gutterBottom>
                    Your Profile
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button
                        className="button-primary"
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        sx={{ mt: 3 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Profile;