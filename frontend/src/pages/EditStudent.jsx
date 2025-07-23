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
} from '@mui/material';

import '../styles/Layout.css';

const EditStudent = () => {
    const { studentId } = useParams();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError(err.response?.data?.message || 'Failed to update student');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!form) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    height: '60vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }} elevation={4}>
                <Typography className="page-heading" gutterBottom>
                    Edit Student
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {/* ... (The form fields will be very similar to CreateStudent.jsx) */}
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