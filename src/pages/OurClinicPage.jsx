import React from 'react';
import Navbar from '../components/Navbar';
import AboutBanner from '../components/AboutBanner';
import About from '../components/About';
import Footer from '../components/Footer';

const OurClinicPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutBanner />
      <div className="pt-12">
        <About />
      </div>
      <Footer />
    </div>
  );
};

export default OurClinicPage;
