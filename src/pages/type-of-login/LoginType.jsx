import React from 'react';
import { Link } from 'react-router-dom';
import { HeroImage } from '../../assets';
import { Header, Footer } from '../../components/index.js';
import { motion } from 'framer-motion';

function LoginType() {
    return (
        <div className='updated-page-container'>
            <Header />
            <motion.div
                className='type-of-login-container'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className='type-of-login-container-top'
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <img src={HeroImage} alt="Hero" className='type-of-login-image' />
                </motion.div>
                <motion.div
                    className='type-of-login-container-bottom updated-section'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <motion.h1
                        className='type-of-login-bottom-heading updated-heading'
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Make a difference by joining us in this journey
                    </motion.h1>
                    <motion.h2
                        className='type-of-login-type-text updated-subheading'
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Login Type
                    </motion.h2>
                    <motion.div
                        className='type-of-login-buttons-container'
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/user-login" className="type-of-login-button updated-button">User</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/ngo-login" className="type-of-login-button updated-button">NGO</Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/admin-login" className="type-of-login-button updated-button">Admin</Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
            <Footer />
        </div>
    )
}

export default LoginType