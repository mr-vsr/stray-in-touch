import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { styledLink } from '../../assets';
import { motion } from 'framer-motion';
import { collection, addDoc } from "firebase/firestore";
import ErrorDialog from '../ErrorDialog';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import ImageUpload from '../common/ImageUpload';

function AdminSignup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (imageUrl) => {
        setFormData(prev => ({
            ...prev,
            avatar: imageUrl
        }));
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            avatar: ""
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const signup = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.contact || !formData.email || !formData.password) {
            setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
            return;
        }

        if (!validateEmail(formData.email)) {
            setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
            return;
        }

        if (formData.password.length < 6) {
            setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Update user profile with name and photo URL
            await updateProfile(user, {
                displayName: formData.name,
                photoURL: formData.avatar
            });

            // Save admin data to Firestore
            await addDoc(collection(db, "admins"), {
                uid: user.uid,
                name: formData.name,
                contact: formData.contact,
                email: formData.email.toLowerCase(),
                avatar: formData.avatar,
                gender: formData.gender,
                createdAt: new Date()
            });

            // Login the user
            dispatch(Login({
                userData: user,
                isLoggedIn: true
            }));

            // Navigate to admin dashboard
            navigate("/admin-dashboard");
        } catch (error) {
            console.error("Error during signup:", error);
            setError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="updated-page-container">
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
                        className='signup-heading updated-heading'
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Admin Signup
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
                            transition={{ delay: 0.6 }}
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
                            transition={{ delay: 0.65 }}
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
                            transition={{ delay: 0.7 }}
                        >
                            <ImageUpload
                                label="Profile Picture (optional)"
                                onImageUpload={handleImageUpload}
                                previewUrl={formData.avatar}
                                onRemoveImage={handleRemoveImage}
                                disabled={isSubmitting}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.75 }}
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
                            transition={{ delay: 0.8 }}
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
                            type='submit'
                            className='signup-button updated-button'
                            onClick={signup}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSubmitting ? 'Registering...' : 'Register Admin'}
                        </motion.button>
                    </motion.form>
                    <motion.p
                        className='login-text'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.85 }}
                    >
                        Already have an account?
                        <Link to="/admin-login" style={{ ...styledLink, color: '#0062ff' }}>Login</Link>
                    </motion.p>
                </motion.div>
                {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
            </motion.div>
        </div>
    );
}

export default AdminSignup; 