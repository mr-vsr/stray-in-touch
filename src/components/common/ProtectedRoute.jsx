import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from '../index'; // Assuming Loader can be used here

function ProtectedRoute({ children, allowedRole }) {
    const { isLoggedIn, userData, status } = useSelector((state) => state.auth);
    const isLoadingAuth = status === 'loading';

    if (isLoadingAuth) {
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

    if (!isLoggedIn) {
        return <Navigate to="/type-of-login" replace />;
    }

    if (!userData || userData.role !== allowedRole) {
         console.log(`ProtectedRoute: Access Denied. Required: ${allowedRole}, User has: ${userData?.role}`);
        return <Navigate to="/access-denied" replace />;
    }
    return children;
}

export default ProtectedRoute;