import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Box, Typography, Button, Paper, List, ListItem, ListItemText,
    CircularProgress, Alert
} from '@mui/material';
import '../styles/Layout.css'; 
const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);

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
            // You can expand this to ask for a title in a dialog later
            await api.post('/reports', { title: `Fee Collection Summary - ${new Date().toLocaleDateString()}` });
            // Refresh the list after generating
            fetchReports();
        } catch (err) {
            setError('Failed to generate report.');
            console.error(err);
        } finally {
            setGenerating(false);
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
                            <ListItem key={report._id} divider button onClick={() => alert('Viewing details is the next step!')}>
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
        </Box>
    );
};

export default Reports;