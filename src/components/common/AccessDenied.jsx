import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function AccessDenied() {
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    return (
        <div className="updated-page-container">
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="access-denied-container"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <motion.h2
                        className="access-denied-heading"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Access Denied
                    </motion.h2>
                    <motion.p
                        className="access-denied-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        You do not have permission to view this page.
                    </motion.p>
                    <motion.div
                        className="access-denied-actions"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to={from} className="back-button">
                            Go Back
                        </Link>
                        <Link to="/" className="home-button">
                            Return to Home
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default AccessDenied; 