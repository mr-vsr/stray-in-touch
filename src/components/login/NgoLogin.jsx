import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { styledLink } from '../../assets';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from "firebase/firestore";
import ErrorDialog from '../ErrorDialog';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";

function NgoLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const login = async (e) => {
        e.preventDefault();

        if (!loginInfo.email || !loginInfo.password) {
            setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginInfo.email, loginInfo.password);
            const user = userCredential.user;

            // Check if user exists in the NgoInfo collection
            const q = query(
                collection(db, "NgoInfo"),
                where("uid", "==", user.uid)
            );
            
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                // User exists in auth but not in NgoInfo collection
                await auth.signOut();
                setError({ 
                    code: 'auth/not-authorized', 
                    message: 'You are not authorized as an NGO. Please sign up as an NGO first.' 
                });
                return;
            }

            // Get the NGO data
            const ngoData = querySnapshot.docs[0].data();
            
            // Login the user with NGO role
            dispatch(Login({
                userData: {
                    ...user,
                    role: "ngo",
                    ngoData: ngoData
                },
                isLoggedIn: true
            }));

            // Navigate to NGO homepage
            navigate("/ngo-homepage");
        } catch (error) {
            console.error("Error during login:", error);
            setError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="updated-page-container">
            <motion.div
                className='container'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className='login-container'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <motion.h2
                        className='login-heading updated-heading'
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        NGO Login
                    </motion.h2>
                    <motion.form
                        onSubmit={handleSubmit}
                        className='login-form-container'
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <input
                                type='email'
                                name="email"
                                className='email'
                                placeholder='Email Address *'
                                onChange={handleChange}
                                value={loginInfo.email}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <input
                                type='password'
                                name="password"
                                className='password'
                                placeholder='Password *'
                                onChange={handleChange}
                                value={loginInfo.password}
                                required
                            />
                        </motion.div>

                        <motion.button
                            type='submit'
                            className='login-button updated-button'
                            onClick={login}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </motion.button>
                    </motion.form>
                    <motion.p
                        className='signup-text'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        Don't have an account?
                        <Link to="/ngo-signup" style={{ ...styledLink, color: '#0062ff' }}>Sign up</Link>
                    </motion.p>
                </motion.div>
                {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
            </motion.div>
        </div>
    );
}

export default NgoLogin;