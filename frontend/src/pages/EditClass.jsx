// frontend/src/pages/EditClass.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import {
    Box, Typography, TextField, Button, Grid, FormControl, InputLabel,
    Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Paper, Alert, CircularProgress
} from '@mui/material';
import '../styles/Layout.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'yearly'];

const EditClass = () => {
    const { classId } = useParams();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/classes/${classId}`)
            .then(res => setForm(res.data.data))
            .catch(err => {
                if (err.response?.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    setError('Failed to fetch class details');
                }
            })
            .finally(() => setLoading(false));
    }, [classId, logout, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['amount', 'currency', 'frequency', 'dueDay'].includes(name)) {
            setForm(f => ({ ...f, fees: { ...f.fees, [name]: value } }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleDayToggle = (day) => {
        setForm(f => {
            const days = f.schedule.days.includes(day)
                ? f.schedule.days.filter(d => d !== day)
                : [...f.schedule.days, day];
            return { ...f, schedule: { ...f.schedule, days } };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.put(`/classes/${classId}`, form);
            navigate(`/classes/${classId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update class');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !form) return <CircularProgress />;
    if (!form) return <Alert severity="error">Could not load class data.</Alert>;

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }} elevation={4}>
                <Typography variant="h4" className="page-heading" gutterBottom>Edit Class</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    {/* Form fields are the same as CreateClass.jsx */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField label="Class Name" name="name" value={form.name} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Subject" name="subject" value={form.subject} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Grade" name="grade" value={form.grade} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} fullWidth /></Grid>
                        <Grid item xs={12}><Typography variant="subtitle1" gutterBottom>Schedule Days *</Typography><FormGroup row>{DAYS.map(day => <FormControlLabel key={day} control={<Checkbox checked={form.schedule.days.includes(day)} onChange={() => handleDayToggle(day)} />} label={day} />)}</FormGroup></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Fee Amount" name="amount" type="number" value={form.fees.amount} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Currency" name="currency" value={form.fees.currency} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel>Frequency</InputLabel><Select name="frequency" value={form.fees.frequency} label="Frequency" onChange={handleChange}>{FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={4}><TextField label="Due Day (1–31)" name="dueDay" type="number" inputProps={{ min: 1, max: 31 }} value={form.fees.dueDay} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}><Button className="button-primary" variant="contained" type="submit" sx={{ px: 4 }} disabled={loading}>Save Changes</Button></Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default EditClass;