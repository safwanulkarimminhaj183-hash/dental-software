import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-[#0c1c2b] text-white pt-24 pb-10">
      
      {/* 1. Subscribe Box (Overlapping Section) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1100px] z-30">
        <div className="bg-[#3ec1d3] py-4 px-8 md:py-5 md:px-10 rounded-lg flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0 text-center md:text-left leading-tight">
            Enter Your Mail For <br /> Subscribe
          </h2>
          <div className="w-full md:w-auto flex bg-white p-2 rounded-sm shadow-inner">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="px-4 py-2 w-full md:w-[300px] outline-none text-gray-700"
            />
            <button className="bg-[#0c1c2b] text-white px-8 py-2 font-bold hover:bg-gray-800 transition-all uppercase tracking-wider">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* 2. Footer Main Content */}
      <div className="container mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Contact Us Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative">
              Contact Us
              <span className="block w-10 h-[2px] bg-[#3ec1d3] mt-2"></span>
            </h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="text-[#3ec1d3] mt-1" />
                <span>Uposhahar, Sylhet <br /> Bangladesh 3100.</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhoneAlt className="text-[#3ec1d3]" />
                <span>+880 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-[#3ec1d3]" />
                <span>info@carenow.com</span>
              </li>
            </ul>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative">
              Useful Link
              <span className="block w-10 h-[2px] bg-[#3ec1d3] mt-2"></span>
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="hover:text-[#3ec1d3] transition-colors cursor-pointer">About Our Clinic</li>
              <li className="hover:text-[#3ec1d3] transition-colors cursor-pointer">Dental Specialists</li>
              <li className="hover:text-[#3ec1d3] transition-colors cursor-pointer">Patient Testimonials</li>
              <li className="hover:text-[#3ec1d3] transition-colors cursor-pointer">Medical Services</li>
            </ul>
          </div>

          {/* Recent Post Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative">
              Recent Post
              <span className="block w-10 h-[2px] bg-[#3ec1d3] mt-2"></span>
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold hover:text-[#3ec1d3] cursor-pointer">Best Dental Care Strategies for 2026</h4>
                <p className="text-[10px] text-gray-500 uppercase mt-1">May 6, 2026</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold hover:text-[#3ec1d3] cursor-pointer">Why Oral Hygiene Matters Daily</h4>
                <p className="text-[10px] text-gray-500 uppercase mt-1">April 28, 2026</p>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 relative">
              Services
              <span className="block w-10 h-[2px] bg-[#3ec1d3] mt-2"></span>
            </h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="hover:text-[#3ec1d3] cursor-pointer">Root Canal Treatment</li>
              <li className="hover:text-[#3ec1d3] cursor-pointer">Teeth Whitening</li>
              <li className="hover:text-[#3ec1d3] cursor-pointer">Dental Implants</li>
              <li className="hover:text-[#3ec1d3] cursor-pointer">Orthodontic Services</li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-10 h-10 bg-[#3ec1d3] rounded-full flex items-center justify-center">
               <span className="text-white font-bold text-xs">DC</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">DentalCare</h2>
          </div>

          <p className="text-gray-500 text-[11px] text-center md:text-left">
            © yoursitename 2026 | all rights reserved
          </p>

          <div className="flex space-x-4 mt-6 md:mt-0">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#3ec1d3] transition-all duration-300 text-white">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;













