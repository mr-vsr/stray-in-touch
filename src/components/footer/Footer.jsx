import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Logo } from '../../assets';
import { db } from '../../auth/firebase-config';
import { collection, addDoc } from 'firebase/firestore';

function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'subscribersEmail'), {
                email,
                timestamp: new Date()
            });
            setStatus({ type: 'success', message: 'Thank you for subscribing!' });
            setEmail('');
        } catch (error) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        }
        setIsLoading(false);
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-main">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <h3>StrayInTouch</h3>
                        </Link>
                        <p className="footer-description">
                            Connecting compassionate hearts with stray animals in need. Join us in making a difference, one paw at a time.
                        </p>
                        <div className="footer-social">
                            <motion.a href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FaFacebook /></motion.a>
                            <motion.a href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FaTwitter /></motion.a>
                            <motion.a href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FaInstagram /></motion.a>
                            <motion.a href="#" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><FaLinkedin /></motion.a>
                        </div>

                        <div className="footer-newsletter">
                            <h4>Subscribe to Our Newsletter</h4>
                            <p>Stay updated with our latest news and updates</p>
                            <form onSubmit={handleSubscribe}>
                                <div className="newsletter-input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isLoading ? 'Subscribing...' : 'Subscribe'}
                                    </motion.button>
                                </div>
                                {status.message && (
                                    <p className={`newsletter-status ${status.type}`}>
                                        {status.message}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="footer-links">
                        <div className="footer-links-column">
                            <h4>Quick Links</h4>
                            <Link to="/about">About Us</Link>
                            <Link to="/donations">Donate</Link>
                        </div>

                        <div className="footer-links-column">
                            <h4>Support</h4>
                            <Link to="/faq">FAQ</Link>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/help">Help Center</Link>
                        </div>

                        <div className="footer-links-column">
                            <h4>Contact Us</h4>
                            <p>Email: strayintouch@gmail.com</p>
                            <p>Phone: +91 6307567504</p>
                            <p>Address: National Institute of Engineering</p>
                            <p>Mysuru, Karnataka 570008</p>
                        </div>
                    </div>
                </div>

                <motion.div 
                    className="footer-bottom"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <p>&copy; {new Date().getFullYear()} StrayInTouch. All rights reserved.</p>
                </motion.div>
            </div>
        </footer>
    );
}

export default Footer;