import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageLoader } from './components/Loading';
import PageTransition from './components/PageTransition';
import './App.css';
import { Header, Footer } from './components/index';
import { About, UserHomePage, NgoHomePage, AdminDashboard } from './pages/index';
import { UserLogin, NgoLogin, AdminLogin, UserSignup, NgoSignup, AdminSignup, ProtectedRoute, AccessDenied } from './components/index';
import { Donations } from './pages/index';

// Lazy load components
const LandingPage = React.lazy(() => import('./pages/landing-page/LandingPage'));
const LoginType = React.lazy(() => import('./pages/type-of-login/LoginType'));

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/type-of-login" element={<LoginType />} />
              <Route path="/user-login" element={<UserLogin />} />
              <Route path="/ngo-login" element={<NgoLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/user-signup" element={<UserSignup />} />
              <Route path="/ngo-signup" element={<NgoSignup />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Protected Routes */}
              <Route
                path="/user-homepage"
                element={
                  <ProtectedRoute allowedRole="user">
                    <UserHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo-homepage"
                element={
                  <ProtectedRoute allowedRole="ngo">
                    <NgoHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/donations" element={
                <PageTransition>
                  <Donations />
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
