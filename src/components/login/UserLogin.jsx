import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login as LogIn } from "../../store/authSlice"; // Renamed to avoid conflict
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Re-use or import the helper function from App.js if structured differently
const fetchUserProfile = async (uid) => {
    const userRef = collection(db, 'users'); // Query only 'users' collection for user login
    const q = query(userRef, where('uid', '==', uid));
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
    } catch (error) {
         console.error(`Error searching users for UID ${uid}:`, error);
    }
    console.warn(`User profile not found in Firestore for UID: ${uid}`);
    return null;
};

function UserLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
        setError(null); // Clear previous errors

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userAuth = userCredential.user;

            // Fetch the corresponding user profile from Firestore
            const userProfile = await fetchUserProfile(userAuth.uid);

            if (!userProfile || userProfile.role !== 'user') {
                // If no profile found OR role is wrong, sign out and show error
                await auth.signOut(); // Sign out from Firebase
                throw {
                    code: 'auth/wrong-login-type',
                    message: 'Login failed. Please ensure you are using the correct login page for your account type (User, NGO, Admin) or that your profile exists.'
                };
            }

            // Dispatch combined data to Redux
            dispatch(LogIn({
                 userData: {
                   uid: userAuth.uid,
                   email: userAuth.email,
                   displayName: userProfile.name || userAuth.displayName,
                   photoURL: userProfile.avatar || userAuth.photoURL,
                   role: userProfile.role,
                   contact: userProfile.contact,
                   // Add other relevant fields
                 },
                 isLoggedIn: true
            }));

            navigate('/user-homepage');

        } catch (error) {
            let errorMessage;
            switch (error?.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Incorrect email or password. Please check your credentials.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address. Please check the email or sign up.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Please contact support.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please try again later or reset your password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/wrong-login-type':
                    errorMessage = error.message; // Use the custom message
                    break;
                default:
                    errorMessage = 'An error occurred during login. Please try again.';
            }

            setError({
                code: error?.code || 'auth/unknown',
                message: errorMessage
            });
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="auth-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className="auth-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="auth-header">
                    <motion.h1
                        className="auth-title"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        className="auth-subtitle"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Sign in to continue to your account
                    </motion.p>
                </div>

                <motion.form
                    className="auth-form"
                    onSubmit={handleLogin}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    noValidate
                >
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="email"
                            className={`form-input ${touched.email && !email ? 'error' : ''}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="password"
                            className={`form-input ${touched.password && !password ? 'error' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <motion.button
                        className="auth-button"
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </motion.form>

                <div className="auth-links">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/user-signup" className="auth-link">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>

            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </motion.div>
    );
}

export default UserLogin;