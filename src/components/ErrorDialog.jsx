import React from 'react';
import { motion } from 'framer-motion';
import './ErrorDialog.css';

const ErrorDialog = ({ error, onClose }) => {
  return (
    <motion.div 
      className="error-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="error-dialog">
        <div className="error-dialog-header">
          <h3>Error</h3>
          <button 
            className="error-dialog-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="error-dialog-content">
          {error.message}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDialog;