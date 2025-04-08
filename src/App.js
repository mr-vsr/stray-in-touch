import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageLoader } from './components/Loading';
import PageTransition from './components/PageTransition';
import './App.css';
import ProtectedRoute from "./auth/ProtectedRoute"
import { Donations } from './pages/index';

// Lazy load components
const LandingPage = React.lazy(() => import('./pages/landing-page/LandingPage'));
const LoginType = React.lazy(() => import('./pages/type-of-login/LoginType'));
const UserLogin = React.lazy(() => import('./components/login/UserLogin'));
const NgoLogin = React.lazy(() => import('./components/login/NgoLogin'));
const AdminLogin = React.lazy(() => import('./components/login/AdminLogin'));
const UserSignup = React.lazy(() => import('./components/signup/UserSignup'));
const NgoSignup = React.lazy(() => import('./components/signup/NgoSignup'));
const AdminSignup = React.lazy(() => import('./components/signup/AdminSignup'));
const About = React.lazy(() => import('./pages/about/About'));
const UserHomePage = React.lazy(() => import('./pages/user-homepage/UserHomePage'));
const NgoHomePage = React.lazy(() => import('./pages/ngo-homepage/NgoHomePage'));
const AdminDashboard = React.lazy(() => import('./pages/admin-dashboard/AdminDashboard'));

function App() {
  return (
    <Router>
      <div className="app">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              } />
              <Route path="/about" element={
                <PageTransition>
                  <About />
                </PageTransition>
              } />
              <Route path="/type-of-login" element={
                <PageTransition>
                  <LoginType />
                </PageTransition>
              } />
              <Route path="/user-login" element={
                <PageTransition>
                  <UserLogin />
                </PageTransition>
              } />
              <Route path="/ngo-login" element={
                <PageTransition>
                  <NgoLogin />
                </PageTransition>
              } />
              <Route path="/admin-login" element={
                <PageTransition>
                  <AdminLogin />
                </PageTransition>
              } />
              <Route path="/user-signup" element={
                <PageTransition>
                  <UserSignup />
                </PageTransition>
              } />
              <Route path="/ngo-signup" element={
                <PageTransition>
                  <NgoSignup />
                </PageTransition>
              } />
              <Route path="/admin-signup" element={
                <PageTransition>
                  <AdminSignup />
                </PageTransition>
              } />
              <Route path="/user-homepage" element={
                <ProtectedRoute component={UserHomePage} path="/user-login" />
              } />
              <Route path="/ngo-homepage" element={
                <ProtectedRoute component={NgoHomePage} path="/ngo-login" />
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute component={AdminDashboard} path="/admin-login" />
              } />
              <Route path="/donations" element={
                <PageTransition>
                  <Donations />
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
