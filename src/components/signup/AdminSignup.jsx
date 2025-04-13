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
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: adminInfo.name,
                photoURL: adminInfo.avatar
            });

            await addDoc(collection(db, "AdminInfo"), {
                uid: user.uid,
                role: adminInfo.role,
                name: adminInfo.name,
                contact: adminInfo.contact,
                email: adminInfo.email.toLowerCase(),
                avatar: adminInfo.avatar,
                createdAt: new Date()
            });

            dispatch(Login({
                userData: user,
                isLoggedIn: true
            }));

            // Fix the navigation path
            navigate("/admin-dashboard");
        } catch (error) {
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters long.';
                    break;
                default:
                    errorMessage = 'An error occurred during signup.';
            }
            setError({ code: error.code, message: errorMessage });
        } finally {
            setIsSubmitting(false);
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
                    <h1 className="auth-title">Admin Registration</h1>
                    <p className="auth-subtitle">Create an admin account</p>
                </div>

                <form className="auth-form" onSubmit={signup}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={adminInfo.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input
                            type="tel"
                            name="contact"
                            className="form-input"
                            value={adminInfo.contact}
                            onChange={handleChange}
                            placeholder="Enter your contact number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={adminInfo.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
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
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={adminInfo.password}
                            onChange={handlePasswordChange}
                            placeholder="Create a password"
                            required
                        />
                        {passwordError && (
                            <motion.div 
                                className="error-message"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {passwordError}
                            </motion.div>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        className="auth-button"
                        disabled={isSubmitting || !adminInfo.avatar || passwordError}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register as Admin'}
                    </motion.button>
                </form>

                <div className="auth-links">
                    <p>
                        Already have an admin account?{' '}
                        <Link to="/admin-login" className="auth-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
            
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminSignup;