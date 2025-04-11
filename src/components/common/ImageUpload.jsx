import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dnjc1ik5l';
const CLOUDINARY_UPLOAD_PRESET = 'stray-in-touch';

function ImageUpload({ onImageUpload, label, previewUrl, onRemoveImage, disabled }) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async (files) => {
        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('File size should be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        setIsUploading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) {
                throw new Error(`Upload failed with status: ${res.status}`);
            }

            const data = await res.json();

            if (data.secure_url) {
                onImageUpload(data.secure_url);
                setError(null);
            } else {
                throw new Error('No secure URL returned from Cloudinary');
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setError(`Error uploading image: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            className="image-upload-container"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <label className="image-upload-label">{label}</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files)}
                className="image-upload-input"
                disabled={isUploading || disabled}
            />
            {isUploading && (
                <div className="upload-loading">
                    Uploading image... Please wait.
                </div>
            )}
            {previewUrl && !isUploading && (
                <div className="image-preview-container">
                    <img src={previewUrl} alt="Preview" />
                    <button
                        type="button"
                        className="remove-image-button"
                        onClick={onRemoveImage}
                    >
                        ×
                    </button>
                </div>
            )}
            {error && (
                <div className="upload-error error-message">
                    {error}
                </div>
            )}
        </motion.div>
    );
}

export default ImageUpload; 