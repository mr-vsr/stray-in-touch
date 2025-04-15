import React, { useState, useCallback } from 'react';
import { HeroImage } from "../../assets/index";
import { motion } from 'framer-motion';
import Form from '../form/Form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase-config';
import { useDispatch } from 'react-redux';
import { setSuccess } from '../../store/slices/formSlice';
import SuccessDialog from '../dialogs/SuccessDialog';

const CLOUDINARY_CLOUD_NAME = 'dnjc1ik5l';
const CLOUDINARY_UPLOAD_PRESET = 'stray-in-touch';

const getCurrentLocationPromise = (options = {}) => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        navigator.geolocation.getCurrentPosition(resolve, reject, { ...defaultOptions, ...options });
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
    const [submissionError, setSubmissionError] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [contactError, setContactError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const data = (e) => {
        const { name, value } = e.target;

        if (name === 'contact') {
            const numbersOnly = value.replace(/\D/g, '');
            if (numbersOnly.length <= 10) {
                setStrayInfo(prev => ({
                    ...prev,
                    contact: numbersOnly
                }));
                setContactError(numbersOnly.length > 0 && numbersOnly.length !== 10
                    ? 'Phone number must be exactly 10 digits'
                    : '');
            }
            return;
        }

        setStrayInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const uploadImage = async (files) => {
        const file = files[0];
        if (!file) return;

        setUploadError(null);

        if (!file.type.startsWith('image/')) {
            setUploadError('Please upload an image file (e.g., JPG, PNG, GIF)');
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

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) {
                let errorMsg = `Upload failed with status: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData?.error?.message || errorMsg;
                } catch (_) { }
                throw new Error(errorMsg);
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

    const getCurrentLocation = useCallback(async () => {
        setLocationError(null);
        try {
            const position = await getCurrentLocationPromise();
            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            console.error("Geolocation error:", error);
            const errorMsg = error.code === error.PERMISSION_DENIED
                ? "Location permission denied. Please enable location access in your browser settings."
                : `Could not fetch location: ${error.message}`;
            setLocationError(errorMsg);
            throw new Error(errorMsg);
        }
    }, []);

    const pushData = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        setLocationError(null);

        if (!strayInfo.informant || !strayInfo.contact || !strayInfo.location || !strayInfo.description) {
            setSubmissionError('Please fill all the required text fields.');
            return;
        }

        if (strayInfo.contact.length !== 10) {
            setSubmissionError('Phone number must be exactly 10 digits.');
            setContactError('Phone number must be exactly 10 digits');
            return;
        } else {
             setContactError('');
        }


        if (!strayInfo.imageUrl) {
            setSubmissionError('Please upload an image before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const locationCoords = await getCurrentLocation();

            const dataToSend = {
                informant: strayInfo.informant.trim(),
                contact: strayInfo.contact,
                locationDescription: strayInfo.location.trim(),
                description: strayInfo.description.trim(),
                imageUrl: strayInfo.imageUrl,
                latitude: locationCoords.latitude,
                longitude: locationCoords.longitude,
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
            setContactError('');

            dispatch(setSuccess(true));
            setShowSuccessDialog(true);
            setSubmissionError(null);

        } catch (error) {
            console.error('Submission Error:', error);
            if (!locationError) {
               setSubmissionError(`Submission failed: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessDialog = () => {
        setShowSuccessDialog(false);
         setStrayInfo({
             informant: '',
             contact: '',
             location: '',
             description: '',
             imageUrl: ''
         });
         setContactError('');
         setSubmissionError(null);
         setLocationError(null);
         setUploadError(null);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className="updated-page-container">
            <motion.div
                className="hero-section-container"
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
                        {!imageLoaded && <div className="hero-section-loader">Loading Image...</div>}
                        <img
                            src={HeroImage}
                            alt="stray animal hero banner"
                            className="hero-section-image"
                            style={{ display: imageLoaded ? 'block' : 'none' }}
                            onLoad={handleImageLoad}
                            onError={() => { setImageLoaded(true); }}
                        />
                    </motion.div>
                </div>
            </motion.div>

            <div className='hero-section-form-container'>
                <Form
                    data={data}
                    strayInfo={strayInfo}
                    pushData={pushData}
                    uploadImage={uploadImage}
                    isUploading={isUploading}
                    isSubmitting={isSubmitting}
                    uploadError={uploadError}
                    contactError={contactError}
                />
                 {submissionError && (
                    <div className="stray-report-error-message form-submission-error">
                        {submissionError}
                    </div>
                )}
                {locationError && (
                    <div className="stray-report-error-message form-location-error">
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