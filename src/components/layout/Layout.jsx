import React from 'react';
import Header from '../header/header';
import Footer from '../footer/Footer';
import { useSelector } from 'react-redux';

const Layout = ({ children, showHeader = true, showFooter = true }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);

  return (
    <div className="layout">
      {showHeader && <Header />}
      <main className="main-content section-padding">
        <div className="container-max-width">
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;