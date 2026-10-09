import React, { useEffect, useState } from 'react';
import dentalTreatmentImg from '../assets/dental-treatment.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AboutBanner = () => {
  const [clinic, setClinic] = useState({ name: 'Our Clinic', bannerImage: dentalTreatmentImg });

  useEffect(() => {
    const load = async () => {
      try {
        let res = await fetch(`${API_BASE}/api/about/clinic`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/clinic-info`);
        }
        const json = await res.json();
        if (json.success && json.data) {
          setClinic({
            name: json.data.name || 'Our Clinic',
            bannerImage: json.data.bannerImage || dentalTreatmentImg,
          });
        }
      } catch (err) {
        console.error('AboutBanner clinic fetch error:', err);
      }
    };
    load();
  }, []);

  return (
    <div className="relative w-full h-[250px] md:h-[300px] bg-[#eef5f9] flex items-center overflow-hidden z-10">
      
      {/* বাম পাশের টেক্সট কন্টেন্ট এরিয়া */}
      <div className="w-full sm:w-[50%] md:w-[45%] pl-6 md:pl-24 lg:pl-32 z-20 flex flex-col justify-center h-full">
        {/* মেইন টাইটেল */}
        <h1 className="text-3xl md:text-[40px] font-extrabold text-[#0e2a47] mb-3 tracking-tight leading-tight">
          Discover {clinic.name || 'Our Clinic'}
        </h1>
        
        {/* ব্রেডক্রাম্ব লিংক */}
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500">
          <a href="#home" className="hover:text-[#3ec1d3] transition-colors">Welcome</a>
          <span className="text-gray-400">|</span>
          <span className="text-[#3ec1d3]">Clinic Overview</span>
        </div>
      </div>

      {/* ডান পাশের ইমেজ এরিয়া (এখন আর ঘোলা দেখাবে না) */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] md:w-[60%] h-full z-0 block">
        {/* 🎨 ওরিজিনাল স্টাইলের গ্রাডিয়েন্ট: এটি শুধু ছবির একদম বামের বর্ডারটুকুকে ব্যাকগ্রাউন্ডের সাথে মেলাবে, মূল ছবির ওপর কোনো ঝাপসা পর্দা ফেলবে না */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eef5f9] via-[#eef5f9]/20 to-transparent z-10 pointer-events-none" />
        
        {/* ১০০% ক্লিয়ার ব্যাকগ্রাউন্ড ইমেজ */}
        <img
          src={clinic.bannerImage || dentalTreatmentImg}
          alt={clinic.name || 'Dental Clinic Treatment'}
          className="w-full h-full object-cover object-center md:object-right-top transform scale-100 animate-[subtle-zoom_20s_infinite_alternate] block"
          onError={(e) => {
            e.target.src = dentalTreatmentImg;
          }}
        />
      </div>

      {/* CSS মোশন অ্যানিমেশন কিফ্রেম */}
      <style jsx="true">{`
        @keyframes subtle-zoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.06);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutBanner;








































