// frontend/src/pages/EditStudent.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Grid,
} from '@mui/material';

import '../styles/Layout.css';

const EditStudent = () => {
    const { studentId } = useParams();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${studentId}`);
                setForm(res.data.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    setError('Failed to fetch student data.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId, logout, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('parentInfo.')) {
            const key = name.split('.')[1];
            setForm((f) => ({
                ...f,
                parentInfo: { ...f.parentInfo, [key]: value },
            }));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.put(`/students/${studentId}`, form);
            navigate('/students');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!form) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Could not load student data.</Alert>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }} elevation={4}>
                <Typography variant="h4" className="page-heading" gutterBottom>
                    Edit Student
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Student Info</Typography>
                    <TextField
                        fullWidth
                        label="Student Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Student Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Student Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Parent / Guardian Info</Typography>
                    <TextField
                        fullWidth
                        label="Parent Name"
                        name="parentInfo.name"
                        value={form.parentInfo.name}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Parent Email"
                        name="parentInfo.email"
                        type="email"
                        value={form.parentInfo.email}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Parent Phone"
                        name="parentInfo.phone"
                        value={form.parentInfo.phone}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <Button
                        className="button-primary"
                        variant="contained"
                        type="submit"
                        disabled={submitting}
                        sx={{ mt: 3 }}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default EditStudent;