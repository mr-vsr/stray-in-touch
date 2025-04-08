import React from 'react';
import { WhatWeDo, Medical, Update, Clock, Therapy } from "../../assets/index";
import { motion } from 'framer-motion';

function Whatwedo() {
    const services = [
        { icon: Clock, title: 'Quick Response', description: 'Immediate attention to reported cases' },
        { icon: Medical, title: 'Medical Attention', description: 'Professional veterinary care' },
        { icon: Update, title: 'Receive Updates', description: 'Regular status updates on rescued animals' },
        { icon: Therapy, title: 'Therapy', description: 'Rehabilitation services for injured strays' }
    ];

    return (
        <section className="what-we-do-container">
            <div className="what-we-do-inner">
                <motion.div
                    className="what-we-do-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2>What We Do</h2>
                    <p>We have partnered with NGOs across various localities to provide comprehensive care for stray animals</p>
                </motion.div>

                <div className="what-we-do-content">
                    {/* Left Column - Service Cards */}
                    <motion.div
                        className="what-we-do-cards"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className="service-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="service-icon">
                                    <img
                                        src={service.icon}
                                        alt={service.title}
                                        className="icon"
                                    />
                                </div>
                                <div className="service-content">
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Right Column - Image */}
                    <motion.div
                        className="what-we-do-image"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <img
                            src={WhatWeDo}
                            alt="What We Do"
                            className="main-image"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Whatwedo;