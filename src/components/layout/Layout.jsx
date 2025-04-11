import React from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { useSelector } from 'react-redux';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  return (
    <div className="app">
      {showHeader && <Header />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout; 