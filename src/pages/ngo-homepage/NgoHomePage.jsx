import React from 'react';
import { Header, Footer, DonationsCta, Savetheday } from '../../components/index.js';

function NgoHomePage() {
  return (
    <div className='updated-page-container'>
      <Header />
      <div className='ngo-homepage-content'>
        <Savetheday />
        <DonationsCta />
      </div>
      <Footer />
    </div>
  )
}

export default NgoHomePage