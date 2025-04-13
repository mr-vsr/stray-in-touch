import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

const SuccessDialog = ({ onClose }) => {
    return (
        <motion.div
            className="success-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="success-dialog-container"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
            >
                <div className="success-dialog-content">
                    <div className="success-dialog-icon">
                        <FaCheckCircle size={32} />
                    </div>
                    <h2 className="success-dialog-title">Thank You!</h2>
                    <p className="success-dialog-message">
                        Your report has been successfully submitted. We will review it and take necessary action.
                    </p>
                    <button
                        className="success-dialog-button"
                        onClick={onClose}
                    >
                        Continue
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SuccessDialog;