import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../auth/firebase-config";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { styledLink } from '../../assets';
import { useDispatch } from 'react-redux';
import { Login as LogIn, Logout } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { Header, Footer } from '../index';

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const login = () => {
        if (!email || !password) {
            setError({ code: 'auth/missing-credentials' });
            return;
        }

        if (password.length < 6) {
            setError({ code: 'auth/weak-password' });
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    dispatch(LogIn({
                        userData: user,
                        isLoggedIn: true
                    }));
                    const fromDonations = location.state?.from === 'donations';
                    if (fromDonations) {
                        navigate('/donations');
                    } else {
                        navigate('/ngo-homepage');
                    }
                }
            })
            .catch((error) => {
                setError(error);
            });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(LogIn({
                    userData: user,
                    isLoggedIn: true
                }));
                const fromDonations = location.state?.from === 'donations';
                if (fromDonations) {
                    navigate('/donations');
                } else {
                    navigate('/ngo-homepage');
                }
            } else {
                dispatch(Logout());
            }
        });

        return () => unsubscribe();
    }, [dispatch, navigate, location]);

    return (
        <div className="updated-page-container">
            <Header />
            <motion.div
                className='container'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className='login-container updated-section'
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
                                className='email updated-text'
                                placeholder='E-mail'
                                onChange={(event) => setEmail(event.target.value)}
                                value={email}
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
                                className='password updated-text'
                                placeholder='Password'
                                onChange={(event) => setPassword(event.target.value)}
                                value={password}
                                required
                            />
                        </motion.div>
                        <motion.button
                            type='submit'
                            className='login-button updated-button'
                            onClick={login}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Continue
                        </motion.button>
                    </motion.form>
                    <motion.p
                        className='signup-text updated-text'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        Don't have an account?
                        <Link to="/ngo-signup" style={{ ...styledLink, color: '#0062ff' }}>Signup</Link>
                    </motion.p>
                </motion.div>
                {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
            </motion.div>
            <Footer />
        </div>
    )
}

export default Login