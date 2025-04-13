import React from 'react';
import { Dog, DogBG } from "../../assets/index"
import { motion } from 'framer-motion';

function KnowAboutUs() {
    return (
        <section className='know-about-us-section' id='about'>
            <div className='know-about-us-container'>
                <motion.div
                    className='know-about-us-content'
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className='know-about-us-text'>
                        <motion.h3
                            className='section-title'
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Know About Us
                        </motion.h3>
                        
                        <motion.h2
                            className='know-about-us-heading'
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Connecting Strays with Care
                        </motion.h2>

                        <motion.div
                            className='know-about-us-description'
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <p>
                                At StrayInTouch, we bridge the gap between compassionate individuals and NGOs dedicated to helping injured street animals. Our mission is to ensure no injured animal goes without care.
                            </p>
                            <p>
                                Through our user-friendly platform, we enable quick connections between people who encounter injured animals and the nearest NGOs equipped to provide immediate assistance.
                            </p>
                        </motion.div>

                        <motion.div
                            className='know-about-us-stats'
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <div className='stat-item'>
                                <h3>500+</h3>
                                <p>Animals Helped</p>
                            </div>
                            <div className='stat-item'>
                                <h3>50+</h3>
                                <p>NGO Partners</p>
                            </div>
                            <div className='stat-item'>
                                <h3>24/7</h3>
                                <p>Support</p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        className='know-about-us-image-wrapper'
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <img className='know-about-us-image' src={Dog} alt='Helping stray animals' />
                        <img src={DogBG} alt="" className="know-about-us-bg" aria-hidden="true" />
                        <div className='image-background-element'></div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

export default KnowAboutUs;