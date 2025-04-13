import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '@firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Logout } from '../../store/authSlice';
import { auth } from '../../auth/firebase-config';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa'; // Added FaUserCircle for icon

function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    // Use displayName from userData in Redux state
    if (isLoggedIn && userData?.displayName) {
      setUserName(userData.displayName);
    } else if (isLoggedIn && auth.currentUser?.displayName){
      // Fallback to directly checking auth object if Redux state might be slow
      setUserName(auth.currentUser.displayName);
    }
     else {
      setUserName(''); // Clear name if not logged in or no name available
    }
  }, [userData, isLoggedIn]); // Depend on both isLoggedIn and userData

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch(Logout());
      setIsMenuOpen(false); // Close mobile menu on logout
      navigate('/'); // Navigate to home on logout
    } catch (error) {
      console.log("Error in signing out : ", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when a link is clicked (useful for mobile)
  const handleLinkClick = () => {
      if(isMenuOpen) {
          setIsMenuOpen(false);
      }
  };


  return (
    <motion.header
        className="header"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <div className="header-content container-max-width">
        <motion.div className="header-logo" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Link to="/" className="header-logo-link" onClick={handleLinkClick}>
            <h2 className="header-logo-name">StrayInTouch</h2>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button className="header-mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links & Action Buttons Wrapper (for desktop and mobile) */}
        <div className={`header-nav-actions-wrapper ${isMenuOpen ? 'active' : ''}`}>
            <nav className="header-nav-links">
              <ul>
                <motion.li className="header-nav-item" style={{ '--item-index': 1 }}>
                  <Link to="/" className="header-nav-link" onClick={handleLinkClick}>Home</Link>
                </motion.li>
                <motion.li className="header-nav-item" style={{ '--item-index': 2 }}>
                  <Link to="/about" className="header-nav-link" onClick={handleLinkClick}>About</Link>
                </motion.li>
                {isLoggedIn && (
                  <>
                    <motion.li className="header-nav-item" style={{ '--item-index': 3 }}>
                      <Link to="/user-homepage" className="header-nav-link" onClick={handleLinkClick}>User Home</Link>
                    </motion.li>
                    <motion.li className="header-nav-item" style={{ '--item-index': 4 }}>
                      <Link to="/ngo-homepage" className="header-nav-link" onClick={handleLinkClick}>NGO Home</Link>
                    </motion.li>
                    <motion.li className="header-nav-item" style={{ '--item-index': 5 }}>
                      <Link to="/admin-dashboard" className="header-nav-link" onClick={handleLinkClick}>Admin</Link>
                    </motion.li>
                  </>
                )}
                 <motion.li className="header-nav-item donate-mobile" style={{ '--item-index': 6 }}>
                    <Link to="/donations" className="header-nav-link" onClick={handleLinkClick}>Donate</Link>
                 </motion.li>
              </ul>
            </nav>

            <div className="header-action-buttons">
              {isLoggedIn ? (
                <>
                  {/* Display User Name */}
                  <div className="header-user-info" title={userName}>
                      <FaUserCircle className="user-icon" aria-hidden="true"/>
                      <span className="header-user-name">{userName || 'User'}</span>
                  </div>
                  <motion.button
                    className="header-login-button logout"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <Link to="/type-of-login" onClick={handleLinkClick}>
                  <motion.button
                    className="header-login-button login"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
              )}

              <Link to="/donations" className="donate-desktop" onClick={handleLinkClick}>
                <motion.button
                  className="header-donate-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Donate
                </motion.button>
              </Link>
            </div>
        </div>


      </div>
    </motion.header>
  );
}

export default Header;