import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
// import {
//     Box, Typography, Paper, CircularProgress, Alert, Grid, Divider,
//     Table, TableBody, TableCell, TableContainer, TableHead, TableRow
// } from '@mui/material';
import {
    Box, Typography, Paper, CircularProgress, Alert, Grid, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import '../styles/Layout.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReportDetail = () => {
    const { reportId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/reports/${reportId}`);
                setReport(res.data.data);
            } catch (err) {
                setError('Failed to fetch report details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!report) {
        return <Typography>No report found.</Typography>;
    }

    // Safely access nested data
    // const { totalCollected, totalDue, outstanding, feeDetails = [] } = report.data;
    const { totalCollected, totalDue, outstanding, summaryByClass = [] } = report.data;

    return (
        <Box sx={{ p: 4 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link component={RouterLink} to="/dashboard">Dashboard</Link>
                <Link component={RouterLink} to="/reports">Reports</Link>
                <Typography color="text.primary">Report Details</Typography>
            </Breadcrumbs>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" className="page-heading" gutterBottom>
                    {report.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                    Generated on: {new Date(report.createdAt).toLocaleString()}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
                            <Typography variant="h6">Total Collected</Typography>
                            <Typography variant="h4" color="green">{totalCollected}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                            <Typography variant="h6">Total Due</Typography>
                            <Typography variant="h4" color="orange">{totalDue}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
                            <Typography variant="h6">Outstanding</Typography>
                            <Typography variant="h4" color="red">{outstanding}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Detailed Fee Table */}
                {/* <Typography variant="h5" sx={{ mb: 2 }}>Fee Breakdown</Typography> */}
                <Typography variant="h5" sx={{ mb: 2 }}>Detailed Breakdown by Class</Typography>
                {summaryByClass.map((classData, classIndex) => (
                    <Accordion key={classIndex} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{classData.className}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {classData.studentSummaries.map((student, studentIndex) => (
                                <Box key={studentIndex} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{student.studentName}</Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Period</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Paid</TableCell>
                                                    <TableCell>Due</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {student.fees.map((fee, feeIndex) => (
                                                    <TableRow key={feeIndex}>
                                                        <TableCell>{fee.period}</TableCell>
                                                        <TableCell>{fee.status}</TableCell>
                                                        <TableCell>{fee.amountPaid}</TableCell>
                                                        <TableCell>{fee.amount}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
                {/* <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Amount Paid</TableCell>
                                <TableCell>Amount Due</TableCell>
                                <TableCell>Due Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeDetails.map((fee, index) => (
                                <TableRow key={index}>
                                    <TableCell>{fee.studentName}</TableCell>
                                    <TableCell>{fee.status}</TableCell>
                                    <TableCell>{fee.amountPaid}</TableCell>
                                    <TableCell>{fee.amountDue}</TableCell>
                                    <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> */}
            </Paper>
        </Box>
    );
};

export default ReportDetail;