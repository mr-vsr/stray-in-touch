import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { styledLink } from '../../assets';
import { collection, addDoc } from "firebase/firestore";
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice";
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function NgoSignup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [ngoInfo, setNgoInfo] = useState({
    name: "",
    address: "",
    contact: "",
    email: "",
    website: "",
    password: ""
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNgoInfo({ ...ngoInfo, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const removeImage = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    // Check required fields
    const requiredFields = ["name", "address", "contact", "email", "password"];
    const missingFields = requiredFields.filter(field => !ngoInfo[field]);

    if (missingFields.length > 0) {
      setError({ code: 'auth/missing-credentials', message: 'Please fill all required fields' });
      return false;
    }

    // Validate email
    if (!validateEmail(ngoInfo.email)) {
      setError({ code: 'auth/invalid-email-format', message: 'Please enter a valid email address' });
      return false;
    }

    // Validate password length
    if (ngoInfo.password.length < 6) {
      setError({ code: 'auth/weak-password', message: 'Password should be at least 6 characters' });
      return false;
    }

    return true;
  };

  const uploadBanner = async () => {
    if (!bannerFile) return null;

    const storage = getStorage();
    const fileRef = ref(storage, `ngo-banners/${ngoInfo.name}-${Date.now()}`);

    await uploadBytes(fileRef, bannerFile);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  };

  const signup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload banner image if provided
      const bannerUrl = await uploadBanner();

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, ngoInfo.email, ngoInfo.password);
      const user = userCredential.user;

      // Save NGO data to Firestore
      await addDoc(collection(db, "NgoInfo"), {
        uid: user.uid,
        name: ngoInfo.name,
        address: ngoInfo.address,
        contact: ngoInfo.contact,
        email: ngoInfo.email.toLowerCase(),
        website: ngoInfo.website || null,
        bannerUrl: bannerUrl,
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
          NGO Registration
        </motion.h2>
        <motion.form
          onSubmit={signup}
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
              className='username'
              placeholder='NGO Name *'
              onChange={handleChange}
              value={ngoInfo.name}
              required
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <textarea
              name="address"
              className='address-textarea'
              placeholder='NGO Address *'
              onChange={handleChange}
              value={ngoInfo.address}
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
            <input
              type='url'
              name="website"
              className='email'
              placeholder='Website URL (optional)'
              onChange={handleChange}
              value={ngoInfo.website}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="image-upload-container"
          >
            <label className="image-upload-label">NGO Banner Image (optional)</label>
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
              {bannerPreview ? 'Change Image' : 'Click to upload banner image'}
            </div>
            {bannerPreview && (
              <div className="image-preview-container">
                <img src={bannerPreview} alt="Banner Preview" />
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
          Already have an account? <Link to="/ngo-login" style={styledLink}>Login</Link>
        </motion.p>
      </motion.div>
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
    </motion.div>
  );
}

export default NgoSignup;