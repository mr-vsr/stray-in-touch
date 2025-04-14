import React, { useState, useEffect } from 'react'; // Added useEffect
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // Added signOut explicitly
import { auth, db } from "../../auth/firebase-config";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Login } from "../../store/authSlice"; // Assuming Login is the correct action name
import { motion } from 'framer-motion';
import ErrorDialog from '../ErrorDialog';
import { collection, query, where, getDocs } from "firebase/firestore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Update state declarations
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData.email, formData.password]); // Updated dependencies

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const currentFormErrors = validateForm();
    if (Object.keys(currentFormErrors).length > 0) {
      setError({
        code: 'validation-error',
        message: 'Please fix the errors in the form.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Verify if the logged-in user exists in the 'AdminInfo' collection
      const adminRef = collection(db, 'AdminInfo');
      // Query based on the UID of the successfully authenticated user
      const q = query(adminRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      // 3. Check if the query returned any documents
      if (querySnapshot.empty) {
        // User authenticated BUT is NOT listed as an admin
        setError({ 
          code: 'auth/unauthorized-admin', // Custom code for clarity
          message: 'Access Denied. This login is for administrators only. Please use the correct login page or contact support.' 
        });
        // IMPORTANT: Sign the user out as they aren't authorized here
        await signOut(auth); 
        setIsLoading(false); // Ensure loading stops
        return; // Stop execution
      }

      // 4. User is authenticated AND is an admin - proceed
      
      // Optional: Get admin data from Firestore if needed in Redux state
      // const adminData = querySnapshot.docs[0].data(); 

      dispatch(Login({
        // Pass necessary user details, ensure consistency with signup payload
        userData: { 
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName, // Get from auth profile if updated
          photoURL: user.photoURL,     // Get from auth profile if updated
          role: 'admin' // Set role explicitly
          // Or: ...adminData // If you fetched admin details
        },
        isLoggedIn: true
      }));

      // 5. Navigate to the dashboard
      navigate("/admin-dashboard");
      // If redirection fails here, check ProtectedRoute and Redux state update timing

    } catch (error) {
      console.error('Admin Login Error:', error); // Log the full error
      let errorMessage;
      // Map Firebase error codes to user-friendly messages
      switch (error?.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // Newer SDK versions might use this
          errorMessage = 'Incorrect email or password. Please check your credentials.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check the email or sign up.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please try again later or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
       // Keep the custom unauthorized message if needed, though the check above handles it
        case 'auth/unauthorized-admin': 
             errorMessage = error.message; 
             break;
        default:
          errorMessage = 'An error occurred during login. Please try again.';
      }
      setError({ 
        code: error?.code || 'auth/unknown',
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
      <div className="auth-card">
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">Access the administrator dashboard</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-input ${touched.email && formErrors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {touched.email && formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className={`form-input ${touched.password && formErrors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {touched.password && formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          {/* Fix the error display */}
          {error && <div className="error-message">{error.message}</div>}

          {/* Remove the inline error message since we're using ErrorDialog */}
          
          <motion.button
            type="submit"
            className="auth-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="auth-link-text">
          Need an admin account?{' '}
          <Link to="/admin-register" className="auth-link">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;