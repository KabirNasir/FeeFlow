import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import '../styles/Layout.css';

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
        fetchFees();
    }, [selectedClass, selectedStudent, selectedMonth, selectedYear]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography className="page-heading" variant="h4" sx={{ mb: 3 }}>Fee Records</Typography>

            {/* Filter Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                                <MenuItem value=""><em>All Classes</em></MenuItem>
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Student</InputLabel>
                            <Select value={selectedStudent} label="Student" onChange={e => setSelectedStudent(e.target.value)}>
                                <MenuItem value=""><em>All Students</em></MenuItem>
                                {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select value={selectedMonth} label="Month" onChange={e => setSelectedMonth(e.target.value)}>
                                <MenuItem value=""><em>All Months</em></MenuItem>
                                {[...Array(12)].map((_, i) => <MenuItem key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select value={selectedYear} label="Year" onChange={e => setSelectedYear(e.target.value)}>
                                {[...Array(5)].map((_, i) => <MenuItem key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Fees Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Period</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Amount Due</TableCell>
                            <TableCell>Amount Paid</TableCell>
                            <TableCell>Due Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : (
                            fees.map(fee => (
                                <TableRow key={fee._id}>
                                    <TableCell>{fee.enrollment?.student?.name || 'N/A'}</TableCell>
                                    <TableCell>{fee.enrollment?.class?.name || 'N/A'}</TableCell>
                                    <TableCell>{fee.period.month}/{fee.period.year}</TableCell>
                                    <TableCell>{fee.status}</TableCell>
                                    <TableCell>${fee.amount}</TableCell>
                                    <TableCell>${fee.amountPaid}</TableCell>
                                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Fees;