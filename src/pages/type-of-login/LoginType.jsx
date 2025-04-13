import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroImage } from '../../assets';
import { motion } from 'framer-motion';
import { Loader } from '../../components';

function LoginType() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loader type="fullscreen" text="Loading..." />;
    }

    const buttonVariants = {
        hover: {
            scale: 1.02,
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
        },
        tap: {
            scale: 0.98,
        },
        initial: {
            scale: 1,
            opacity: 0,
            y: 20,
        },
        animate: {
            scale: 1,
            opacity: 1,
            y: 0,
        }
    };

    return (
        <div className="login-type-container">
            <motion.div className="login-type-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div 
                    className="login-type-image"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <img src={HeroImage} alt="Welcome" />
                </motion.div>

                <motion.div 
                    className="login-type-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h1>Welcome to StrayInTouch</h1>
                    <p>Choose your login type to continue</p>

                    <div className="login-type-buttons">
                        <motion.div
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            transition={{ 
                                duration: 0.3,
                                delay: 0.5 
                            }}
                        >
                            <Link to="/user-login" className="login-button user">
                                User Login
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            transition={{ 
                                duration: 0.3,
                                delay: 0.6 
                            }}
                        >
                            <Link to="/ngo-login" className="login-button ngo">
                                NGO Login
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={buttonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            transition={{ 
                                duration: 0.3,
                                delay: 0.7 
                            }}
                        >
                            <Link to="/admin-login" className="login-button admin">
                                Admin Login
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default LoginType;