import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { styledLink } from '../../assets';
import { motion } from 'framer-motion';
import { collection, addDoc } from "firebase/firestore";
import ErrorDialog from '../ErrorDialog';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { Header, Footer } from '../../components/index.js';
import '../../App.css';

function AdminSignup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        email: "",
        avatar: "",
        gender: "Other",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                avatar: URL.createObjectURL(file)
            }));
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            avatar: ""
        }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const signup = async () => {
        // Validate required fields
        const requiredFields = ["name", "contact", "email", "gender", "password"];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
            return;
        }

        // Validate email format
        if (!validateEmail(formData.email)) {
            setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            if (user) {
                // Save additional admin info to Firestore
                await addDoc(collection(db, "admins"), {
                    uid: user.uid,
                    role: "admin",
                    name: formData.name,
                    contact: formData.contact,
                    email: formData.email.toLowerCase(),
                    avatar: formData.avatar || null,
                    gender: formData.gender,
                    createdAt: new Date()
                });

                // Update profile in Firebase Auth
                await updateProfile(user, {
                    displayName: formData.name,
                    photoURL: formData.avatar || null
                });

                // Login the admin
                dispatch(Login({
                    userData: user,
                    isLoggedIn: true
                }));

                // Navigate to admin dashboard
                navigate("/admin-dashboard");
            }
        } catch (error) {
            console.error("Error in admin signup:", error);
            setError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='updated-page-container'>
            <Header />
            <motion.div
                className='container'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className='signup-container'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <motion.h2
                        className='signup-heading'
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Admin Registration
                    </motion.h2>
                    <motion.form
                        onSubmit={handleSubmit}
                        className='signup-form-container'
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
                                type='text'
                                name="name"
                                className='name'
                                placeholder='Full Name *'
                                onChange={handleChange}
                                value={formData.name}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.55 }}
                        >
                            <input
                                type='tel'
                                name="contact"
                                className='contact'
                                placeholder='Contact Number *'
                                onChange={handleChange}
                                value={formData.contact}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <input
                                type='email'
                                name="email"
                                className='email'
                                placeholder='Email Address *'
                                onChange={handleChange}
                                value={formData.email}
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.75 }}
                            className="image-upload-container"
                        >
                            <label className="image-upload-label">Profile Picture (optional)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="image-upload-input"
                                onChange={handleFileChange}
                            />
                            <div
                                className="image-upload-button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarPreview ? 'Change Image' : 'Click to upload profile picture'}
                            </div>
                            {avatarPreview && (
                                <div className="image-preview-container">
                                    <img src={avatarPreview} alt="Avatar Preview" />
                                    <button
                                        type="button"
                                        className="remove-image-button"
                                        onClick={removeImage}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="form-gender-selection"
                        >
                            <label className="gender-label">Gender *</label>
                            <select
                                name="gender"
                                className="gender-select"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.75 }}
                        >
                            <input
                                type='password'
                                name="password"
                                className='password'
                                placeholder='Password *'
                                onChange={handleChange}
                                value={formData.password}
                                required
                            />
                        </motion.div>

                        <motion.button
                            type='button'
                            className='signup-button updated-button'
                            onClick={signup}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
                        </motion.button>
                    </motion.form>
                    <motion.p
                        className='login-text'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Already have an account?
                        <Link to="/admin-login" style={{ ...styledLink, color: '#0062ff' }}>Login</Link>
                    </motion.p>
                </motion.div>
            </motion.div>
            <Footer />
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default AdminSignup; 