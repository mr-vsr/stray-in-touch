import React, { useState } from 'react'
import { HeroImage } from "../../assets/index";
import { motion } from 'framer-motion';
import Form from '../form/Form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase-config';
import { useDispatch } from 'react-redux';
import { setSuccess } from '../../store/slices/formSlice';
import SuccessDialog from '../dialogs/SuccessDialog';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dnjc1ik5l';
const CLOUDINARY_UPLOAD_PRESET = 'stray-in-touch';

// Helper function to wrap Geolocation API in a Promise
const getCurrentLocationPromise = (options = {}) => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

const Hero = () => {
    const [strayInfo, setStrayInfo] = useState({
        informant: '',
        contact: '',
        location: '',
        description: '',
        imageUrl: ''
    });

    const dispatch = useDispatch();
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const data = (e) => {
        const { name, value } = e.target;
        setStrayInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uploadImage = async (files) => {
        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setUploadError('File size should be less than 2MB');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        setIsUploading(true);
        setUploadError(null);

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
                setStrayInfo(prev => ({
                    ...prev,
                    imageUrl: data.secure_url
                }));
                setUploadError(null);
            } else {
                throw new Error('No secure URL returned from Cloudinary');
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            setUploadError(`Error uploading image: ${err.message}`);
            setStrayInfo(prev => ({ ...prev, imageUrl: '' }));
        } finally {
            setIsUploading(false);
        }
    };

    // const getCurrentLocation = async () => {
    //     try {
    //         const position = await getCurrentLocationPromise({
    //             enableHighAccuracy: true,
    //             timeout: 8000,
    //             maximumAge: 60000
    //         });
    //         return {
    //             latitude: position.coords.latitude,
    //             longitude: position.coords.longitude
    //         };
    //     } catch (error) {
    //         throw new Error('Could not fetch location: ' + error.message);
    //     }
    // };

    const pushData = async (e) => {
        e.preventDefault();
        setUploadError(null);
        setIsSubmitting(true);

        try {
            // Validate form fields
            if (!strayInfo.informant || !strayInfo.contact || !strayInfo.location || !strayInfo.description) {
                throw new Error('Please fill all the required text fields.');
            }

            if (!strayInfo.imageUrl) {
                throw new Error('Please upload an image before submitting.');
            }

            // Get location
            let locationData = null;
            try {
                locationData = await getCurrentLocation();
            } catch (locationError) {
                console.warn("Location error:", locationError);
                // Continue without location if user denies permission
            }

            const dataToSend = {
                informant: strayInfo.informant,
                contact: strayInfo.contact,
                locationDescription: strayInfo.location,
                description: strayInfo.description,
                imageUrl: strayInfo.imageUrl,
                ...(locationData && { 
                    latitude: locationData.latitude,
                    longitude: locationData.longitude 
                }),
                timestamp: new Date()
            };

            await addDoc(collection(db, 'strayInfo'), dataToSend);
            
            setStrayInfo({
                informant: '',
                contact: '',
                location: '',
                description: '',
                imageUrl: ''
            });

            dispatch(setSuccess(true));
            setShowSuccessDialog(true);
            setUploadError(null);

        } catch (error) {
            console.error('Error:', error);
            setUploadError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessDialog = () => {
        setShowSuccessDialog(false);
        // Reset form state
        setStrayInfo({
            informant: '',
            contact: '',
            location: '',
            description: '',
            imageUrl: ''
        });
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    // Keep only this one getCurrentLocation function and remove the other one
    const getCurrentLocation = async () => {
        try {
            const position = await getCurrentLocationPromise({
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000
            });
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            throw new Error('Could not fetch location: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const location = await getCurrentLocation();
            const formDataWithLocation = {
                ...strayInfo,
                location: location,
                timestamp: new Date().toISOString()
            };
            await pushData(formDataWithLocation);
        } catch (error) {
            setLocationError('Please enable location access to submit the report');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="updated-page-container">
            <motion.div
                className="hero-section-container updated-hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.75 }}
            >
                <div className="hero-section-content">
                    <motion.h1
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.75 }}
                        className="updated-heading"
                    >
                        Refining the world one pet at a time
                    </motion.h1>
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.75 }}
                        className="hero-section-image-container"
                    >
                        {!imageLoaded && <div className="hero-section-loader" />}
                        <img
                            src={HeroImage}
                            alt="stray animal"
                            className="hero-section-image"
                            style={{ opacity: imageLoaded ? 1 : 0 }}
                            onLoad={handleImageLoad}
                        />
                    </motion.div>
                </div>
            </motion.div>
            <div className='hero-section-form-container updated-section'>
                <Form
                    data={data}
                    strayInfo={strayInfo}
                    pushData={pushData}
                    uploadImage={uploadImage}
                    isUploading={isUploading}
                    isSubmitting={isSubmitting}
                    uploadError={uploadError}
                />
                {locationError && (
                    <div className="stray-report-error-message">
                        {locationError}
                    </div>
                )}
            </div>
            {showSuccessDialog && (
                <SuccessDialog onClose={handleCloseSuccessDialog} />
            )}
        </div>
    );
};

export default Hero;