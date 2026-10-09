import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Services from '../components/Services';
import Features from '../components/Features';

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <div className="py-6">
          <Services />
          <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
