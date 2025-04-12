// src/components/header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { logoLinkStyle} from "../../assets/index";
import { signOut } from '@firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Logout } from '../../store/authSlice';
import { auth } from '../../auth/firebase-config';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userData?.displayName) {
      setUserName(userData.displayName);
    }
  }, [userData]);

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch(Logout());
      setIsMenuOpen(false);
    } catch (error) {
      console.log("Error in signing out : ", error);
    }
  }

  const logoGradientStyle = {
    background: 'linear-gradient(135deg, #0062ff, #da61ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textDecoration: 'none', 
    fontWeight: 'bold'
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.div
      className='navbar-container updated-section'
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='navbar-content'>
        <motion.div
          className='logo-container'
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className='logo-name-container'>
            <Link to="/" style={{ ...logoLinkStyle, background: 'linear-gradient(135deg, #0062ff, #da61ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StrayInTouch
            </Link>
          </h2>
        </motion.div>

        <div className='mobile-menu-button' onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`navbar-buttons-container ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <motion.li
              className='navbar-button'
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" style={logoGradientStyle}>Home</Link>
            </motion.li>
            <motion.li
              className='navbar-button'
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/about" style={logoGradientStyle}>About</Link>
            </motion.li>
            {isLoggedIn && (
              <>
                <motion.li
                  className='navbar-button'
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/user-homepage" style={logoGradientStyle}>User Home</Link>
                </motion.li>
                <motion.li
                  className='navbar-button'
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/ngo-homepage" style={logoGradientStyle}>NGO Home</Link>
                </motion.li>
                <motion.li
                  className='navbar-button'
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/admin-dashboard" style={logoGradientStyle}>Admin</Link>
                </motion.li>
              </>
            )}
          </ul>
        </div>

        <div className={`button-container-navbar ${isMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              <span className="user-name">{userName}</span>
              <motion.button
                className='navbar-logout-button updated-button'
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/type-of-login" className="updated-button" style={{ textDecoration: 'none' }}>Login</Link>
            </motion.div>
          )}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/donations" className="navbar-donate-button updated-button" style={{ textDecoration: 'none' }}>
              Donate
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Header