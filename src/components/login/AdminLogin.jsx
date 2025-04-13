import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { collection, query, where, getDocs } from "firebase/firestore";

function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({ email: false, password: false });

    const validateForm = () => {
        const errors = {};
        if (!email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
        if (!password) errors.password = 'Password is required';
        return errors;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setError({ 
                code: 'validation-error',
                message: Object.values(formErrors).join('. ')
            });
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Verify if the user is an admin
            const adminRef = collection(db, 'AdminInfo');
            const q = query(adminRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError({ 
                    code: 'auth/unauthorized', 
                    message: 'This login is only for administrators. Please use the correct login type.' 
                });
                await auth.signOut();
                return;
            }

            dispatch(Login({
                userData: user,
                isLoggedIn: true
            }));

            navigate("/admin-dashboard");
        } catch (error) {
            let errorMessage;
            switch (error?.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please check your password and try again.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'This email is not registered. Please sign up first.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Please contact support.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/unauthorized':
                    errorMessage = error.message;
                    break;
                default:
                    errorMessage = 'An error occurred during login. Please try again.';
            }
            setError({ 
                code: error?.code || 'auth/unknown',
                message: errorMessage 
            });
            console.error('Login error:', error); // For debugging purposes
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <h1 className="auth-title">Admin Login</h1>
                    <p className="auth-subtitle">Access your admin dashboard</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className={`form-input ${touched.email && !email ? 'error' : ''}`}
                            onBlur={() => handleBlur('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-input ${touched.password && !password ? 'error' : ''}`}
                            onBlur={() => handleBlur('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                <div className="auth-links">
                    <p>
                        Need an admin account?{' '}
                        <Link to="/admin-signup" className="auth-link">
                            Register Here
                        </Link>
                    </p>
                </div>
            </motion.div>
            
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminLogin;