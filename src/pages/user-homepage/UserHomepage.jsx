import React from 'react';
import { Header, Footer, DonationsCta, UserCard } from '../../components/index.js';


function UserHomePage() {
  return (
    <>
      <Header />
      <div style={{"marginTop":"2rem"}}></div>
      <UserCard />
      <div style={{"marginTop":"2rem"}}></div>
      <DonationsCta />
      <Footer />
    </>
  )
}

export default UserHomePage