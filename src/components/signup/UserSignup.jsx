import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { styledLink } from '../../assets';
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { useDispatch } from 'react-redux';
import { Login as LogIn } from "../../store/authSlice";
import { collection, addDoc } from "firebase/firestore";
import { Header, Footer } from '../../components/index.js';
import ImageUpload from '../common/ImageUpload';

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleImageUpload = (imageUrl) => {
    setUserInfo(prev => ({
      ...prev,
      avatar: imageUrl
    }));
  };

  const handleRemoveImage = () => {
    setUserInfo(prev => ({
      ...prev,
      avatar: ""
    }));
  };

  const signup = async (e) => {
    e.preventDefault();

    if (!userInfo.name || !userInfo.contact || !userInfo.email || !userInfo.password) {
      setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
      return;
    }

    if (!validateEmail(userInfo.email)) {
      setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
      return;
    }

    if (userInfo.password.length < 6) {
      setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password);
      const user = userCredential.user;

      // Update user profile with name and photo URL
      await updateProfile(user, {
        displayName: userInfo.name,
        photoURL: userInfo.avatar
      });

      // Save user data to Firestore
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

      // Login the user
      dispatch(LogIn({
        userData: user,
        isLoggedIn: true
      }));

      // Navigate to user homepage
      navigate("/user-homepage");
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="updated-page-container">
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
            className='signup-heading updated-heading'
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            User Signup
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
                value={userInfo.name}
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
                value={userInfo.contact}
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
                value={userInfo.email}
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
                previewUrl={userInfo.avatar}
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
                value={userInfo.gender}
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
                value={userInfo.password}
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </motion.button>
          </motion.form>
          <motion.p
            className='login-text'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            Already have an account?
            <Link to="/user-login" style={{ ...styledLink, color: '#0062ff' }}>Login</Link>
          </motion.p>
        </motion.div>
        {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
      </motion.div>
      <Footer />
    </div>
  );
}

export default Signup;