import React from 'react';
import { motion } from 'framer-motion';

function SuccessDialog({ onClose }) {
    return (
        <div className="success-dialog-overlay">
            <motion.div 
                className="success-dialog"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="success-dialog-content">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3 className="success-dialog-heading">Thank You!</h3>
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
        </div>
    );
}

export default SuccessDialog; 