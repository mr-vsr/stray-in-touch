import React from 'react';
import { motion } from 'framer-motion';

export const Spinner = () => (
    <div className="spinner-container">
        <motion.div
            className="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        />
    </div>
);

export const SkeletonCard = ({ height = '200px' }) => (
    <motion.div
        className="skeleton glass-card"
        style={{ height, width: '100%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    />
);

export const SkeletonText = ({ width = '100%', height = '20px' }) => (
    <motion.div
        className="skeleton"
        style={{
            width,
            height,
            borderRadius: '4px',
            marginBottom: '8px'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    />
);

export const PageLoader = () => (
    <motion.div
        className="page-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--gradient-primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}
    >
        <Spinner />
    </motion.div>
);

export const CardSkeleton = () => (
    <div className="glass-card" style={{ padding: '20px' }}>
        <SkeletonText height="24px" width="60%" />
        <SkeletonText height="16px" width="40%" />
        <SkeletonText height="100px" width="100%" />
        <SkeletonText height="16px" width="80%" />
    </div>
);

export const ProfileSkeleton = () => (
    <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <SkeletonText style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
            <div style={{ marginLeft: '20px', flex: 1 }}>
                <SkeletonText width="40%" />
                <SkeletonText width="30%" />
            </div>
        </div>
        <SkeletonText />
        <SkeletonText width="90%" />
        <SkeletonText width="85%" />
    </div>
); 