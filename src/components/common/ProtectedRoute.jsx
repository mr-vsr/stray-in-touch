import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth, db } from '../../auth/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function ProtectedRoute({ children, allowedRole }) {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Query the appropriate collection based on the allowed role
                    const collectionName = allowedRole === 'admin' ? 'admins' : 
                                        allowedRole === 'ngo' ? 'NgoInfo' : 'users';
                    
                    const q = query(
                        collection(db, collectionName),
                        where('uid', '==', user.uid)
                    );
                    
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        // For NGO, also check if the role field exists and is set to "ngo"
                        if (allowedRole === 'ngo') {
                            const ngoData = querySnapshot.docs[0].data();
                            if (ngoData.role === 'ngo') {
                                setUserRole(allowedRole);
                            } else {
                                setUserRole(null);
                            }
                        } else {
                            setUserRole(allowedRole);
                        }
                    } else {
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole(null);
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [allowedRole]);

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Verifying access...</p>
            </div>
        );
    }

    if (!userRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;