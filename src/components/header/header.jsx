// src/components/header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { logoLinkStyle} from "../../assets/index";
import { signOut } from '@firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Logout } from '../../store/authSlice';
import { auth } from '../../auth/firebase-config';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const navigate = useNavigate(); 
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
      navigate('/');
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
    <motion.header className="header" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="header-content container-max-width">
        <motion.div className="header-logo" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Link to="/" className="header-logo-link">
            <h2 className="header-logo-name">StrayInTouch</h2>
          </Link>
        </motion.div>

        <nav className="header-nav-links">
          <ul>
            <motion.li className="header-nav-item">
              <Link to="/" className="header-nav-link">Home</Link>
            </motion.li>
            <motion.li className="header-nav-item">
              <Link to="/about" className="header-nav-link">About</Link>
            </motion.li>
            {isLoggedIn && (
              <>
                <motion.li className="header-nav-item">
                  <Link to="/user-homepage" className="header-nav-link">User Home</Link>
                </motion.li>
                <motion.li className="header-nav-item">
                  <Link to="/ngo-homepage" className="header-nav-link">NGO Home</Link>
                </motion.li>
                <motion.li className="header-nav-item">
                  <Link to="/admin-dashboard" className="header-nav-link">Admin</Link>
                </motion.li>
              </>
            )}
          </ul>
        </nav>

        <div className="header-action-buttons">
          {!isLoggedIn ? (
            <Link to="/type-of-login">
              <motion.button className="header-login-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Login
              </motion.button>
            </Link>
          ) : (
            <motion.button className="header-login-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout}>
              Logout
            </motion.button>
          )}
          
          <Link to="/donations">
            <motion.button className="header-donate-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Donate
            </motion.button>
          </Link>
        </div>

        <button className="header-mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </motion.header>
  );
}

export default Header