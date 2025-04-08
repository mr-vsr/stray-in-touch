import React from 'react';
import { Dog, DogBG } from "../../assets/index"
import { motion } from 'framer-motion';

function KnowAboutUs() {
    return (
        <section className='know-about-us-section' id='about'>
            <div className='know-about-us-container'>
                <motion.div
                    className='know-about-us-left'
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className='know-about-us-line-container'>
                        <hr className='know-about-us-line' />
                    </div>
                    <motion.h2
                        className='know-about-us-heading'
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Know About Us
                    </motion.h2>
                    <motion.div
                        className='know-about-us-description'
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <h3 className='know-about-us-description-heading'>
                            We need help connecting strays to the nearest NGOs
                        </h3>
                        <p>
                            Connecting Compassionate Hearts

                            In StrayInTouch, we believe in the power of community to make a difference.
                            Our platform serves as a bridge between compassionate individuals and NGOs
                            dedicated to helping injured street animals.

                            We're on a mission to create a world where no injured animal is left without care.
                            Through our user-friendly interface, we connect users who encounter injured animals
                            with the nearest NGOs equipped to provide immediate assistance.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.img
                    className='know-about-us-image'
                    src={Dog}
                    alt='Dog'
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                />
                <img className='know-about-us-bg' src={DogBG} alt='Background' />
            </div>
        </section>
    );
}

export default KnowAboutUs;