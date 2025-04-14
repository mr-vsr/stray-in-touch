import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import ImageUpload from '../common/ImageUpload';

function AdminSignup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [adminInfo, setAdminInfo] = useState({
        role: "admin",
        name: "",
        contact: "",
        email: "",
        avatar: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (imageUrl) => {
        setAdminInfo(prev => ({
            ...prev,
            avatar: imageUrl
        }));
    };

    const handleRemoveImage = () => {
        setAdminInfo(prev => ({
            ...prev,
            avatar: ""
        }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setAdminInfo(prev => ({
            ...prev,
            password: value
        }));

        if (value.length > 0 && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const signup = async (e) => {
        e.preventDefault();
        setError(null);

        if (passwordError || !adminInfo.name || !adminInfo.contact || !adminInfo.email || !adminInfo.avatar || !adminInfo.password) {
             setError({ code: 'validation-error', message: 'Please fill all required fields and ensure password meets requirements.' });
             return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: adminInfo.name,
                photoURL: adminInfo.avatar
            });

            await addDoc(collection(db, "admins"), {
                uid: user.uid,
                role: adminInfo.role,
                name: adminInfo.name,
                contact: adminInfo.contact,
                email: adminInfo.email.toLowerCase(),
                avatar: adminInfo.avatar,
                createdAt: new Date()
            });

            dispatch(Login({
                userData: {
                    uid: user.uid,
                    email: user.email,
                    displayName: adminInfo.name,
                    photoURL: adminInfo.avatar,
                    role: adminInfo.role,
                    contact: adminInfo.contact
                },
                isLoggedIn: true
            }));

            navigate("/admin-dashboard");
        } catch (error) {
            console.error("Admin Signup Error:", error);
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already registered. Please try logging in.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address format is invalid.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. It must be at least 6 characters long.';
                    break;
                case 'auth/operation-not-allowed':
                     errorMessage = 'Email/password sign-up is not enabled in Firebase console.';
                     break;
                default:
                    errorMessage = 'An unexpected error occurred during registration. Please try again.';
            }
            setError({ code: error.code || 'unknown-error', message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = adminInfo.name && adminInfo.contact && adminInfo.email && adminInfo.password && adminInfo.avatar && !passwordError;

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <h1 className="auth-title">Admin Registration</h1>
                    <p className="auth-subtitle">Create a new administrator account</p>
                </div>

                <form className="auth-form" onSubmit={signup} noValidate>

                     <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            className="form-input"
                            value={adminInfo.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="contact">Contact Number</label>
                        <input
                            id="contact"
                            type="tel"
                            name="contact"
                            className="form-input"
                            value={adminInfo.contact}
                            onChange={handleChange}
                            placeholder="Enter your contact number"
                            required
                            aria-required="true"
                        />
                    </div>

                     <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="form-input"
                            value={adminInfo.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            aria-required="true"
                            aria-invalid={false} // Add aria-invalid based on email validation if implemented
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Profile Picture</label>
                        <ImageUpload
                            onImageUpload={handleImageUpload}
                            previewUrl={adminInfo.avatar}
                            onRemoveImage={handleRemoveImage}
                            disabled={isSubmitting}
                        />
                         {!adminInfo.avatar && <p className="info-message" aria-live="polite">Profile picture is required.</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={adminInfo.password}
                            onChange={handlePasswordChange}
                            placeholder="Create a password (min. 6 characters)"
                            required
                            aria-required="true"
                            aria-invalid={!!passwordError}
                            aria-describedby="password-error-msg"
                        />
                        {passwordError && (
                            <motion.div
                                id="password-error-msg"
                                className="error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                aria-live="assertive"
                            >
                                {passwordError}
                            </motion.div>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        className="auth-button"
                        disabled={isSubmitting || !isFormValid}
                        whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                        whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                        aria-disabled={isSubmitting || !isFormValid}
                        aria-label={isSubmitting ? 'Creating account, please wait' : 'Register as Admin'}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register as Admin'}
                    </motion.button>
                </form>

                <div className="auth-links">
                    <p>
                        Already have an admin account?{' '}
                        <Link to="/admin-login" className="auth-link">
                            Sign In Here
                        </Link>
                    </p>
                </div>
            </motion.div>

            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminSignup;