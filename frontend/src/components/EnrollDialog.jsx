import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    Box, Chip, Checkbox, ListItemText
} from '@mui/material';

/**
 * A reusable dialog for enrolling one or more students into a class.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Function to call when the dialog is closed.
 * @param {function} props.onEnroll - Function to call when the enroll button is clicked. It receives an object with { classId, studentIds }.
 * @param {Array} props.studentsList - The list of all students available for enrollment.
 * @param {Array} props.classList - The list of all available classes.
 * @param {string} [props.fixedClassId] - If provided, the class selection is disabled and fixed to this ID.
 * @param {Array} [props.initialSelectedStudentIds] - An array of student IDs to be pre-selected when the dialog opens.
 * @returns {JSX.Element} The rendered component.
 */
const EnrollDialog = ({
    open,
    onClose,
    onEnroll,
    studentsList,
    classList,
    fixedClassId,
    initialSelectedStudentIds = []
}) => {
    const [selectedStudents, setSelectedStudents] = useState(initialSelectedStudentIds);
    const [selectedClass, setSelectedClass] = useState(fixedClassId || '');

    // When the dialog opens, sync the state with the initial props.
    useEffect(() => {
        if (open) {
            setSelectedStudents(initialSelectedStudentIds);
            setSelectedClass(fixedClassId || '');
        }
    }, [open, initialSelectedStudentIds, fixedClassId]);

    const handleStudentChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedStudents(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleClassChange = (event) => {
        setSelectedClass(event.target.value);
    };

    const handleConfirm = () => {
        onEnroll({
            classId: selectedClass,
            studentIds: selectedStudents,
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    padding: '16px',
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 500, color: '#1a237e', paddingBottom: '8px' }}>
                Enroll Students
            </DialogTitle>
            <DialogContent sx={{ paddingTop: '20px !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Student Multi-Select */}
                <FormControl fullWidth>
                    <InputLabel id="multiple-student-select-label">Students</InputLabel>
                    <Select
                        labelId="multiple-student-select-label"
                        multiple
                        value={selectedStudents}
                        onChange={handleStudentChange}
                        input={<OutlinedInput label="Students" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((studentId) => {
                                    const student = studentsList.find(s => s._id === studentId);
                                    return <Chip key={studentId} label={student ? student.name : ''} />;
                                })}
                            </Box>
                        )}
                    >
                        {studentsList.map((student) => (
                            <MenuItem key={student._id} value={student._id}>
                                <Checkbox checked={selectedStudents.indexOf(student._id) > -1} />
                                <ListItemText primary={student.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Class Select */}
                <FormControl fullWidth disabled={!!fixedClassId}>
                    <InputLabel id="class-select-label">Class</InputLabel>
                    <Select
                        labelId="class-select-label"
                        value={selectedClass}
                        label="Class"
                        onChange={handleClassChange}
                    >
                        {classList.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                                {cls.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ padding: '8px 24px 16px 24px', gap: '8px' }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#555', border: '1px solid #ccc', textTransform: 'none',
                        fontWeight: 500, borderRadius: '8px', padding: '6px 16px',
                        '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#bbb' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!selectedClass || selectedStudents.length === 0}
                    onClick={handleConfirm}
                    sx={{
                        backgroundColor: '#1a237e', color: 'white', textTransform: 'none',
                        fontWeight: 500, borderRadius: '8px', padding: '6px 16px',
                        boxShadow: '0 2px 4px rgba(26, 35, 126, 0.2)',
                        '&:hover': { backgroundColor: '#0d124f', boxShadow: '0 4px 8px rgba(26, 35, 126, 0.3)' },
                        '&.Mui-disabled': { backgroundColor: '#9fa8da', color: '#e8eaf6' }
                    }}
                >
                    Enroll
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EnrollDialog;
