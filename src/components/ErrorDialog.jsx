import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BiErrorCircle } from 'react-icons/bi';

function ErrorDialog({ error, onClose }) {
    const getErrorMessage = (error) => {
        if (typeof error === 'string') return error;
        return error.message || 'An unexpected error occurred';
    };

    return (
        <AnimatePresence>
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
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    <div className="error-dialog-header">
                        <BiErrorCircle className="error-icon" />
                        <h3>Error</h3>
                        <button 
                            className="close-button"
                            onClick={onClose}
                            aria-label="Close error dialog"
                        >
                            <IoMdClose />
                        </button>
                    </div>
                    <div className="error-dialog-content">
                        <p>{getErrorMessage(error)}</p>
                    </div>
                    <div className="error-dialog-footer">
                        <button 
                            className="error-dialog-button"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default ErrorDialog;