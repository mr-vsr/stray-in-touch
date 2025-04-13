import React from 'react';
import { motion } from 'framer-motion';

const PaymentDialog = ({ status, onClose }) => {
    const dialogVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 500
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div 
            className="payment-dialog"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dialogVariants}
        >
            <div className="payment-dialog-content">
                <h2>Payment Status</h2>
                {status === 'success' ? (
                    <motion.div 
                        className="success-message"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <i className="fas fa-check-circle"></i>
                        <p>Payment Successful!</p>
                        <p>Thank you for your donation.</p>
                    </motion.div>
                ) : status === 'failed' ? (
                    <motion.div 
                        className="error-message"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <i className="fas fa-times-circle"></i>
                        <p>Payment Failed</p>
                        <p>Please try again.</p>
                    </motion.div>
                ) : (
                    <div className="processing-message">
                        <div className="spinner"></div>
                        <p>Processing Payment...</p>
                    </div>
                )}
                <motion.button
                    className="dialog-close-button"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {status === 'success' ? 'Return Home' : 'Close'}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default PaymentDialog;