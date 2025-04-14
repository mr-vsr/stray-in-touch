import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { collection, query, where, getDocs } from "firebase/firestore";

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        validateForm();
    }, [formData.email, formData.password]);

    const validateForm = () => {
        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
        if (!formData.password) errors.password = 'Password is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const currentFormErrors = {};
        if (!formData.email) currentFormErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) currentFormErrors.email = 'Invalid email format';
        if (!formData.password) currentFormErrors.password = 'Password is required';
        setFormErrors(currentFormErrors);

        if (Object.keys(currentFormErrors).length > 0) {
            setError({
                code: 'validation-error',
                message: 'Please fix the errors in the form.'
            });
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const adminRef = collection(db, 'admins');
            const q = query(adminRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                await signOut(auth);
                setError({
                    code: 'auth/unauthorized-admin',
                    message: 'Access Denied. This account is not registered as an admin.'
                });
                setIsLoading(false);
                return;
            }

            const adminData = querySnapshot.docs[0].data();

            if (adminData.role !== 'admin') {
                 await signOut(auth);
                 setError({
                     code: 'auth/incorrect-admin-role',
                     message: 'Access Denied. Account found but does not have the required admin role.'
                 });
                 setIsLoading(false);
                 return;
            }

            dispatch(Login({
                userData: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || adminData.name,
                    photoURL: user.photoURL || adminData.avatar,
                    role: adminData.role,
                    contact: adminData.contact
                },
                isLoggedIn: true
            }));

            navigate("/admin-dashboard");

        } catch (error) {
            console.error('Admin Login Error:', error);
            let errorMessage;
            switch (error?.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Incorrect email or password. Please check your credentials.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address or incorrect password.';
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
                case 'auth/unauthorized-admin':
                case 'auth/incorrect-admin-role':
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
          {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
          <div className="auth-card">
            <h2 className="auth-title">Admin Login</h2>
            <p className="auth-subtitle">Access the administrator dashboard</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${touched.email && formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={touched.email && !!formErrors.email}
                  aria-describedby={touched.email && formErrors.email ? "email-error" : undefined}
                />
                {touched.email && formErrors.email && (
                  <div id="email-error" className="error-message">{formErrors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className={`form-input ${touched.password && formErrors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={touched.password && !!formErrors.password}
                  aria-describedby={touched.password && formErrors.password ? "password-error" : undefined}
                />
                {touched.password && formErrors.password && (
                  <div id="password-error" className="error-message">{formErrors.password}</div>
                )}
              </div>

              <motion.button
                type="submit"
                className="auth-button"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={isLoading ? 'Logging in, please wait' : 'Login'}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>

            <p className="auth-link-text">
              Need an admin account?{' '}
              <Link to="/admin-signup" className="auth-link">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      );
};

export default AdminLogin;