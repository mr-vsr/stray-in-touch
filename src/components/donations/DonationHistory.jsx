import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from '../index';

const DonationHistory = ({ donations, loading }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Date not available';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loader type="default" size="medium" text="Loading donations..." />;
    }

    return (
        <section className="donations-history-section">
            {donations.length > 0 ? (
                <div className="donations-grid">
                    {donations.map(donation => (
                        <motion.div
                            key={donation.id}
                            className="donation-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="donation-header">
                                <h3 className="donation-amount">₹{donation.amount}</h3>
                                <span className={`donation-status ${donation.status}`}>
                                    {donation.status}
                                </span>
                            </div>
                            <div className="donation-content">
                                <div className="donation-meta">
                                    <span className="donation-date">
                                        <i className="fas fa-calendar-alt"></i>
                                        {formatDate(donation.timestamp)}
                                    </span>
                                    <span className="donation-method">
                                        <i className="fas fa-credit-card"></i>
                                        {donation.paymentMethod.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="no-donations-message">
                    <i className="fas fa-info-circle"></i>
                    <p>You haven't made any donations yet.</p>
                </div>
            )}
        </section>
    );
};

export default DonationHistory;