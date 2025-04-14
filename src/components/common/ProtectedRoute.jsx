import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../../auth/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader } from '../index';

function ProtectedRoute({ children, allowedRole }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    let collectionName;
                    let roleToCheck = allowedRole;

                    if (allowedRole === 'admin') {
                        collectionName = 'admins'; // Corrected collection name
                    } else if (allowedRole === 'ngo') {
                        collectionName = 'NgoInfo';
                    } else {
                        collectionName = 'users';
                    }

                    const q = query(
                        collection(db, collectionName),
                        where('uid', '==', user.uid)
                    );

                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        if (userData.role && userData.role === roleToCheck) {
                           setIsAuthorized(true);
                        } else {
                           console.log(`ProtectedRoute: User found but role mismatch. Expected: ${allowedRole}, Found: ${userData.role}`);
                           setIsAuthorized(false);
                        }
                    } else {
                        console.log(`ProtectedRoute: User UID ${user.uid} not found in ${collectionName} collection.`);
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('ProtectedRoute: Error fetching user role:', error);
                    setIsAuthorized(false);
                }
            } else {
                setIsAuthorized(false);
            }
            setCheckedAuth(true);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [allowedRole]);

    if (loading || !checkedAuth) {
        return (
            <div className="page-loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader
                    type="fullscreen"
                    size="large"
                    text="Verifying access..."
                />
            </div>
        );
    }

    if (!isAuthorized) {
        console.log(`ProtectedRoute: Redirecting to /access-denied. isAuthorized: ${isAuthorized}`);
        return <Navigate to="/access-denied" replace />;
    }

    return children;
}

export default ProtectedRoute;