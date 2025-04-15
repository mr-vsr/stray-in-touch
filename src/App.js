import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import { Header, Footer, ProtectedRoute, AccessDenied } from './components';
import { PageLoader } from './components/Loading';
import PageTransition from './components/PageTransition';
import ChatBot from './components/chatbot/ChatBot'; // Add this import
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut here
import { auth, db } from './auth/firebase-config';
import { Login, Logout } from './store/authSlice';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LandingPage = React.lazy(() => import('./pages/landing-page/LandingPage'));
const About = React.lazy(() => import('./pages/about/About'));
const LoginType = React.lazy(() => import('./pages/type-of-login/LoginType'));
const Donations = React.lazy(() => import('./pages/donations/Donations'));
const UserLogin = React.lazy(() => import('./components/login/UserLogin'));
const NgoLogin = React.lazy(() => import('./components/login/NgoLogin'));
const AdminLogin = React.lazy(() => import('./components/login/AdminLogin'));
const UserSignup = React.lazy(() => import('./components/signup/UserSignup'));
const NgoSignup = React.lazy(() => import('./components/signup/NgoSignup'));
const AdminSignup = React.lazy(() => import('./components/signup/AdminSignup'));
const UserHomePage = React.lazy(() => import('./pages/user-homepage/UserHomePage.jsx'));
const NgoHomePage = React.lazy(() => import('./pages/ngo-homepage/NgoHomePage'));
const AdminDashboard = React.lazy(() => import('./pages/admin-dashboard/AdminDashboard'));

const fetchUserProfile = async (uid) => {
    const collectionsToSearch = ['admins', 'NgoInfo', 'users'];
    for (const collectionName of collectionsToSearch) {
        const userRef = collection(db, collectionName);
        const q = query(userRef, where('uid', '==', uid));
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            }
        } catch (error) {
             console.error(`Error searching ${collectionName} for UID ${uid}:`, error);
        }
    }
    console.warn(`No profile found in Firestore for UID: ${uid}`);
    return null;
};


function App() {
  const dispatch = useDispatch();
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        const userProfile = await fetchUserProfile(userAuth.uid);

        if (userProfile) {
           dispatch(Login({
             userData: {
               uid: userAuth.uid,
               email: userAuth.email,
               displayName: userProfile.name || userAuth.displayName,
               photoURL: userProfile.avatar || userProfile.banner || userAuth.photoURL,
               role: userProfile.role,
               contact: userProfile.contact,
             },
             isLoggedIn: true
           }));
        } else {
            console.error(`User ${userAuth.uid} authenticated but no profile found. Logging out.`);
            dispatch(Logout());
            await signOut(auth); // Use the imported signOut function
        }

      } else {
        dispatch(Logout());
      }
       setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loadingAuth) {
      return <PageLoader />;
  }

  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                <Route path="/type-of-login" element={<PageTransition><LoginType /></PageTransition>} />
                <Route path="/donations" element={<PageTransition><Donations /></PageTransition>} />
                <Route path="/user-login" element={<PageTransition><UserLogin /></PageTransition>} />
                <Route path="/ngo-login" element={<PageTransition><NgoLogin /></PageTransition>} />
                <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
                <Route path="/user-signup" element={<PageTransition><UserSignup /></PageTransition>} />
                <Route path="/ngo-signup" element={<PageTransition><NgoSignup /></PageTransition>} />
                <Route path="/admin-signup" element={<PageTransition><AdminSignup /></PageTransition>} />
                <Route path="/access-denied" element={<PageTransition><AccessDenied /></PageTransition>} />

                <Route
                  path="/user-homepage"
                  element={
                    <ProtectedRoute allowedRole="user">
                      <PageTransition><UserHomePage /></PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo-homepage"
                  element={
                    <ProtectedRoute allowedRole="ngo">
                      <PageTransition><NgoHomePage /></PageTransition>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRole="admin">
                      <PageTransition><AdminDashboard /></PageTransition>
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;