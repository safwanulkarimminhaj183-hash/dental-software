// frontend/src/components/Navbar/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Navigation Bar with "About Us → Smile Gallery" click handler & smooth scrolling
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';

const Navbar = ({ onNavigate }) => {
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Handler for clicking "About Us → Smile Gallery"
   * 1. Smoothly scrolls to the #smile-gallery section if present on page.
   * 2. Otherwise triggers route navigation callback (e.g. navigate('/about-us/smile-gallery') or '/#smile-gallery').
   */
  const handleSmileGalleryClick = (e) => {
    e.preventDefault();
    setAboutDropdownOpen(false);
    setMobileMenuOpen(false);

    const gallerySection = document.getElementById('smile-gallery');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash in URL without full reload
      window.history.pushState(null, '', '#smile-gallery');
    } else {
      // If user is on a different route, navigate to the gallery route or root hash
      if (onNavigate) {
        onNavigate('/#smile-gallery');
      } else {
        window.location.href = '/#smile-gallery';
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Clinic Brand / Logo */}
          <a href="/" className="flex items-center gap-2 text-teal-600 font-extrabold text-xl tracking-tight">
            <span className="text-2xl">🦷</span>
            <span className="text-slate-900 font-bold">
              Smile<span className="text-teal-600">Care</span> Dental
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <a href="/" className="hover:text-teal-600 transition-colors">
              Home
            </a>
            <a href="/services" className="hover:text-teal-600 transition-colors">
              Treatments & Services
            </a>

            {/* "About Us" Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className="flex items-center gap-1.5 py-2 hover:text-teal-600 transition-colors focus:outline-none"
                aria-expanded={aboutDropdownOpen}
              >
                <span>About Us</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    aboutDropdownOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {aboutDropdownOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                  <a
                    href="/about"
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-600 font-medium transition-colors"
                  >
                    🏢 About Our Clinic & Team
                  </a>

                  {/* ★ PRIMARY LINK: About Us → Smile Gallery ★ */}
                  <a
                    href="#smile-gallery"
                    onClick={handleSmileGalleryClick}
                    className="flex items-center justify-between px-4 py-2.5 text-xs text-teal-700 bg-teal-50/50 hover:bg-teal-50 font-bold border-l-4 border-teal-600 transition-colors cursor-pointer"
                  >
                    <span>✨ Smile Gallery (Cases)</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                      Real Cases
                    </span>
                  </a>

                  <a
                    href="/about/patient-help"
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-600 font-medium transition-colors"
                  >
                    💬 Patient Help & Support
                  </a>
                </div>
              )}
            </div>

            <a href="/appointments" className="hover:text-teal-600 transition-colors">
              Book Appointment
            </a>
            <a href="/contact" className="hover:text-teal-600 transition-colors">
              Contact
            </a>
          </div>

          {/* Call to Action */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#smile-gallery"
              onClick={handleSmileGalleryClick}
              className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
            >
              Browse Gallery
            </a>
            <a
              href="/appointments"
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-sm"
            >
              Book Visit
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white border-t border-slate-100">
          <a href="/" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700">
            Home
          </a>
          <div className="py-2 border-y border-slate-100">
            <span className="block px-3 text-xs font-bold uppercase text-slate-400 mb-1">About Us</span>
            <a
              href="#smile-gallery"
              onClick={handleSmileGalleryClick}
              className="block px-3 py-2 text-sm font-bold text-teal-700 bg-teal-50 rounded-lg"
            >
              ✨ Smile Gallery & Cases
            </a>
            <a href="/about/patient-help" className="block px-3 py-2 text-sm text-slate-600">
              Patient Help
            </a>
          </div>
          <a href="/appointments" className="block px-3 py-2 text-sm font-medium text-slate-700">
            Book Appointment
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
