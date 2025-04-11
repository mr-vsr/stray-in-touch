import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ 
    type = 'default', // default, button, inline, overlay
    size = 'medium', // small, medium, large
    text,
    fullscreen = false,
    transparent = false
}) => {
    const getLoaderClass = () => {
        const classes = ['loader-container'];
        if (fullscreen) classes.push('fullscreen');
        if (transparent) classes.push('transparent');
        if (type) classes.push(`type-${type}`);
        if (size) classes.push(`size-${size}`);
        return classes.join(' ');
    };

    return (
        <div className={getLoaderClass()}>
            <motion.div
                className="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="spinner"></div>
                {text && <p className="loader-text">{text}</p>}
            </motion.div>
        </div>
    );
};

export default Loader; 