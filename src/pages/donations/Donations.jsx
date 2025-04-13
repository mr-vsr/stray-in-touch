import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { db } from '../../auth/firebase-config';
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { UserLogin } from '../../components';

function Donations() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.userData);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [donationData, setDonationData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        amount: '',
        paymentMethod: 'upi',
        upiId: 'strayintouch@upi'
    });

    useEffect(() => {
        if (user) {
            setIsLoggedIn(true);
            setDonationData(prev => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || '',
                phone: user.phoneNumber || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDonationData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const donationRef = await addDoc(collection(db, "donations"), {
                ...donationData,
                userId: user?.uid || 'anonymous',
                timestamp: new Date(),
                status: 'pending'
            });

            if (donationRef.id) {
                setShowPaymentDialog(true);
                // Simulate payment processing
                setTimeout(() => {
                    setPaymentStatus('success');
                    // Update the donation status in Firebase
                    updateDoc(doc(db, "donations", donationRef.id), {
                        status: 'success'
                    });
                }, 3000);
            }
        } catch (error) {
            console.error("Error adding donation: ", error);
            setPaymentStatus('failed');
        }
    };

    return (
        <motion.div className="donations-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="donations-content">
                <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
                    Make a Donation
                </motion.h1>

                <motion.form className="donations-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={donationData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoggedIn}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={donationData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoggedIn}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={donationData.phone}
                            onChange={handleChange}
                            required
                            disabled={isLoggedIn}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={donationData.address}
                            onChange={handleChange}
                            required
                            placeholder="Enter your complete address"
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={donationData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="Enter donation amount"
                        />
                    </div>

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={donationData.paymentMethod}
                            onChange={handleChange}
                            required
                        >
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                        </select>
                    </div>

                    {donationData.paymentMethod === 'upi' && (
                        <div className="upi-qr-container">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${donationData.upiId}`}
                                alt="UPI QR Code"
                            />
                            <p>Scan this QR code to make payment</p>
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        className="donate-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Proceed to Payment
                    </motion.button>
                </motion.form>
            </div>

            {showPaymentDialog && (
                <div className="payment-dialog">
                    <div className="payment-dialog-content">
                        <h2>Payment Status</h2>
                        {paymentStatus === 'success' ? (
                            <div className="success-message">
                                <i className="fas fa-check-circle"></i>
                                <p>Payment Successful!</p>
                                <p>Thank you for your donation.</p>
                            </div>
                        ) : paymentStatus === 'failed' ? (
                            <div className="error-message">
                                <i className="fas fa-times-circle"></i>
                                <p>Payment Failed</p>
                                <p>Please try again.</p>
                            </div>
                        ) : (
                            <div className="processing-message">
                                <div className="spinner"></div>
                                <p>Processing Payment...</p>
                            </div>
                        )}
                        <button
                            className="dialog-close-button"
                            onClick={() => {
                                setShowPaymentDialog(false);
                                if (paymentStatus === 'success') {
                                    navigate('/');
                                }
                            }}
                        >
                            {paymentStatus === 'success' ? 'Return Home' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default Donations;