import React from 'react';
import { motion } from 'framer-motion';

function ErrorDialog({ error, onClose }) {
    const getErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please use a different email or try logging in.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/operation-not-allowed':
                return 'This operation is not allowed. Please contact support.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long. Please choose a stronger password.';
            case 'auth/user-disabled':
                return 'This account has been disabled. Please contact support.';
            case 'auth/user-not-found':
                return 'No account found with this email. Please check your email or sign up.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/missing-credentials':
                return 'Please fill in all required fields.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            case 'auth/phone-number-already-exists':
                return 'This phone number is already registered. Please use a different number.';
            case 'auth/invalid-phone-number':
                return 'Please enter a valid phone number.';
            case 'auth/missing-phone-number':
                return 'Phone number is required.';
            case 'auth/missing-email':
                return 'Email is required.';
            case 'auth/missing-password':
                return 'Password is required.';
            default:
                return 'An error occurred. Please try again.';
        }
    };

    return (
        <motion.div
            className="error-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="error-dialog"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
            >
                <div className="error-dialog-content">
                    <div className="error-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>{getErrorMessage(error)}</p>
                    <button className="error-dialog-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ErrorDialog; 