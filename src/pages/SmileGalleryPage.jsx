import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SmileGallery from '../components/SmileGallery';

const SmileGalleryPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <SmileGallery />
      </main>
      <Footer />
    </div>
  );
};

export default SmileGalleryPage;
