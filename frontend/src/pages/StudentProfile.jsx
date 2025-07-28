import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import {
    Box, Typography, Paper, CircularProgress, Alert, Grid, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Tabs, Tab, Button
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import '../styles/Layout.css';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(0);
    const { logout } = useContext(AuthContext);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/students/${id}/profile`);
                setProfile(res.data.data);
            } catch (err) {
                if (err.response?.status === 401) logout();
                else setError('Failed to fetch student profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, logout]);
    const openPaymentDialog = (fee) => {
        setSelectedFee(fee);
        setAmountToPay(fee.amount - fee.amountPaid); // Pre-fill with remaining amount
        setPaymentDialogOpen(true);
    };

    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
        setSelectedFee(null);
        setAmountToPay('');
    };

    const handleRecordPayment = async () => {
        if (!selectedFee || amountToPay <= 0) return;
        try {
            await api.put(`/fees/${selectedFee._id}/pay`, {
                amountPaid: Number(amountToPay)
            });
            // Refresh profile data to show the updated fee status
            const res = await api.get(`/students/${id}/profile`);
            setProfile(res.data.data);
            handleClosePaymentDialog();
        } catch (err) {
            console.error("Failed to record payment", err);
            // You can add an error state here to show a message in the dialog
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!profile) return <Typography>No student profile found.</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/students">Students</Link>
                <Typography color="text.primary">{profile.name}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" className="page-heading">{profile.name}</Typography>
                <button className="button-primary" onClick={() => navigate(`/students/${id}/edit`)}>
                    Edit Student
                </button>
            </Box>

            {/* Main Content Paper */}
            <Paper sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    {/* Left Column: Details */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Student Details</Typography>
                        <Typography><strong>Email:</strong> {profile.email || 'N/A'}</Typography>
                        <Typography><strong>Phone:</strong> {profile.phone || 'N/A'}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>Parent/Guardian Info</Typography>
                        <Typography><strong>Name:</strong> {profile.parentInfo.name}</Typography>
                        <Typography><strong>Email:</strong> {profile.parentInfo.email}</Typography>
                        <Typography><strong>Phone:</strong> {profile.parentInfo.phone}</Typography>
                    </Grid>

                    {/* Right Column: Tabs for Enrollments and Fees */}
                    <Grid item xs={12} md={8}>
                        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Enrollments" />
                            <Tab label="Fee History" />
                        </Tabs>

                        {/* Enrollments Tab */}
                        {tabIndex === 0 && (
                            <Box sx={{ pt: 2 }}>
                                {profile.enrollments.map(enr => (
                                    <Paper key={enr._id} variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6">{enr.class.name}</Typography>
                                            <Typography color="text.secondary">{enr.class.subject} - Grade {enr.class.grade}</Typography>
                                        </Box>
                                        <Chip label={enr.status} color={enr.status === 'active' ? 'success' : 'default'} />
                                    </Paper>
                                ))}
                            </Box>
                        )}

                        {/* Fee History Tab */}
                        {/* {tabIndex === 1 && (
                            <TableContainer sx={{ mt: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Class</TableCell>
                                            <TableCell>Period</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {profile.fees.map(fee => (
                                            <TableRow key={fee._id}>
                                                <TableCell>
                                                    {profile.enrollments.find(e => e._id === fee.enrollment)?.class.name || 'N/A'}
                                                </TableCell>
                                                <TableCell>{fee.period.month}/{fee.period.year}</TableCell>
                                                <TableCell>
                                                    <Chip label={fee.status} size="small" color={fee.status === 'paid' ? 'success' : (fee.status === 'unpaid' ? 'error' : 'warning')} />
                                                </TableCell>
                                                <TableCell align="right">₹{fee.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )} */}

                        {tabIndex === 1 && (
                            <Box sx={{ pt: 2 }}>
                                {profile.enrollments.map(enr => {
                                    const studentFeesForClass = profile.fees.filter(fee => fee.enrollment === enr._id);
                                    if (studentFeesForClass.length === 0) return null;

                                    return (
                                        <Box key={enr._id} sx={{ mb: 3 }}>
                                            <Typography variant="h6">{enr.class.name}</Typography>
                                            <TableContainer component={Paper} variant="outlined">
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Period</TableCell>
                                                            <TableCell>Status</TableCell>
                                                            <TableCell>Due</TableCell>
                                                            <TableCell>Paid</TableCell>
                                                            <TableCell align="right">Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {studentFeesForClass.map(fee => (
                                                            <TableRow key={fee._id}>
                                                                <TableCell>{fee.period.month}/{fee.period.year}</TableCell>
                                                                <TableCell>
                                                                    <Chip label={fee.status} size="small" color={fee.status === 'paid' ? 'success' : (fee.status.includes('unpaid') ? 'error' : 'warning')} />
                                                                </TableCell>
                                                                <TableCell>₹{fee.amount}</TableCell>
                                                                <TableCell>₹{fee.amountPaid}</TableCell>
                                                                <TableCell align="right">
                                                                    {fee.status !== 'paid' && (
                                                                        <Button size="small" onClick={() => openPaymentDialog(fee)}>
                                                                            Pay
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                        <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog}>
                            <DialogTitle>Record Payment</DialogTitle>
                            <DialogContent>
                                <Typography>
                                    For: {selectedFee && `${selectedFee.period.month}/${selectedFee.period.year}`}
                                </Typography>
                                <Typography color="text.secondary" gutterBottom>
                                    Remaining Due: ₹{selectedFee && (selectedFee.amount - selectedFee.amountPaid)}
                                </Typography>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Amount to Pay"
                                    type="number"
                                    fullWidth
                                    variant="standard"
                                    value={amountToPay}
                                    onChange={(e) => setAmountToPay(e.target.value)}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePaymentDialog}>Cancel</Button>
                                <Button onClick={handleRecordPayment}>Record Payment</Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default StudentProfile;