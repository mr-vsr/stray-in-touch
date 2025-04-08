import React, { useState } from 'react'
import { HeroImage, Hero1, Hero2, Hero3 } from "../../assets/index";
import { motion } from 'framer-motion';
import Form from '../form/Form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../auth/firebase-config';
import { useDispatch } from 'react-redux';
import { setSuccess } from '../../store/slices/formSlice';
import { Link } from 'react-router-dom';

function HeroSection() {
  const [strayInfo, setStrayInfo] = useState({
    informant: '',
    contact: '',
    location: '',
    description: '',
    image: null
  });

  const dispatch = useDispatch();

  const data = (e) => {
    const { name, value } = e.target;
    setStrayInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const pushData = async (e) => {
    e.preventDefault();
    if (!strayInfo.informant || !strayInfo.contact || !strayInfo.location || !strayInfo.description) {
      alert('Please fill all the fields');
      return;
    }

    try {
      await addDoc(collection(db, 'strayInfo'), {
        ...strayInfo,
        timestamp: new Date()
      });

      setStrayInfo({
        informant: '',
        contact: '',
        location: '',
        description: '',
        image: null
      });

      dispatch(setSuccess(true));
    } catch (error) {
      console.error('Error adding document: ', error);
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
            Report stray animals in need to help them find a better home
          </motion.h1>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.75 }}
            className="hero-section-image-container"
          >
            <img
              src={HeroImage}
              alt="stray animal"
              className="hero-section-image"
            />
          </motion.div>
        </div>
      </motion.div>
      <div className='hero-section-form-container updated-section'>
        <Form
          data={data}
          strayInfo={strayInfo}
          pushData={pushData}
        />
      </div>
    </div>
  )
}

export default HeroSection