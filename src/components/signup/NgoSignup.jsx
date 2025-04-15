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
    const [contactError, setContactError] = useState(''); // Added
    const [emailError, setEmailError] = useState(''); // Added

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'contact') {
             const numbersOnly = value.replace(/\D/g, '');
             // Example: Enforcing 10 digits (adjust if needed for NGOs)
             if (numbersOnly.length <= 10) {
                 setNgoInfo(prev => ({ ...prev, contact: numbersOnly }));
                 if (numbersOnly.length > 0 && numbersOnly.length !== 10) {
                     setContactError('Contact number must be exactly 10 digits');
                 } else {
                     setContactError('');
                 }
             }
             return;
         }

         if (name === 'email') {
             setNgoInfo(prev => ({ ...prev, email: value }));
             if (value.length > 0 && !validateEmail(value)) {
                 setEmailError('Please enter a valid email address');
             } else {
                 setEmailError('');
             }
             return;
         }

        setNgoInfo({ ...ngoInfo, [name]: value });
    };

    const handleImageUpload = (imageUrl) => {
        setNgoInfo(prev => ({ ...prev, banner: imageUrl }));
    };

    const handleRemoveImage = () => {
        setNgoInfo(prev => ({ ...prev, banner: "" }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNgoInfo(prev => ({ ...prev, password: value }));

        if (value.length > 0 && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const signup = async (e) => {
        e.preventDefault();
        setError(null);

        if (!ngoInfo.banner) {
            setError({ code: 'validation/no-banner', message: 'Please upload an NGO banner image' }); return;
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
        if (!ngoInfo.name.trim() || !ngoInfo.contact.trim() || !ngoInfo.email.trim() || !ngoInfo.address.trim() || !ngoInfo.password) {
             setError({ code: 'validation/required', message: 'Please fill in all required fields correctly.' }); return;
        }
         // Final contact length check (if enforcing 10 digits)
         if (ngoInfo.contact.length !== 10) {
             setContactError('Contact number must be exactly 10 digits');
             setError({ code: 'validation/contact', message: 'Contact number must be exactly 10 digits' });
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
                role: "ngo",
                name: ngoInfo.name,
                contact: ngoInfo.contact,
                email: ngoInfo.email.toLowerCase(),
                address: ngoInfo.address,
                banner: ngoInfo.banner,
                createdAt: new Date()
            });

            dispatch(Login({
                userData: {
                    uid: user.uid,
                    email: user.email,
                    displayName: ngoInfo.name,
                    photoURL: ngoInfo.banner,
                    role: "ngo",
                    contact: ngoInfo.contact,
                    address: ngoInfo.address
                },
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
                     setEmailError('Invalid email format provided.');
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters long.';
                    setPasswordError('Password should be at least 6 characters long.');
                    break;
                default:
                    errorMessage = 'An error occurred during signup.';
            }
            setError({ code: error.code, message: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

     const isFormValid = ngoInfo.name && ngoInfo.contact && ngoInfo.email && ngoInfo.address && ngoInfo.banner && ngoInfo.password && !passwordError && !contactError && !emailError;


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

                <form className="auth-form" onSubmit={signup} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">NGO Name</label>
                        <input
                            id="name" type="text" name="name" className="form-input"
                            value={ngoInfo.name} onChange={handleChange}
                            placeholder="Enter NGO name" required aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="contact">Contact Number</label>
                        <input
                            id="contact" type="tel" name="contact"
                            className={`form-input ${contactError ? 'error' : ''}`}
                            value={ngoInfo.contact} onChange={handleChange}
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
                            value={ngoInfo.email} onChange={handleChange}
                            placeholder="Enter email" required aria-required="true"
                             aria-invalid={!!emailError}
                        />
                          {emailError && (
                            <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                {emailError}
                            </motion.div>
                        )}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="address">Address</label>
                        <input
                             id="address" type="text" name="address" className="form-input"
                            value={ngoInfo.address} onChange={handleChange}
                            placeholder="Enter NGO address" required aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Banner Image</label>
                        <ImageUpload
                            onImageUpload={handleImageUpload} previewUrl={ngoInfo.banner}
                            onRemoveImage={handleRemoveImage} disabled={isSubmitting}
                        />
                         {!ngoInfo.banner && <p className="info-message" aria-live="polite">Banner image is required.</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password" type="password" name="password"
                            className={`form-input ${passwordError ? 'error' : ''}`}
                            value={ngoInfo.password} onChange={handlePasswordChange}
                            placeholder="Create password (min. 6 characters)" required aria-required="true"
                             aria-invalid={!!passwordError} aria-describedby="password-error-msg-ngo"
                        />
                        {passwordError && (
                            <motion.div id="password-error-msg-ngo" className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} aria-live="assertive">
                                {passwordError}
                            </motion.div>
                        )}
                    </div>
                    <motion.button
                        type="submit" className="auth-button" disabled={isSubmitting || !isFormValid}
                        whileHover={{ scale: isFormValid ? 1.02 : 1 }} whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                         aria-disabled={isSubmitting || !isFormValid} aria-label={isSubmitting ? 'Creating NGO account, please wait' : 'Register NGO'}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Register NGO'}
                    </motion.button>
                </form>
                <div className="auth-links">
                    <p> Already have an NGO account?{' '} <Link to="/ngo-login" className="auth-link"> Sign In </Link> </p>
                </div>
            </motion.div>
            {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
        </div>
    );
}
export default NgoSignup;