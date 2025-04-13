import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader } from '../../components';
import { Vikas, Akshat, Ankit, Sahil } from '../../assets';

const teamMembers = [
    {
        name: 'Vikas Rai',
        role: 'Full-stack Developer & Data Engineer',
        image: Vikas,
        description: 'Specialize in building scalable web apps, designing system architecture, data models, and developing robust backend APIs. I enjoy creating seamless, efficient, and user-friendly digital experiences.',
    },
    {
        name: 'Akshat Mishra',
        role: 'Front-end Developer',
        image: Akshat,
        description: 'Took charge of front-end development, made the website fully responsive, added engaging animations for a better user experience, and optimized loading speed through lazy loading.',
    },
    {
        name: 'Ankit Kumar',
        role: 'UI/UX Designer',
        image: Ankit,
        description: 'Creative mind with a passion for intuitive design and seamless user experiences.Dedicated to crafting engaging, user- centered digital solutions that make a meaningful impact.',
    },
    {
        name: 'Sahil Sudan',
        role: 'Front-end Developer',
        image: Sahil,
        description: 'Helped in designing the website, made it more engaging and interactive, and added animations to make it more appealing.',
    },
];

const About = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loader type="fullscreen" text="Loading About Page..." />;
    }

    return (
        <div className="about-page">
            <motion.section 
                className="about-hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="about-hero-content">
                    <motion.h1 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="about-hero-title"
                    >
                        About StrayInTouch
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="about-hero-description"
                    >
                        Connecting compassionate hearts with stray animals in need. Our mission is to create a seamless bridge between people who want to help and the animals who need care.
                    </motion.p>
                </div>
            </motion.section>

            <motion.section 
                className="about-mission-section"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <div className="about-mission-content">
                    <h2 className="section-title">Our Mission</h2>
                    <p className="section-description">
                        We strive to create a world where no stray animal goes without care. Through technology and community engagement, we're making animal welfare more accessible and efficient.
                    </p>
                </div>
            </motion.section>

            <section className="team-section">
                <motion.h2 
                    className="section-title text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Meet Our Team
                </motion.h2>
                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={member.name}
                            className="team-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            whileHover={{ 
                                y: -10,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <motion.div 
                                className="team-card-image"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img src={member.image} alt={member.name} />
                            </motion.div>
                            <motion.div 
                                className="team-card-content"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.3 }}
                            >
                                <h3>{member.name}</h3>
                                <h4>{member.role}</h4>
                                <p>{member.description}</p>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;