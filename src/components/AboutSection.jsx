import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Award, Stethoscope, HeartPulse } from 'lucide-react';

// আপনার এসেটস ফোল্ডার থেকে আরেকটি সুন্দর ডেন্টাল ছবি ইম্পোর্ট করে নিবেন
// import aboutDentalImg from '../assets/about-dental.jpg'; 

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_FEATURES = [
  'Advanced Oral Diagnostics',
  'Pain-Free Laser Treatments',
  'Aesthetic Smile Designing',
  'Sterilized Global Standards',
];
const FEATURE_ICONS = [
  <Stethoscope className="w-4 h-4 text-[#0088ff]" key="steth" />,
  <CheckCircle2 className="w-4 h-4 text-[#0088ff]" key="check" />,
  <HeartPulse className="w-4 h-4 text-[#0088ff]" key="heart" />,
];

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [clinic, setClinic] = useState(null);
  const sectionRef = useRef(null);

  // সব ডিভাইসে স্ক্রল মোশন ট্র্যাক করার জন্য Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 } // স্ক্রিনের ১৫% এলেই মোশন স্টার্ট হবে
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        let res = await fetch(`${API_BASE}/api/about/clinic`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/clinic-info`);
        }
        const json = await res.json();
        if (json.success && json.data) setClinic(json.data);
      } catch (err) {
        console.error('AboutSection clinic fetch error:', err);
      }
    };
    load();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-white py-16 md:py-24 px-6 md:px-20 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* 📸 বাম পাশের ইমেজ ও ব্যাজ এরিয়া (মোশন এনিমেশন সহ) */}
        <div 
          className={`relative flex justify-center lg:justify-start transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-16 scale-95'
          }`}
        >
          {/* ব্যাকগ্রাউন্ড ডট স্টাইল প্যাটার্ন */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[radial-gradient(#0088ff_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-30 hidden md:block z-0"></div>
          
          {/* মেইন ইমেজ কন্টেইনার */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl z-10 w-full max-w-[500px] h-[350px] md:h-[480px] bg-gray-100">
            <img
              src={clinic?.bannerImage || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop'}
              alt={clinic?.name || 'Modern Dental Clinic'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 🏅 ভাসমান ছোট ইনফরমেটিভ ব্যাজ (নিচ থেকে ভেসে উঠবে) */}
          <div 
            className={`absolute -bottom-6 left-4 md:left-10 bg-white p-5 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-100 max-w-[280px] md:max-w-[320px] z-20 transition-all duration-1000 delay-300 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-[#e9f5f8] text-[#0088ff] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#0e2a47] text-sm md:text-base">Certified Specialists</h4>
              <p className="text-xs text-gray-500 mt-0.5">Top-ranked dental experts in the region.</p>
            </div>
          </div>
        </div>

        {/* 📝 ডান পাশের টেক্সট ও ফিচার এরিয়া (ডান দিক থেকে মোশন নিয়ে আসবে) */}
        <div 
          className={`flex flex-col text-left space-y-5 md:space-y-6 transition-all duration-1000 delay-150 transform ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'
          }`}
        >
          <div className="space-y-2">
            <h5 className="text-[#0088ff] font-extrabold text-xs md:text-sm tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-6 h-[2px] bg-[#0088ff]"></span> WHAT WE DO
            </h5>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-black text-[#0e2a47] leading-[1.2] tracking-tight">
              Rooted In Scientific Excellence, Driven By Care.
            </h2>
          </div>

          <p className="text-sm md:text-base text-gray-500 leading-relaxed">
            {clinic?.description ||
              'Our clinic integrates cutting-edge dental tech with personalized therapies to build brilliant smiles. From diagnostic analysis to full reconstructive oral aesthetics, we prioritize your long-term wellness.'}
          </p>

          {/* গ্রিড ফিচার লিস্ট (চেক আইকন সহ) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {(clinic?.features?.length ? clinic.features : FALLBACK_FEATURES).map((text, index) => (
              <div
                key={`${text}-${index}`}
                className="flex items-center gap-3 bg-[#e9f5f8]/50 p-3.5 rounded-lg border border-gray-100/50 hover:bg-[#e9f5f8] transition-colors"
              >
                <div className="flex-shrink-0">{FEATURE_ICONS[index % FEATURE_ICONS.length]}</div>
                <span className="text-xs md:text-sm font-bold text-[#0e2a47]">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;

























