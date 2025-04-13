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
        <section className="what-we-do-section" id="services">
            <div className="what-we-do-container">
                <motion.div
                    className="what-we-do-content"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="what-we-do-text">
                        <motion.h3
                            className="section-title"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Our Services
                        </motion.h3>
                        
                        <motion.h2
                            className="what-we-do-heading"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            What We Do
                        </motion.h2>

                        <motion.p
                            className="what-we-do-description"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            We have partnered with NGOs across various localities to provide comprehensive care for stray animals
                        </motion.p>
                    </div>

                    <div className="services-grid">
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
                                    <img src={service.icon} alt={service.title} />
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="what-we-do-image-wrapper"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <img src={WhatWeDo} alt="Our services illustration" className="what-we-do-image" />
                        <div className="image-background-element"></div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

export default Whatwedo;