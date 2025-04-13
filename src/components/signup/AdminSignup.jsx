import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice"; // Assuming Login is the correct action name
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import ImageUpload from '../common/ImageUpload'; // Ensure this path is correct

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

        // Provide immediate feedback for password length
        if (value.length > 0 && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const signup = async (e) => {
        e.preventDefault();
        // Reset error before attempting signup
        setError(null);
        
        // Basic check before proceeding
        if (passwordError || !adminInfo.name || !adminInfo.contact || !adminInfo.email || !adminInfo.avatar || !adminInfo.password) {
             setError({ code: 'validation-error', message: 'Please fill all required fields and ensure password meets requirements.' });
             return;
        }

        // *** FIX: Set submitting state to true ***
        setIsSubmitting(true); 

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, adminInfo.email, adminInfo.password);
            const user = userCredential.user;

            // 2. Update Firebase Auth Profile (optional but good practice)
            await updateProfile(user, {
                displayName: adminInfo.name,
                photoURL: adminInfo.avatar // Ensure ImageUpload provides a usable URL
            });

            // 3. Add admin details to Firestore 'AdminInfo' collection
            // Ensure email is stored consistently (e.g., lowercase)
            await addDoc(collection(db, "AdminInfo"), {
                uid: user.uid,
                role: adminInfo.role, // "admin"
                name: adminInfo.name,
                contact: adminInfo.contact,
                email: adminInfo.email.toLowerCase(), 
                avatar: adminInfo.avatar,
                createdAt: new Date() // Use Firestore server timestamp for better accuracy if needed
            });

            // 4. Dispatch login action to update Redux state
            // Ensure the payload matches what your Login reducer expects
            dispatch(Login({ 
                // Pass necessary user details, uid is crucial
                userData: { 
                    uid: user.uid, 
                    email: user.email, 
                    displayName: adminInfo.name, // Use the name from the form
                    photoURL: adminInfo.avatar, // Use the avatar from the form
                    role: adminInfo.role // Explicitly include the role
                },
                isLoggedIn: true 
            }));

            // 5. Navigate to the admin dashboard *after* successful state update (usually okay)
            navigate("/admin-dashboard"); 
            // If redirection still fails, the issue is likely in ProtectedRoute or Redux timing

        } catch (error) {
            console.error("Admin Signup Error:", error); // Log the full error
            let errorMessage;
            // Map Firebase error codes to user-friendly messages
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
            // Ensure submitting state is reset regardless of success or failure
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
                    <p className="auth-subtitle">Create a new administrator account</p>
                </div>

                <form className="auth-form" onSubmit={signup} noValidate> 
                    {/* Added noValidate to rely on custom validation */}
                    
                    {/* Form Fields (Name, Contact, Email) */}
                     <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name" // Added id for label association
                            type="text"
                            name="name"
                            className="form-input"
                            value={adminInfo.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                            aria-required="true" // Accessibility
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="contact">Contact Number</label>
                        <input
                            id="contact"
                            type="tel" // Use tel type for phone numbers
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
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Profile Picture</label>
                        <ImageUpload
                            onImageUpload={handleImageUpload}
                            previewUrl={adminInfo.avatar}
                            onRemoveImage={handleRemoveImage}
                            disabled={isSubmitting}
                        />
                         {!adminInfo.avatar && <p className="info-message">Profile picture is required.</p>} {/* Added info message */}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                             // Add error class conditionally
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={adminInfo.password}
                            onChange={handlePasswordChange}
                            placeholder="Create a password (min. 6 characters)"
                            required
                            aria-required="true"
                            aria-describedby="password-error-msg" // Link error message
                        />
                        {passwordError && (
                            <motion.div 
                                id="password-error-msg" // Added id for aria-describedby
                                className="error-message" // Use a specific class for styling errors
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {passwordError}
                            </motion.div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        className="auth-button"
                         // Disable based on submitting state, missing avatar, or password error
                        disabled={isSubmitting || !adminInfo.avatar || !!passwordError} 
                        whileHover={{ scale: isSubmitting || !adminInfo.avatar || !!passwordError ? 1 : 1.02 }} // Disable hover effect when disabled
                        whileTap={{ scale: isSubmitting || !adminInfo.avatar || !!passwordError ? 1 : 0.98 }} // Disable tap effect when disabled
                        aria-disabled={isSubmitting || !adminInfo.avatar || !!passwordError}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register as Admin'}
                    </motion.button>
                </form>

                 {/* Link to Login */}
                <div className="auth-links">
                    <p>
                        Already have an admin account?{' '}
                        <Link to="/admin-login" className="auth-link">
                            Sign In Here
                        </Link>
                    </p>
                </div>
            </motion.div>
            
            {/* Error Dialog */}
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminSignup;