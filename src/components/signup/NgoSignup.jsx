import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { styledLink } from '../../assets';
import { collection, addDoc } from "firebase/firestore";
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import ImageUpload from '../common/ImageUpload';

function NgoSignup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [ngoInfo, setNgoInfo] = useState({
        role: "ngo",
        name: "",
        contact: "",
        email: "",
        address: "",
        banner: "",
        password: ""
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNgoInfo({ ...ngoInfo, [name]: value });
    };

    const handleImageUpload = (imageUrl) => {
        setNgoInfo(prev => ({
            ...prev,
            banner: imageUrl
        }));
    };

    const handleRemoveImage = () => {
        setNgoInfo(prev => ({
            ...prev,
            banner: ""
        }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNgoInfo(prev => ({
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
        
        if (!ngoInfo.banner) {
            setError({ 
                code: 'validation/no-banner', 
                message: 'Please upload an NGO banner image' 
            });
            return;
        }

        if (passwordError) {
            setError({ 
                code: 'validation/password', 
                message: passwordError 
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, ngoInfo.email, ngoInfo.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: ngoInfo.name,
                photoURL: ngoInfo.banner
            });

            await addDoc(collection(db, "NgoInfo"), {
                uid: user.uid,
                role: ngoInfo.role, // Include role in Firestore document
                name: ngoInfo.name,
                contact: ngoInfo.contact,
                email: ngoInfo.email.toLowerCase(),
                address: ngoInfo.address,
                banner: ngoInfo.banner,
                createdAt: new Date()
            });

            dispatch(Login({
                userData: user,
                isLoggedIn: true
            }));

            navigate("/ngo-homepage");
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
                    <h1 className="auth-title">NGO Registration</h1>
                    <p className="auth-subtitle">Join our network of NGOs</p>
                </div>

                <form className="auth-form" onSubmit={signup}>
                    <div className="form-group">
                        <label className="form-label">NGO Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={ngoInfo.name}
                            onChange={handleChange}
                            placeholder="Enter NGO name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Number</label>
                        <input
                            type="tel"
                            name="contact"
                            className="form-input"
                            value={ngoInfo.contact}
                            onChange={handleChange}
                            placeholder="Enter contact number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={ngoInfo.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            className="form-input"
                            value={ngoInfo.address}
                            onChange={handleChange}
                            placeholder="Enter NGO address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Banner Image</label>
                        <ImageUpload
                            onImageUpload={handleImageUpload}
                            previewUrl={ngoInfo.banner}
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
                            value={ngoInfo.password}
                            onChange={handlePasswordChange}
                            placeholder="Create password"
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
                        disabled={isSubmitting || !ngoInfo.banner || passwordError}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register NGO'}
                    </motion.button>
                </form>

                <div className="auth-links">
                    <p>
                        Already have an NGO account?{' '}
                        <Link to="/ngo-login" className="auth-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
            
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}

export default NgoSignup;