import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaTimes } from 'react-icons/fa';

function Form({
    data,
    strayInfo,
    pushData,
}) {
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageChange(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
                            <button
                                type="button"
                                className='remove-image-button'
                                onClick={removeImage}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <div
                            className={`image-upload-button ${isDragging ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FaCamera className='image-upload-icon' />
                            <span className='image-upload-text'>Upload Animal Photo</span>
                            <span className='image-upload-hint'>Click or drag & drop to upload</span>
                            <input
                                ref={fileInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handleFileInput}
                                className='image-upload-input'
                            />
                        </div>
                    )}
                </label>
            </motion.div>

            <motion.button
                type='submit'
                className='updated-button'
                onClick={pushData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Report
            </motion.button>
        </motion.form>
    )
}

export default Form