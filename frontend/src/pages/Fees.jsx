import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button
} from '@mui/material';
import '../styles/Layout.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');

    const fetchFees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedClass) params.append('classId', selectedClass);
            if (selectedStudent) params.append('studentId', selectedStudent);
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', selectedYear);

            const res = await api.get(`/fees?${params.toString()}`);
            setFees(res.data.data);
        } catch (error) {
            console.error("Failed to fetch fees", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial data for filters
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [classesRes, studentsRes] = await Promise.all([
                    api.get('/classes'),
                    api.get('/students')
                ]);
                setClasses(classesRes.data.data);
                setStudents(studentsRes.data.data);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch fees whenever a filter changes
    useEffect(() => {
        // We simply call the main fetchFees function that already exists.
        // This breaks the infinite loop.
        fetchFees();
    }, [selectedClass, selectedStudent, selectedMonth, selectedYear]);
    const feesByClass = fees.reduce((acc, fee) => {
        const className = fee.enrollment?.class?.name || 'Unknown Class';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(fee);
        return acc;
    }, {});

    const openPaymentDialog = (fee) => {
        setSelectedFee(fee);
        setAmountToPay(fee.amount - fee.amountPaid);
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
            await fetchFees(); // Refresh the fee list
            handleClosePaymentDialog();
        } catch (err) {
            console.error("Failed to record payment", err);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography className="page-heading" variant="h4" sx={{ mb: 3 }}>Fee Records</Typography>

            {/* Filter Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ minWidth: 180 }}>
                            <InputLabel>Class</InputLabel>

                            <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                                <MenuItem value=""><em>All Classes</em></MenuItem>
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ minWidth: 180 }}>
                            <InputLabel>Student</InputLabel>
                            <Select value={selectedStudent} label="Student" onChange={e => setSelectedStudent(e.target.value)}>
                                <MenuItem value=""><em>All Students</em></MenuItem>
                                {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ minWidth: 180 }}>
                            <InputLabel>Month</InputLabel>
                            <Select value={selectedMonth} label="Month" onChange={e => setSelectedMonth(e.target.value)}>
                                <MenuItem value=""><em>All Months</em></MenuItem>
                                {[...Array(12)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ minWidth: 180 }}>
                            <InputLabel>Year</InputLabel>
                            <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(e.target.value)}>
                                {[...Array(5)].map((_, i) => <MenuItem key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>



            {/* --- UPDATED: Fees Display using Accordion --- */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
                Object.keys(feesByClass).map(className => (
                    <Accordion key={className} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{className}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} variant="outlined">
                                <Table >

                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="table-header-cell">Student</TableCell>
                                            <TableCell className="table-header-cell">Period</TableCell>
                                            <TableCell className="table-header-cell">Status</TableCell>
                                            <TableCell className="table-header-cell">Amount Due</TableCell>
                                            <TableCell className="table-header-cell">Amount Paid</TableCell>
                                            <TableCell className="table-header-cell">Due Date</TableCell>
                                            <TableCell className="table-header-cell" align="right">Actions</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {feesByClass[className].map(fee => (
                                            <TableRow key={fee._id}>
                                                <TableCell className='table-body-cell'>{fee.enrollment?.student?.name || 'N/A'}</TableCell>
                                                {/* <TableCell>{fee.period.month}/{fee.period.year}</TableCell> */}
                                                <TableCell className='table-body-cell'>
                                                    {new Date(fee.period.year, fee.period.month - 1).toLocaleString('default', { month: 'long' })} {fee.period.year}
                                                </TableCell>
                                                <TableCell className='table-body-cell'>{fee.status}</TableCell>
                                                <TableCell className='table-body-cell'>₹{fee.amount}</TableCell>
                                                <TableCell className='table-body-cell'>₹{fee.amountPaid}</TableCell>
                                                {/* <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell> */}
                                                <TableCell className='table-body-cell'>
                                                    {new Date(fee.dueDate).toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {fee.status !== 'paid' && (
                                                        <Button size="small" variant="outlined" onClick={() => openPaymentDialog(fee)}>
                                                            Pay
                                                        </Button>
                                                    )}
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            {/* --- NEW: Payment Dialog --- */}
            <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog}>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        For: **{selectedFee?.enrollment?.student?.name}**
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
        </Box>
    );
};

export default Fees;