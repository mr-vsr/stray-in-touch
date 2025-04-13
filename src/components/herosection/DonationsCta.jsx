import React from 'react';
import { Link } from 'react-router-dom';
import { Donations as DonationsImage } from "../../assets";
import { motion } from 'framer-motion';

function DonationsCta() {
    return (
        <section className="donations-cta-container">
            <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="donations-cta-background"
            >
                <img
                    src={DonationsImage}
                    alt="Happy dogs waiting to be helped"
                />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="donations-cta-text-content"
            >
                <h2 className="donations-cta-heading">Donate & Save</h2>
                <p className="donations-cta-subheading">Join the community of animal lovers!</p>
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="donations-cta-heading"
                >
                    Make a donation today and{' '}
                    <span>be a hero</span>{' '}
                    for homeless stray animals
                </motion.h2>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="donations-cta-buttons"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="donations-cta-button primary"
                    >
                        Join Our Community
                    </motion.button>

                    <Link to="/donations">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="donations-cta-button secondary"
                        >
                            Donate
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}

export default DonationsCta;