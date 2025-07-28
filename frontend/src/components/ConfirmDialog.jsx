import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import './../styles/ConfirmDialog.css';

/**
 * A reusable confirmation dialog component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Function to call when the dialog is closed (e.g., by clicking cancel or outside the dialog).
 * @param {function} props.onConfirm - Function to call when the confirm button is clicked.
 * @param {string} props.title - The title of the dialog.
 * @param {string} props.message - The confirmation message to display in the dialog.
 * @returns {JSX.Element} The rendered component.
 */
const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            className="confirm-dialog"
            PaperProps={{
                elevation: 8
            }}
        >
            <DialogTitle id="confirm-dialog-title" className="confirm-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent className="confirm-dialog-content">
                <DialogContentText id="confirm-dialog-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions className="confirm-dialog-actions">
                <Button onClick={onClose} className="cancel-button">
                    Cancel
                </Button>
                <Button onClick={onConfirm} className="confirm-button" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;