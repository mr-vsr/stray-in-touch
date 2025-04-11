import React, { useState, useRef } from 'react';
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const removeImage = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const signup = async () => {
    // Validate required fields
    const requiredFields = ["name", "contact", "email", "gender", "password"];
    const missingFields = requiredFields.filter(field => !userInfo[field]);

    if (missingFields.length > 0) {
      setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
      return;
    }

    // Validate email format
    if (!validateEmail(userInfo.email)) {
      setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
      return;
    }

    // Validate password length
    if (userInfo.password.length < 6) {
      setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password);
      const user = userCredential.user;

      if (user) {
        // Save additional user info to Firestore
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

        // Update profile in Firebase Auth
        if (userInfo.name) {
          await updateProfile(user, {
            displayName: userInfo.name,
            photoURL: userInfo.avatar || null
          });
        }

        // Login the user
        dispatch(LogIn({
          userData: user,
          isLoggedIn: true
        }));

        // Navigate based on role and previous location
        const fromDonations = location.state?.from === 'donations';
        if (userInfo.role === "admin") {
          navigate('/admin-dashboard');
        } else if (fromDonations) {
          navigate('/donations');
        } else {
          navigate('/user-homepage');
        }
      }
    } catch (error) {
      setError(error);
    }
  }

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
              className="form-role-selection"
            >
              <label className="role-label">Register as:</label>
              <div className="role-options">
                <label className={`role-option ${userInfo.role === 'user' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={userInfo.role === 'user'}
                    onChange={handleChange}
                  />
                  <span>User</span>
                </label>
                <label className={`role-option ${userInfo.role === 'admin' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={userInfo.role === 'admin'}
                    onChange={handleChange}
                  />
                  <span>Admin</span>
                </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </motion.form>
          <motion.p
            className='login-text'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Already have an account?
            <Link to="/user-login" style={{ ...styledLink, color: '#0062ff' }}>Login</Link>
          </motion.p>
        </motion.div>
      </motion.div>
      <Footer />
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
    </div>
  )
}

export default Signup