import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Box, Typography, Button, Paper, List, ListItem, ListItemText,
    CircularProgress, Alert, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../components/ConfirmDialog'; // Import the new component
import '../styles/Layout.css';

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);

    // --- Delete confirmation state ---
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reports');
            setReports(res.data.data);
        } catch (err) {
            setError('Failed to fetch reports.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleGenerateReport = async () => {
        setGenerating(true);
        setError('');
        try {
            await api.post('/reports', { title: `Fee Collection Summary - ${new Date().toLocaleDateString()}` });
            fetchReports();
        } catch (err) {
            setError('Failed to generate report.');
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteClick = (reportId) => {
        setReportToDelete(reportId);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (reportToDelete) {
            try {
                await api.delete(`/reports/${reportToDelete}`);
                setReports(currentReports => currentReports.filter(report => report._id !== reportToDelete));
            } catch (err) {
                setError('Failed to delete report.');
                console.error(err);
            } finally {
                setConfirmOpen(false);
                setReportToDelete(null);
            }
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" className="page-heading">
                    Reports
                </Typography>
                <Button
                    variant="contained"
                    className="button-primary"
                    onClick={handleGenerateReport}
                    disabled={generating}
                >
                    {generating ? <CircularProgress size={24} /> : 'Generate Fee Summary'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={3}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {reports.length > 0 ? reports.map((report) => (
                            <ListItem key={report._id} divider button onClick={() => navigate(`/reports/${report._id}`)} secondaryAction={
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop the click from bubbling up to the ListItem
                                        handleDeleteClick(report._id);
                                    }}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            } >
                                <ListItemText
                                    primary={report.title}
                                    secondary={`Type: ${report.reportType.replace('_', ' ')} | Generated on: ${new Date(report.createdAt).toLocaleDateString()}`}
                                />
                            </ListItem>
                        )) : (
                            <ListItem>
                                <ListItemText primary="No reports found. Generate one to get started!" />
                            </ListItem>
                        )}
                    </List>
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Report"
                message="Are you sure you want to delete this report? This action cannot be undone."
            />
        </Box>
    );
};

export default Reports;
