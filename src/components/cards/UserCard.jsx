import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { motion } from 'framer-motion';
import { db } from '../../auth/firebase-config';

export default function UserCard() {
    const [strays, setStrays] = useState([]);
    const [selected, setSelected] = useState(null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchStrays = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "strayInfo"));
                const strayData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setStrays(strayData);
            } catch (error) {
                console.error("Error fetching strays: ", error);
            }
        };

        fetchStrays();
    }, []);

    const handleHelpClick = (stray) => {
        setSelected(stray);
        setName('');
        setMessage('');
    };

    const handleCloseDialog = () => {
        setSelected(null);
    };

    const handleConnect = async () => {
        if (!name || !message) {
            alert("Please fill in all fields");
            return;
        }

        setConnecting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setConnecting(false);
            setSelected(null);
            setSuccessMessage(`Your message has been sent to ${selected.informantName}. They will contact you soon.`);
        } catch (error) {
            console.error("Error connecting: ", error);
            setConnecting(false);
        }
    };

    return (
        <div className="updated-page-container">
            <div className="ngo-homepage-container">
                <motion.div
                    className="ngo-homepage-content updated-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="ngo-page-cards-container">
                        <div className="ngo-page-cards-heading-container">
                            <div className="ngo-page-cards-heading-line"></div>
                            <motion.h1
                                className="ngo-page-cards-heading-one updated-heading"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Stray Animals
                            </motion.h1>
                            <motion.h2
                                className="ngo-page-cards-heading-two updated-subheading"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Waiting For Help
                            </motion.h2>
                            <div className="ngo-page-cards-heading-line"></div>
                        </div>

                        <div className="ngo-page-card-container">
                            {strays.map((stray, index) => (
                                <motion.div
                                    key={index}
                                    className="card updated-card"
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.4 }}
                                >
                                    <img src={stray.imageUrl} alt={stray.location} />
                                    <div className="overlay">
                                        <div className="ngo-page-card-text updated-text">
                                            <h2 className="updated-subheading">{stray.description}</h2>
                                            <p className="ngo-page-card-location updated-accent-text">
                                                <i className="fas fa-map-marker-alt"></i> {stray.location}
                                            </p>
                                            <button
                                                className="ngo-page-card-help-button updated-button"
                                                onClick={() => handleHelpClick(stray)}
                                            >
                                                Connect Now
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {selected && (
                <div className="dialog">
                    <div className="dialog-content updated-section">
                        <div className="dialog-close-btn-container">
                            <span className="close" onClick={handleCloseDialog}>&times;</span>
                        </div>
                        <h2 className="updated-heading">Connect with {selected.informantName}</h2>
                        <input
                            type="text"
                            className="dialog-ngoName"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <textarea
                            className="dialog-description"
                            placeholder="Message for the informant"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                        <motion.button
                            className="dialog-button updated-button"
                            onClick={handleConnect}
                            disabled={connecting}
                            whileTap={{ scale: 0.95 }}
                        >
                            {connecting ? "Connecting..." : "Connect"}
                        </motion.button>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="dialog">
                    <div className="dialog-content updated-section">
                        <div className="dialog-close-btn-container">
                            <span className="close" onClick={() => setSuccessMessage("")}>&times;</span>
                        </div>
                        <h2 className="updated-heading">Success!</h2>
                        <p className="updated-text">{successMessage}</p>
                        <motion.button
                            className="dialog-button updated-button"
                            onClick={() => setSuccessMessage("")}
                            whileTap={{ scale: 0.95 }}
                        >
                            Close
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    );
}