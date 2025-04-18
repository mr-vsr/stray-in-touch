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

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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
    const [contactError, setContactError] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contact') {
            const numbersOnly = value.replace(/\D/g, '');
            if (numbersOnly.length <= 10) {
                 setAdminInfo(prev => ({ ...prev, contact: numbersOnly }));
                 if (numbersOnly.length > 0 && numbersOnly.length !== 10) {
                     setContactError('Contact number must be exactly 10 digits');
                 } else {
                     setContactError('');
                 }
             }
             return;
        }

        if (name === 'email') {
            setAdminInfo(prev => ({ ...prev, email: value }));
            if (value.length > 0 && !validateEmail(value)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
            return;
        }

        setAdminInfo(prev => ({ ...prev, [name]: value }));
    };


    const handleImageUpload = (imageUrl) => {
        setAdminInfo(prev => ({ ...prev, avatar: imageUrl }));
    };

    const handleRemoveImage = () => {
        setAdminInfo(prev => ({ ...prev, avatar: "" }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setAdminInfo(prev => ({ ...prev, password: value }));

        if (value.length > 0 && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const signup = async (e) => {
        e.preventDefault();
        setError(null);
    
        // Added checks for new error states
        if (!adminInfo.avatar) {
             setError({ code: 'validation/no-avatar', message: 'Please upload a profile picture.' }); return;
        }
        if (emailError) {
             setError({ code: 'validation/email', message: emailError }); return;
        }
        if (contactError) {
            setError({ code: 'validation/contact', message: contactError }); return;
        }
        if (passwordError) {
             setError({ code: 'validation/password', message: passwordError }); return;
        }
        // Check required fields trim
        if (!adminInfo.name.trim() || !adminInfo.contact.trim() || !adminInfo.email.trim() || !adminInfo.password) {
             setError({ code: 'validation/required', message: 'Please fill in all required fields correctly.' }); return;
        }
        // Final contact length check (if enforcing 10 digits)
        if (adminInfo.contact.length !== 10) {
             setContactError('Contact number must be exactly 10 digits');
             setError({ code: 'validation/contact', message: 'Contact number must be exactly 10 digits' });
             return;
        }


        setIsSubmitting(true);
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
            const user = userCredential.user;
    
            // Update profile
            await updateProfile(user, {
                displayName: adminInfo.name,
                photoURL: adminInfo.avatar
            });
    
            // Add to Firestore with proper document structure
            const adminDocRef = await addDoc(collection(db, "admins"), {
                uid: user.uid,
                role: "admin",
                name: adminInfo.name,
                contact: adminInfo.contact,
                email: adminInfo.email.toLowerCase(),
                avatar: adminInfo.avatar,
                createdAt: new Date().toISOString(),
                isActive: true
            });

            dispatch(Login({
                isLoggedIn: true,
                userData: {
                    uid: user.uid,
                    email: user.email.toLowerCase(),
                    displayName: adminInfo.name,
                    photoURL: adminInfo.avatar,
                    role: "admin",
                    contact: adminInfo.contact,
                    docId: adminDocRef.id
                }
            }));

            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate("/admin-dashboard", { replace: true });
            
        } catch (error) {
            console.error("Admin Signup Error:", error);
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already registered. Please try logging in.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address format is invalid.';
                    setEmailError('Invalid email format provided.');
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. It must be at least 6 characters long.';
                    setPasswordError('Password should be at least 6 characters long.');
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

    const isFormValid = adminInfo.name && adminInfo.contact && adminInfo.email && adminInfo.password && adminInfo.avatar && !passwordError && !contactError && !emailError;

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
                            id="name" type="text" name="name" className="form-input"
                            value={adminInfo.name} onChange={handleChange}
                            placeholder="Enter your full name" required aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="contact">Contact Number</label>
                        <input
                            id="contact" type="tel" name="contact"
                            className={`form-input ${contactError ? 'error' : ''}`}
                            value={adminInfo.contact} onChange={handleChange}
                            placeholder="Enter 10-digit contact number" required aria-required="true"
                            maxLength="10" inputMode="numeric" pattern="\d{10}"
                        />
                         {contactError && (
                            <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {contactError}
                            </motion.div>
                        )}
                    </div>
                     <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email" type="email" name="email"
                            className={`form-input ${emailError ? 'error' : ''}`}
                            value={adminInfo.email} onChange={handleChange}
                            placeholder="Enter your email" required aria-required="true"
                            aria-invalid={!!emailError}
                        />
                         {emailError && (
                            <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {emailError}
                            </motion.div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Profile Picture</label>
                        <ImageUpload
                            label="Upload Profile Picture"
                            onImageUpload={handleImageUpload} previewUrl={adminInfo.avatar}
                            onRemoveImage={handleRemoveImage} disabled={isSubmitting}
                        />
                         {!adminInfo.avatar && <p className="info-message" aria-live="polite">Profile picture is required.</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password" type="password" name="password"
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={adminInfo.password} onChange={handlePasswordChange}
                            placeholder="Create a password (min. 6 characters)" required aria-required="true"
                            aria-invalid={!!passwordError} aria-describedby="password-error-msg"
                        />
                        {passwordError && (
                            <motion.div id="password-error-msg" className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="assertive">
                                {passwordError}
                            </motion.div>
                        )}
                    </div>
                    <motion.button
                        type="submit" className="auth-button" disabled={isSubmitting || !isFormValid}
                        whileHover={{ scale: isFormValid ? 1.02 : 1 }} whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                        aria-disabled={isSubmitting || !isFormValid} aria-label={isSubmitting ? 'Creating account, please wait' : 'Register as Admin'}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register as Admin'}
                    </motion.button>
                </form>
                <div className="auth-links">
                    <p> Already have an admin account?{' '} <Link to="/admin-login" className="auth-link"> Sign In Here </Link> </p>
                </div>
            </motion.div>
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}
export default AdminSignup;