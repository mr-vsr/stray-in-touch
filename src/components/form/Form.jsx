import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Form({
    data,
    strayInfo,
    pushData,
}) {
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.form
            className='hero-section-form'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h2
                className="updated-subheading"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Report a Stray Animal
            </motion.h2>

            <motion.div
                className='form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='text'
                    name="informant"
                    onChange={data}
                    className='form-input updated-text'
                    placeholder='Your Name'
                    value={strayInfo.informant}
                    required
                />
            </motion.div>

            <motion.div
                className='form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='tel'
                    name="contact"
                    onChange={data}
                    className='form-input updated-text'
                    placeholder='Phone Number'
                    value={strayInfo.contact}
                    required
                />
            </motion.div>

            <motion.div
                className='form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='text'
                    name="location"
                    className='form-input updated-text'
                    placeholder='Location'
                    onChange={data}
                    value={strayInfo.location}
                    required
                />
            </motion.div>

            <motion.div
                className='form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <textarea
                    name="description"
                    onChange={data}
                    className='form-input textarea updated-text'
                    placeholder='Brief Description'
                    value={strayInfo.description}
                    required
                />
            </motion.div>

            <motion.div
                className='form-group image-upload-container'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <label className='image-upload-label'>
                    {imagePreview ? (
                        <div className='image-preview-container'>
                            <img src={imagePreview} alt="Preview" />
                            <span className="updated-accent-text">Change Image</span>
                        </div>
                    ) : (
                        <div className='image-upload-button'>
                            <span className="updated-accent-text">Upload Animal Photo</span>
                        </div>
                    )}
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='image-upload-input'
                    />
                </label>
            </motion.div>

            <motion.button
                type='submit'
                className='updated-button'
                onClick={pushData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Connect
            </motion.button>
        </motion.form>
    )
}

export default Form