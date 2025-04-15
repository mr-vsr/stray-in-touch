import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login as LogIn } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { collection, addDoc } from "firebase/firestore";
import ImageUpload from '../common/ImageUpload';

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [userInfo, setUserInfo] = useState({
        role: "user",
        name: "",
        contact: "",
        email: "",
        avatar: "",
        gender: "Other",
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
                setUserInfo(prev => ({ ...prev, contact: numbersOnly }));
                if (numbersOnly.length > 0 && numbersOnly.length !== 10) {
                    setContactError('Contact number must be exactly 10 digits');
                } else {
                    setContactError('');
                }
            }
            return;
        }

        if (name === 'email') {
            setUserInfo(prev => ({ ...prev, email: value }));
            if (value.length > 0 && !validateEmail(value)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
            return;
        }

        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setUserInfo(prev => ({ ...prev, password: value }));

        if (value.length > 0 && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const handleImageUpload = (imageUrl) => {
        setUserInfo(prev => ({ ...prev, avatar: imageUrl }));
    };

    const handleRemoveImage = () => {
        setUserInfo(prev => ({ ...prev, avatar: "" }));
    };


    const signup = async (e) => {
        e.preventDefault();
        setError(null);

        if (!userInfo.avatar) {
            setError({ code: 'validation/no-avatar', message: 'Please upload a profile picture' }); return;
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
        if (!userInfo.name.trim() || !userInfo.contact.trim() || !userInfo.email.trim() || !userInfo.password) {
             setError({ code: 'validation/required', message: 'Please fill in all required fields correctly.' }); return;
        }
         if (userInfo.contact.length !== 10) {
             setContactError('Contact number must be exactly 10 digits');
              setError({ code: 'validation/contact', message: 'Contact number must be exactly 10 digits' }); return;
         }

        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: userInfo.name,
                photoURL: userInfo.avatar
            });

            await addDoc(collection(db, "users"), {
                uid: user.uid,
                role: userInfo.role,
                name: userInfo.name,
                contact: userInfo.contact,
                email: userInfo.email.toLowerCase(),
                avatar: userInfo.avatar,
                gender: userInfo.gender,
                createdAt: new Date()
            });

            dispatch(LogIn({
                userData: {
                    uid: user.uid,
                    email: user.email,
                    displayName: userInfo.name,
                    photoURL: userInfo.avatar,
                    role: "user",
                    contact: userInfo.contact
                },
                isLoggedIn: true
            }));

            navigate("/user-homepage");
        } catch (error) {
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered. Please sign in instead.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please check your email address.';
                    setEmailError('Invalid email format provided.');
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. It should be at least 6 characters long.';
                    setPasswordError('Password should be at least 6 characters long.');
                    break;
                default:
                    errorMessage = `An error occurred during signup: ${error.message || 'Please try again.'}`;
            }
            setError({ code: error.code, message: errorMessage });
            console.error("Signup Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = userInfo.name && userInfo.contact && userInfo.email && userInfo.password && userInfo.avatar && !passwordError && !contactError && !emailError;

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join our community today</p>
                </div>

                <form className="auth-form" onSubmit={signup} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="user-name">Full Name</label>
                        <input
                            id="user-name" type="text" name="name" className="form-input"
                            value={userInfo.name} onChange={handleChange}
                            placeholder="Enter your full name" required aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="user-contact">Contact Number</label>
                        <input
                             id="user-contact" type="tel" name="contact"
                            className={`form-input ${contactError ? 'error' : ''}`}
                            value={userInfo.contact} onChange={handleChange}
                            placeholder="Enter your 10-digit contact number" required aria-required="true"
                            maxLength="10" inputMode="numeric" pattern="\d{10}"
                            aria-invalid={!!contactError} aria-describedby="contact-error-msg-user"
                        />
                        {contactError && (
                            <motion.div id="contact-error-msg-user" className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="assertive">
                                {contactError}
                            </motion.div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="user-email">Email Address</label>
                        <input
                            id="user-email" type="email" name="email"
                            className={`form-input ${emailError ? 'error' : ''}`}
                            value={userInfo.email} onChange={handleChange}
                            placeholder="Enter your email" required aria-required="true"
                            aria-invalid={!!emailError} aria-describedby="email-error-msg-user"
                        />
                         {emailError && (
                            <motion.div id="email-error-msg-user" className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="assertive">
                                {emailError}
                            </motion.div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="user-gender">Gender</label>
                        <select
                            id="user-gender" name="gender" className="form-input"
                            value={userInfo.gender} onChange={handleChange} required aria-required="true"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Profile Picture</label>
                        <ImageUpload
                            onImageUpload={handleImageUpload} previewUrl={userInfo.avatar}
                            onRemoveImage={handleRemoveImage} disabled={isSubmitting}
                        />
                          {!userInfo.avatar && <p className="info-message" aria-live="polite">Profile picture is required.</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="user-password">Password</label>
                        <input
                            id="user-password" type="password" name="password"
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={userInfo.password} onChange={handlePasswordChange}
                            placeholder="Create a password (min. 6 characters)" required aria-required="true"
                             aria-invalid={!!passwordError} aria-describedby="password-error-msg-user"
                        />
                        {passwordError && (
                            <motion.div id="password-error-msg-user" className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="assertive">
                                {passwordError}
                            </motion.div>
                        )}
                    </div>
                    <motion.button
                        type="submit" className="auth-button" disabled={isSubmitting || !isFormValid}
                        whileHover={{ scale: isFormValid ? 1.02 : 1 }} whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                         aria-disabled={isSubmitting || !isFormValid} aria-label={isSubmitting ? 'Creating account, please wait' : 'Register'}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register'}
                    </motion.button>
                </form>
                <div className="auth-links">
                    <p> Already have an account?{' '} <Link to="/user-login" className="auth-link"> Sign In </Link> </p>
                </div>
            </motion.div>
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}
export default Signup;