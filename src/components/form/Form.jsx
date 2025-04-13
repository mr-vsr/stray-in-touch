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
            className='stray-report-form'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={pushData}
        >
            <motion.h2
                className="stray-report-form-heading"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Report a Stray Animal
            </motion.h2>

            <motion.div
                className='stray-report-form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='text'
                    name="informant"
                    onChange={data}
                    className='stray-report-form-input'
                    placeholder='Your Name'
                    value={strayInfo.informant}
                    required
                />
            </motion.div>

            <motion.div
                className='stray-report-form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='tel'
                    name="contact"
                    onChange={data}
                    className='stray-report-form-input'
                    placeholder='Phone Number'
                    value={strayInfo.contact}
                    required
                />
            </motion.div>

            <motion.div
                className='stray-report-form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type='text'
                    name="location"
                    className='stray-report-form-input'
                    placeholder='Location Description (Give a landmark or street name as well)'
                    onChange={data}
                    value={strayInfo.location}
                    required
                />
            </motion.div>

            <motion.div
                className='stray-report-form-group'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <textarea
                    name="description"
                    onChange={data}
                    className='stray-report-form-textarea'
                    placeholder='Brief Description'
                    value={strayInfo.description}
                    required
                    rows={4}
                />
            </motion.div>

            <motion.div
                className='stray-report-form-group stray-report-image-upload'
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadImage(e.target.files)}
                    className="stray-report-image-input"
                    disabled={isUploading || isSubmitting}
                    aria-label="Upload an image of the stray animal"
                />
                {isUploading && (
                    <div className="stray-report-upload-loading">
                        Uploading image... Please wait.
                    </div>
                )}
                {strayInfo.imageUrl && !isUploading && (
                    <div className="stray-report-image-preview">
                        <img src={strayInfo.imageUrl} alt="Preview of uploaded stray animal" />
                    </div>
                )}
            </motion.div>

            {uploadError && (
                <div className="stray-report-error-message">
                    {uploadError}
                </div>
            )}

            <motion.button
                type="submit"
                className="stray-report-submit-button"
                disabled={isSubmitting || isUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </motion.button>
        </motion.form>
    );
}

export default Form;