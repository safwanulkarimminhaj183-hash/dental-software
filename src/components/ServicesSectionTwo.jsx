import { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, Stethoscope, Rows3 } from 'lucide-react';

const ServicesSectionTwo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null); // আইকন ক্লিক/টাচ ট্র্যাক করার জন্য স্টেট
  const sectionRef = useRef(null);

  // স্ক্রল মোশন ট্র্যাকিং (Mobile, Tab, Laptop, Desktop সব ডিভাইসের জন্য)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-[#f8fbfd] py-16 md:py-24 px-6 md:px-20 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* 🔹 বাম পাশের ব্লক (১ম ছবি এবং তার ডান পাশের ২টি সার্ভিস) */}
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 gap-6 items-center transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          {/* ১ম ছবি: ডেন্টিস্ট এবং ফিমেল পেশেন্ট (Unsplash থেকে কপিরাইট ফ্রি ইউনিক ইমেজ) */}
          <div className="rounded-xl overflow-hidden shadow-md h-[320px] md:h-[380px] bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=500&auto=format&fit=crop" 
              alt="Dentist treating female patient" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* সার্ভিস ১ ও ২ */}
          <div className="flex flex-col space-y-8 text-left">
            {/* সার্ভিস ১ */}
            <div className="space-y-3">
              <div 
                onClick={() => setActiveIcon(1)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer shadow-sm border transition-all duration-300 ${
                  activeIcon === 1 
                    ? 'bg-[#0088ff] text-white border-[#0088ff] scale-110' 
                    : 'bg-white text-[#0088ff] border-gray-100 hover:border-[#0088ff]/30'
                }`}
              >
                <Sparkles className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-black text-base text-[#0e2a47] uppercase tracking-wide">Advanced Aesthetics</h4>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Transform your overall appearance with our specialized premium enamel contouring and shaping.
              </p>
              <button className="text-xs font-bold text-[#0088ff] hover:underline flex items-center gap-1">Read More →</button>
            </div>

            {/* সার্ভিস ২ */}
            <div className="space-y-3">
              <div 
                onClick={() => setActiveIcon(2)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer shadow-sm border transition-all duration-300 ${
                  activeIcon === 2 
                    ? 'bg-[#0088ff] text-white border-[#0088ff] scale-110' 
                    : 'bg-white text-[#0088ff] border-gray-100 hover:border-[#0088ff]/30'
                }`}
              >
                <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-black text-base text-[#0e2a47] uppercase tracking-wide">Pediatric Prevention</h4>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Early protective treatments and shield applications to keep younger smiles perfectly healthy.
              </p>
              <button className="text-xs font-bold text-[#0088ff] hover:underline flex items-center gap-1">Read More →</button>
            </div>
          </div>
        </div>

        {/* 🔹 ডান পাশের ব্লক (২য় ছবি এবং তার ডান পাশের ২টি সার্ভিস) */}
        <div 
          className={`grid grid-cols-1 sm:grid-cols-2 gap-6 items-center transition-all duration-1000 delay-[200ms] transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
          }`}
        >
          {/* ২য় ছবি: ফিমেল পেশেন্ট এবং ডেন্টিস্টের হাত (ক্লিয়ার ক্লোজ-আপ ইউনিক ইমেজ) */}
          <div className="rounded-xl overflow-hidden shadow-md h-[320px] md:h-[380px] bg-gray-200 lg:order-1">
            <img 
              src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=500&auto=format&fit=crop" 
              alt="Female patient and dentist hand checkup" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* সার্ভিস ৩ ও ৪ */}
          <div className="flex flex-col space-y-8 text-left lg:order-2">
            {/* সার্ভিস ৩ */}
            <div className="space-y-3">
              <div 
                onClick={() => setActiveIcon(3)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer shadow-sm border transition-all duration-300 ${
                  activeIcon === 3 
                    ? 'bg-[#0088ff] text-white border-[#0088ff] scale-110' 
                    : 'bg-white text-[#0088ff] border-gray-100 hover:border-[#0088ff]/30'
                }`}
              >
                <Stethoscope className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-black text-base text-[#0e2a47] uppercase tracking-wide">Deep Laser Bleaching</h4>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Brighten teeth up to multiple shades lighter using safe, fast-acting advanced beam diagnostics.
              </p>
              <button className="text-xs font-bold text-[#0088ff] hover:underline flex items-center gap-1">Read More →</button>
            </div>

            {/* সার্ভিস ৪ */}
            <div className="space-y-3">
              <div 
                onClick={() => setActiveIcon(4)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer shadow-sm border transition-all duration-300 ${
                  activeIcon === 4 
                    ? 'bg-[#0088ff] text-white border-[#0088ff] scale-110' 
                    : 'bg-white text-[#0088ff] border-gray-100 hover:border-[#0088ff]/30'
                }`}
              >
                <Rows3 className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-black text-base text-[#0e2a47] uppercase tracking-wide">Bioactive Implants</h4>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                High-grade biocompatible fixtures designed to restore missing teeth structure permanently.
              </p>
              <button className="text-xs font-bold text-[#0088ff] hover:underline flex items-center gap-1">Read More →</button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSectionTwo;





















