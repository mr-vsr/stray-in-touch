import React, { useState, useEffect } from 'react';
import { Cards } from "../index";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../auth/firebase-config";
import { motion } from 'framer-motion';

function Savetheday() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "strayInfo"));
                const fetchedData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setData(fetchedData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        }
        fetchData();
    }, []);

    // console.log(data);

    return (
        <motion.div
            className='ngo-page-cards-container updated-section'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className='ngo-page-cards-heading-container'>
                <hr className='ngo-page-cards-heading-line' />
                <motion.h2
                    className='ngo-page-cards-heading-one updated-heading'
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Save the Stray
                </motion.h2>
                <motion.h2
                    className='ngo-page-cards-heading-two updated-subheading'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Save the Day
                </motion.h2>
            </div>
            <motion.div
                className='ngo-page-card-container'
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Cards data={data} />
            </motion.div>
        </motion.div>
    )
}

export default Savetheday;
