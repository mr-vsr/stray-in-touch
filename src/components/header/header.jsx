// src/components/header/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom'
import { logoLinkStyle} from "../../assets/index";
import { signOut } from '@firebase/auth';
import { useSelector, useDispatch } from 'react-redux';
import { Logout } from '../../store/authSlice';
import { auth } from '../../auth/firebase-config';
import { motion } from 'framer-motion';

function Header() {

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch(Logout());
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


  return (
    <motion.div
      className='navbar-container updated-section'
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '100%', margin: '0 auto', borderRadius: '2px' }}
    >
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
      <div className='navbar-buttons-container' style={{ margin: '0 10px' }}>
        <ul style={{ display: 'flex', gap: '15px' }}>
          <motion.li
            className='navbar-button'
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            style={{ listStyle: 'none' }}
          >
            <Link to="/" style={logoGradientStyle}>Home</Link>
          </motion.li>
          <motion.li
            className='navbar-button'
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            style={{ listStyle: 'none' }}
          >
            <Link to="/about" style={logoGradientStyle}>About</Link>
          </motion.li>
          <motion.li
            className='navbar-button'
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            style={{ listStyle: 'none' }}
          >
            <a href='#what-we-do' style={logoGradientStyle}>What we do</a>
          </motion.li>
          <motion.li
            className='navbar-button'
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            style={{ listStyle: 'none' }}
          >
            <a href='#contact' style={logoGradientStyle}>Contact</a>
          </motion.li>
        </ul>
      </div>
      <div className='button-container-navbar'>
        {isLoggedIn ? (
          <motion.button
            className='navbar-logout-button updated-button'
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
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
          {isLoggedIn ? (
            <Link to="/donations" className="navbar-donate-button updated-button" style={{ textDecoration: 'none' }}>
              Donate
            </Link>
          ) : (
            <Link to="/type-of-login" state={{ from: 'donations' }} className="navbar-donate-button updated-button" style={{ textDecoration: 'none' }}>
              Donate
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Header