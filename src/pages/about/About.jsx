import React from 'react';
import { motion } from 'framer-motion';
import '../../App.css';
import { Vikas, Akshat, Ankit, Sahil } from '../../assets';

const teamMembers = [
    {
        name: 'Vikas Rai',
        role: 'Full-stack Developer Data Engineer',
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
    return (
        <div className="updated-page-container">
            <motion.div
                className="about-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="about-hero"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        About StrayInTouch
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        We are a passionate team dedicated to improving the lives of stray animals through technology and community engagement.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="mission-section"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div
                        className="mission-content"
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>Our Mission</h2>
                        <p>
                            To create a world where every stray animal has access to care, love, and a safe environment through innovative technology solutions and community involvement.
                        </p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="team-section"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        Meet Our Team
                    </motion.h2>
                    <div className="team-grid">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 100, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                            >
                                <motion.div
                                    className="team-member-card"
                                    initial={{ scale: 0.9 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="team-member-image"
                                        initial={{ y: -50, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    >
                                        <img src={member.image} alt={member.name} />
                                    </motion.div>
                                    <motion.div
                                        className="team-member-info"
                                        initial={{ y: 50, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        <h3>{member.name}</h3>
                                        <p className="role">{member.role}</p>
                                        <p className="description">{member.description}</p>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="values-section"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h2
                        initial={{ y: -20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        Our Values
                    </motion.h2>
                    <div className="values-grid">
                        <motion.div
                            className="value-card"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <h3>Compassion</h3>
                            <p>We believe in treating all animals with kindness and respect.</p>
                        </motion.div>
                        <motion.div
                            className="value-card"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <h3>Innovation</h3>
                            <p>We constantly seek new ways to improve animal welfare through technology.</p>
                        </motion.div>
                        <motion.div
                            className="value-card"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <h3>Community</h3>
                            <p>We believe in the power of community to create lasting change.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default About; 