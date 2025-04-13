// import React, { useEffect, useState } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { auth, db } from '../../auth/firebase-config';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';

// function ProtectedRoute({ children, allowedRole }) {
//     const [userRole, setUserRole] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const location = useLocation();

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 try {
//                     // Query the appropriate collection based on the allowed role
//                     const collectionName = allowedRole === 'admin' ? 'admins' : 
//                                         allowedRole === 'ngo' ? 'NgoInfo' : 'users';
                    
//                     const q = query(
//                         collection(db, collectionName),
//                         where('uid', '==', user.uid)
//                     );
                    
//                     const querySnapshot = await getDocs(q);
//                     if (!querySnapshot.empty) {
//                         // For NGO, also check if the role field exists and is set to "ngo"
//                         if (allowedRole === 'ngo') {
//                             const ngoData = querySnapshot.docs[0].data();
//                             if (ngoData.role === 'ngo') {
//                                 setUserRole(allowedRole);
//                             } else {
//                                 setUserRole(null);
//                             }
//                         } else {
//                             setUserRole(allowedRole);
//                         }
//                     } else {
//                         setUserRole(null);
//                     }
//                 } catch (error) {
//                     console.error('Error fetching user role:', error);
//                     setUserRole(null);
//                 }
//             } else {
//                 setUserRole(null);
//             }
//             setLoading(false);
//         });

//         return () => unsubscribe();
//     }, [allowedRole]);

//     if (loading) {
//         return (
//             <div className="loading-spinner">
//                 <div className="spinner"></div>
//                 <p>Verifying access...</p>
//             </div>
//         );
//     }

//     if (!userRole) {
//         return <Navigate to="/" replace />;
//     }

//     return children;
// }

// export default ProtectedRoute;


// src/components/common/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom'; // Removed useLocation as it's not used
import { auth, db } from '../../auth/firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader } from '../index'; // Assuming Loader is exported from components/index.js

function ProtectedRoute({ children, allowedRole }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkedAuth, setCheckedAuth] = useState(false); // Ensure auth state is checked

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Define the collection and specific field to check based on role
                    let collectionName;
                    let roleToCheck = allowedRole; // Assume the role is the field value unless specified otherwise

                    if (allowedRole === 'admin') {
                        collectionName = 'AdminInfo'; // Changed from 'admins' to match signup
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
                        // Check if the role field in the document matches the allowedRole
                        const userData = querySnapshot.docs[0].data();
                        if (userData.role && userData.role === roleToCheck) {
                           setIsAuthorized(true);
                        } else {
                           console.log(`User found but role mismatch. Expected: ${allowedRole}, Found: ${userData.role}`);
                           setIsAuthorized(false);
                        }
                    } else {
                         console.log(`User UID ${user.uid} not found in ${collectionName} collection.`);
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
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
            <div className="page-loader-container">
                <Loader
                    type="fullscreen"
                    size="large"
                    text="Verifying access..."
                />
            </div>
        );
    }
    if (!isAuthorized) {
        return <Navigate to="/access-denied" replace />;
    }
    return children;
}

export default ProtectedRoute;