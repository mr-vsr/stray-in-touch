import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { db } from '../../auth/firebase-config';
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { Loader } from '../../components'; // Assuming Loader is exported

const PaymentDialog = React.lazy(() => import('../../components/PaymentDialog'));

function Donations() {
    const navigate = useNavigate();
    // Ensure 'user' here contains the data structure you expect (including 'contact')
    const user = useSelector((state) => state.auth.userData);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                name: user.displayName || user.name || '', // Fallback to name if displayName missing
                email: user.email || '',
                // *** FIX: Use user.contact instead of user.phoneNumber ***
                phone: user.contact || ''
            }));
        } else {
            setIsLoggedIn(false);
             // Clear fields if user logs out
             setDonationData(prev => ({
                ...prev,
                name: '',
                email: '',
                phone: ''
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
        if (isFormInvalid || isSubmitting) return;

        setIsSubmitting(true);
        setPaymentStatus('processing');
        setShowPaymentDialog(true);

        try {
            // Use donationData directly as it holds the latest state
            const dataToSave = {
                name: donationData.name,
                email: donationData.email,
                phone: donationData.phone,
                address: donationData.address,
                amount: parseFloat(donationData.amount) || 0,
                paymentMethod: donationData.paymentMethod,
                userId: user?.uid || 'anonymous',
                timestamp: Timestamp.now(),
                status: 'pending'
            };

            const donationRef = await addDoc(collection(db, "donations"), dataToSave);

            if (donationRef.id) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate payment

                setPaymentStatus('success');
                await updateDoc(doc(db, "donations", donationRef.id), {
                    status: 'success',
                    paymentId: `sim_${donationRef.id}`
                });

            } else {
                 throw new Error("Failed to create donation record.");
            }
        } catch (error) {
            console.error("Error processing donation: ", error);
            setPaymentStatus('failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormInvalid =
        !donationData.name ||
        !donationData.email ||
        !donationData.phone ||
        !donationData.address ||
        !donationData.amount ||
        parseFloat(donationData.amount) <= 0;


    return (
        <motion.div
            className="donations-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="donations-content">
                <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
                    Make a Donation
                </motion.h1>

                <motion.form className="donations-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            className="form-input"
                            type="text"
                            name="name"
                            value={donationData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoggedIn}
                            placeholder="Enter your name"
                            aria-label="Donor Name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={donationData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoggedIn}
                            placeholder="Enter your email"
                            aria-label="Donor Email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            className="form-input"
                            type="tel"
                            name="phone"
                            value={donationData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
                            aria-label="Donor Phone Number"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-textarea"
                            name="address"
                            value={donationData.address}
                            onChange={handleChange}
                            required
                            placeholder="Enter your complete address"
                            aria-label="Donor Address"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount (₹)</label>
                        <input
                            className="form-input"
                            type="number"
                            name="amount"
                            value={donationData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="Enter donation amount"
                            aria-label="Donation Amount in Rupees"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <select
                            className="form-select"
                            name="paymentMethod"
                            value={donationData.paymentMethod}
                            onChange={handleChange}
                            required
                            aria-label="Select Payment Method"
                        >
                            <option value="upi">UPI</option>
                            <option value="card">Card (Not Implemented)</option>
                        </select>
                    </div>

                    {donationData.paymentMethod === 'upi' && (
                        <div className="upi-qr-container">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${donationData.upiId}&qzone=1`}
                                alt="UPI QR Code"
                                width="180"
                                height="180"
                            />
                            <p>Scan this QR code to pay using UPI</p>
                            <p>UPI ID: <strong>{donationData.upiId}</strong></p>
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        className="donate-button"
                        whileHover={{ scale: (isFormInvalid || isSubmitting) ? 1 : 1.05 }}
                        whileTap={{ scale: (isFormInvalid || isSubmitting) ? 1 : 0.95 }}
                        disabled={isFormInvalid || isSubmitting}
                        aria-disabled={isFormInvalid || isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                    </motion.button>
                </motion.form>
            </div>

            <Suspense fallback={<Loader type="inline" text="Loading Payment Status..." />}>
                {showPaymentDialog && (
                     <PaymentDialog
                         status={paymentStatus}
                         onClose={() => {
                             setShowPaymentDialog(false);
                             if (paymentStatus === 'success') {
                                 setDonationData({ // Reset form after successful donation
                                     name: isLoggedIn ? user.displayName || user.name || '' : '',
                                     email: isLoggedIn ? user.email || '' : '',
                                     phone: isLoggedIn ? user.contact || '' : '',
                                     address: '',
                                     amount: '',
                                     paymentMethod: 'upi',
                                     upiId: 'strayintouch@upi'
                                 });
                                 navigate('/');
                             }
                             setPaymentStatus(null);
                         }}
                     />
                )}
             </Suspense>
        </motion.div>
    );
}

export default Donations;