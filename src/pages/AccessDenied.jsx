import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AccessDenied = () => {
  return (
    <div className="access-denied-container">
      <motion.div
        className="access-denied-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <Link to="/" className="access-denied-button">
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default AccessDenied; 