// frontend/src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Plug-and-play Integration Example for Dental Clinic Website
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import Navbar from './components/Navbar/Navbar';
import SmileGallery from './components/SmileGallery/SmileGallery';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Global Navigation Bar with "About Us → Smile Gallery" link */}
      <Navbar />

      {/* Hero Section */}
      <header className="py-12 bg-gradient-to-b from-teal-50/60 to-transparent text-center px-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-700">
          World-Class Dental Care & Aesthetic Dentistry
        </h2>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2">
          Transforming Smiles with Precision & Artistry
        </p>
      </header>

      {/* 2. Smile Gallery Section (targeted by #smile-gallery anchor) */}
      <main>
        <SmileGallery />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Smile Care Dental Clinic. All Rights Reserved. HIPAA & Patient Privacy Compliant.</p>
      </footer>
    </div>
  );
}

export default App;
