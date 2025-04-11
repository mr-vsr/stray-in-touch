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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [ngoInfo, setNgoInfo] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    banner: "",
    password: ""
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signup = async (e) => {
    e.preventDefault();

    if (!ngoInfo.name || !ngoInfo.contact || !ngoInfo.email || !ngoInfo.password || !ngoInfo.address) {
      setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
      return;
    }

    if (!validateEmail(ngoInfo.email)) {
      setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
      return;
    }

    if (ngoInfo.password.length < 6) {
      setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, ngoInfo.email, ngoInfo.password);
      const user = userCredential.user;

      // Update user profile with name and photo URL
      await updateProfile(user, {
        displayName: ngoInfo.name,
        photoURL: ngoInfo.banner
      });

      // Save NGO data to Firestore
      await addDoc(collection(db, "NgoInfo"), {
        uid: user.uid,
        name: ngoInfo.name,
        contact: ngoInfo.contact,
        email: ngoInfo.email.toLowerCase(),
        address: ngoInfo.address,
        banner: ngoInfo.banner,
        createdAt: new Date()
      });

      // Login the user
      dispatch(Login({
        userData: user,
        isLoggedIn: true
      }));

      // Navigate to NGO homepage
      navigate("/ngo-homepage");
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
            NGO Signup
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
                placeholder='NGO Name *'
                onChange={handleChange}
                value={ngoInfo.name}
                required
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <input
                type='tel'
                name="contact"
                className='contact'
                placeholder='Contact Number *'
                onChange={handleChange}
                value={ngoInfo.contact}
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
                value={ngoInfo.email}
                required
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <textarea
                name="address"
                className='address-textarea'
                placeholder='NGO Address *'
                onChange={handleChange}
                value={ngoInfo.address}
                required
                rows="4"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              <ImageUpload
                label="Banner Image (optional)"
                onImageUpload={handleImageUpload}
                previewUrl={ngoInfo.banner}
                onRemoveImage={handleRemoveImage}
                disabled={isSubmitting}
              />
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
                value={ngoInfo.password}
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
              {isSubmitting ? 'Registering...' : 'Register NGO'}
            </motion.button>
          </motion.form>
          <motion.p
            className='login-text'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
          >
            Already have an account?
            <Link to="/ngo-login" style={{ ...styledLink, color: '#0062ff' }}>Login</Link>
          </motion.p>
        </motion.div>
        {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
      </motion.div>
    </div>
  );
}

export default NgoSignup;