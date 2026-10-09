import React from 'react';
import Navbar from '../components/Navbar';
import DentistSpecialists from '../components/DentistSpecialists';

const SpecialistsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <DentistSpecialists />
    </div>
  );
};

export default SpecialistsPage;
