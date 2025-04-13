import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css'; // Ensure CSS is imported

// Core Components (Load Eagerly)
import { Header, Footer, ProtectedRoute, AccessDenied } from './components';
import { PageLoader } from './components/Loading'; // Specific loader import
import PageTransition from './components/PageTransition';

// Page Components (Lazy Load)
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
const UserHomePage = React.lazy(() => import('./pages/user-homepage/UserHomePage'));
const NgoHomePage = React.lazy(() => import('./pages/ngo-homepage/NgoHomePage'));
const AdminDashboard = React.lazy(() => import('./pages/admin-dashboard/AdminDashboard'));

function App() {
  return (
    <Router>
      <div className="app-container"> {/* Changed class name */}
        <Header />
        <main className="main-content"> {/* Added main content wrapper */}
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
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

                {/* Protected Routes */}
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

                {/* Fallback or Not Found Route (Optional) */}
                {/* <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} /> */}
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;