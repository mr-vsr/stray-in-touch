import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../auth/firebase-config';
import { addDoc, collection } from 'firebase/firestore';

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
      <div className='footer-left-part-container'>
        <div className='footer-logo-container'>
          <h2 className='footer-logo-text'>StrayInTouch</h2>
        </div>
        <div className='footer-buttons-container'>
          <ul className='footer-button-inner-container'>
            <li className='footer-button footer-special-button'>Quick Links</li>
            <li className='footer-button'><Link to="/">Home</Link></li>
            <li className='footer-button'><Link to="/about">About us</Link></li>
            <li className='footer-button'><Link to="/#what-we-do">What We Do</Link></li>
            <li className='footer-button'><Link to="/#team">Team</Link></li>
            <li className='footer-button'><Link to="/#contact">Contact</Link></li>
          </ul>
        </div>
        <div className='footer-buttons-container'>
          <ul className='footer-button-inner-container'>
            <li className='footer-button footer-special-button'>More</li>
            <li className='footer-button'><Link to="/projects">Projects</Link></li>
            <li className='footer-button'><Link to="/events">Events</Link></li>
            <li className='footer-button'><Link to="/donations">Donate</Link></li>
          </ul>
        </div>
        <div className='footer-social-button-container'>
          <ul className='footer-social-buttons-inner-container'>
            <li className='footer-button footer-special-button'>Connect</li>
            <li className='footer-button'>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            </li>
            <li className='footer-button'>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </li>
            <li className='footer-button'>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            </li>
            <li className='footer-button'>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            </li>
          </ul>
        </div>
      </div>
      <div className='footer-email-container'>
        <h1>Subscribe to get latest updates</h1>
        <div className="footer-form">
          <input
            type='email'
            placeholder='Your email address'
            onChange={(e) => setFooterEmail(e.target.value)}
            className='footer-email-input'
            value={footerEmail}
            required
            autoComplete='email'
          />
          <button
            type='submit'
            onClick={pushEmail}
            className='footer-submit-button'
          >
            Subscribe
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer;