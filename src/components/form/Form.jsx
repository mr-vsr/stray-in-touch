import React from 'react';
import { motion } from 'framer-motion';

function Form({
    data,
    strayInfo,
    pushData,
    uploadImage,
    isUploading,
    isSubmitting,
    uploadError
}) {
    return (
        <motion.form
            className='hero-section-form'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={pushData}
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
                    placeholder='Location Description (Give a landmark or street name as well)'
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
                    rows={4}
                />
            </motion.div>

            <motion.div
                className='form-group image-upload-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(e.target.files)}
                    className="image-upload-input"
                    disabled={isUploading || isSubmitting}
                    aria-label="Upload an image of the stray animal"
                />
                {isUploading && (
                    <div className="upload-loading">
                        Uploading image... Please wait.
                    </div>
                )}
                {strayInfo.imageUrl && !isUploading && (
                    <div className="image-preview">
                        <img src={strayInfo.imageUrl} alt="Preview of uploaded stray animal" />
                    </div>
                )}
            </motion.div>

            {uploadError && (
                <div className="upload-error error-message">
                    {uploadError}
                </div>
            )}

            <motion.button
                type='submit'
                className='updated-button'
                disabled={isUploading || isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isSubmitting ? 'Submitting...' : 'Report'}
            </motion.button>
        </motion.form>
    )
}

export default Form