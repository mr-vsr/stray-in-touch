import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../auth/firebase-config';
import { addDoc, collection } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

function Footer() {
  const [footerEmail, setFooterEmail] = useState("");

  const pushEmail = async (event) => {
    try {
      if (!footerEmail) {
        alert("Can't send empty email");
      } else {
        const subscriber = await addDoc(collection(db, "subscribersEmail"), { Email: footerEmail });
        if (subscriber.id) {
          setFooterEmail("");
        }
      }
    } catch (e) {
      console.error("Error adding footer email: ", e);
    }
  }

  return (
    <footer className='footer-container'>
      <div className='footer-content'>
        <div className='footer-mission'>
          <h2 className='footer-mission-title'>Our Mission</h2>
          <p className='footer-mission-text'>
            StrayInTouch is an initiative to bring about a positive change in society — because animals also have the right to live with dignity. Through this small step, we aim to ensure their safety, care, and recognition.
          </p>
        </div>

        <div className='footer-links-container'>
          <div className='footer-links-section'>
            <h3 className='footer-links-title'>Quick Links</h3>
            <ul className='footer-links-list'>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/#what-we-do">What We Do</Link></li>
              <li><Link to="/#team">Team</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
            </ul>
          </div>

          <div className='footer-links-section'>
            <h3 className='footer-links-title'>More</h3>
            <ul className='footer-links-list'>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/donations">Donate</Link></li>
            </ul>
          </div>

          <div className='footer-links-section'>
            <h3 className='footer-links-title'>Connect</h3>
            <ul className='footer-social-links'>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='footer-newsletter'>
          <h3 className='footer-newsletter-title'>Subscribe to get latest updates</h3>
          <div className="footer-newsletter-form">
            <input
              type='email'
              placeholder='Your email address'
              onChange={(e) => setFooterEmail(e.target.value)}
              className='footer-newsletter-input'
              value={footerEmail}
              required
              autoComplete='email'
            />
            <button
              type='submit'
              onClick={pushEmail}
              className='footer-newsletter-button'
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className='footer-bottom'>
        <p className='footer-copyright'>
          © {new Date().getFullYear()} StrayInTouch. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer;