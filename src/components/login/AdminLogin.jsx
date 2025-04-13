import React, { useState, useEffect } from 'react'; // Added useEffect
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // Added signOut explicitly
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice"; // Assuming Login is the correct action name
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

    const [formErrors, setFormErrors] = useState({}); 


    useEffect(() => {
        validateForm();
    }, [email, password]);


    const validateForm = () => {
        const errors = {};
        if (!email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
        if (!password) errors.password = 'Password is required';
        setFormErrors(errors);
        return errors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        const currentFormErrors = validateForm(); // Run validation on submit

        // Check if client-side validation fails
        if (Object.keys(currentFormErrors).length > 0) {
            // Optionally set a general error or rely on field-level errors
            setError({ 
                 code: 'validation-error',
                 message: 'Please fix the errors in the form.' // Generic message
            });
            return;
        }

        setIsLoading(true);

        try {
            // 1. Attempt to sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Verify if the logged-in user exists in the 'AdminInfo' collection
            const adminRef = collection(db, 'AdminInfo');
            // Query based on the UID of the successfully authenticated user
            const q = query(adminRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            // 3. Check if the query returned any documents
            if (querySnapshot.empty) {
                // User authenticated BUT is NOT listed as an admin
                setError({ 
                    code: 'auth/unauthorized-admin', // Custom code for clarity
                    message: 'Access Denied. This login is for administrators only. Please use the correct login page or contact support.' 
                });
                // IMPORTANT: Sign the user out as they aren't authorized here
                await signOut(auth); 
                setIsLoading(false); // Ensure loading stops
                return; // Stop execution
            }

            // 4. User is authenticated AND is an admin - proceed
            
            // Optional: Get admin data from Firestore if needed in Redux state
            // const adminData = querySnapshot.docs[0].data(); 

            dispatch(Login({
                 // Pass necessary user details, ensure consistency with signup payload
                userData: { 
                    uid: user.uid, 
                    email: user.email, 
                    displayName: user.displayName, // Get from auth profile if updated
                    photoURL: user.photoURL,     // Get from auth profile if updated
                    role: 'admin' // Set role explicitly
                    // Or: ...adminData // If you fetched admin details
                },
                isLoggedIn: true
            }));

            // 5. Navigate to the dashboard
            navigate("/admin-dashboard");
            // If redirection fails here, check ProtectedRoute and Redux state update timing

        } catch (error) {
            console.error('Admin Login Error:', error); // Log the full error
            let errorMessage;
            // Map Firebase error codes to user-friendly messages
            switch (error?.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential': // Newer SDK versions might use this
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
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                    break;
                 // Keep the custom unauthorized message if needed, though the check above handles it
                case 'auth/unauthorized-admin': 
                     errorMessage = error.message; 
                     break;
                default:
                    errorMessage = 'An error occurred during login. Please try again.';
            }
            setError({ 
                code: error?.code || 'auth/unknown',
                message: errorMessage 
            });
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
                    <p className="auth-subtitle">Access the administrator dashboard</p>
                </div>

                <form className="auth-form" onSubmit={handleLogin} noValidate>
                     {/* Email Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-email">Email Address</label>
                        <input
                            id="admin-email"
                            type="email"
                            // Add error class based on validation state
                            className={`form-input ${formErrors.email ? 'error' : ''}`} 
                            // onBlur={() => handleBlur('email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            aria-required="true"
                            aria-invalid={!!formErrors.email} // Accessibility
                            aria-describedby="admin-email-error"
                        />
                         {formErrors.email && <p id="admin-email-error" className="error-message">{formErrors.email}</p>}
                    </div>

                     {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="admin-password">Password</label>
                        <input
                            id="admin-password"
                            type="password"
                            className={`form-input ${formErrors.password ? 'error' : ''}`}
                            // onBlur={() => handleBlur('password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            aria-required="true"
                             aria-invalid={!!formErrors.password} // Accessibility
                            aria-describedby="admin-password-error"
                        />
                        {formErrors.password && <p id="admin-password-error" className="error-message">{formErrors.password}</p>}
                    </div>

                     {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading || Object.keys(formErrors).length > 0} // Disable if loading or form has errors
                        whileHover={{ scale: (isLoading || Object.keys(formErrors).length > 0) ? 1 : 1.02 }}
                        whileTap={{ scale: (isLoading || Object.keys(formErrors).length > 0) ? 1 : 0.98 }}
                        aria-disabled={isLoading || Object.keys(formErrors).length > 0}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>

                 {/* Link to Signup */}
                <div className="auth-links">
                    <p>
                        Need an admin account?{' '}
                        <Link to="/admin-signup" className="auth-link">
                            Register Here
                        </Link>
                    </p>
                </div>
            </motion.div>
            
            {/* Error Dialog */}
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminLogin;