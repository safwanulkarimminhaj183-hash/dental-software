import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import heroImg1 from '../assets/dentist-picture.jpg'; 

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroData, setHeroData] = useState(null);
  const [backendLoaded, setBackendLoaded] = useState(false);

  const fallbackImages = [heroImg1, heroImg1]; 

  // ─── Backend Fetch: GET /api/home1/hero ─────────────────────────────────────
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/home1/hero`);
        const json = await res.json();
        if (res.ok && json.success) {
          setHeroData(json.data);
          setBackendLoaded(true);
          console.log('✅ [Home 1] Backend data loaded:', json.layout);
        }
      } catch (err) {
        console.warn('⚠️ [Home 1] Backend fetch failed, using static fallback:', err.message);
      }
    };
    fetchHeroData();
  }, []);

  const hero = heroData?.hero || {};
  const title = hero.title || 'Let Us Brighten Your Smile';
  const subtitle = hero.subtitle || 'WE USE LATEST MEDICAL TECHNOLOGY';
  const ctaText = hero.ctaText || 'Who We Are';
  const images = fallbackImages; // Always use local images for the slider

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <section id="home-1" className="relative w-full overflow-hidden bg-[#f0f9fa]">

      {/* ─── Backend Status Indicator ──────────────────────────────────── */}
      {backendLoaded && (
        <div className="absolute top-3 right-3 z-50 bg-green-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
          Backend Connected — Home 1 Data Live
        </div>
      )}

      <div className="relative h-[600px] md:h-[85vh] flex items-center">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <img 
              src={img} 
              className="w-full h-full object-cover object-right opacity-90"
              alt="Carousel"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent"></div>
          </div>
        ))}

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <div className="max-w-3xl">
            <h5 className="text-[#0e2a47] font-bold tracking-[4px] uppercase text-xs md:text-sm mb-6">
              {subtitle}
            </h5>
            <h1 className="text-5xl md:text-[85px] font-bold text-[#0e2a47] leading-[1.1] mb-10">
              {title.includes('Brighten') ? (
                <>Let Us Brighten <br /> Your Smile</>
              ) : (
                title
              )}
            </h1>
            <button className="bg-[#3ec1d3] hover:bg-[#0e2a47] text-white font-bold py-4 px-10 rounded-sm shadow-xl transition-all duration-500 uppercase text-xs tracking-widest">
              {ctaText}
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 md:px-12 z-20">
          <button onClick={prevSlide} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-[#0e2a47] hover:bg-[#3ec1d3] hover:text-white transition-all transform hover:scale-110">
            <ArrowLeft size={20} />
          </button>
          <button onClick={nextSlide} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-[#0e2a47] hover:bg-[#3ec1d3] hover:text-white transition-all transform hover:scale-110">
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <div 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 cursor-pointer rounded-sm transition-all ${
                i === currentSlide ? 'bg-[#0e2a47] w-6' : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* ─── Backend Data Preview Panel (Only visible when backend is connected) ─── */}
      {backendLoaded && heroData && (
        <div className="bg-gradient-to-r from-[#0e2a47] to-[#1a3d5c] text-white py-8 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-green-300">
                🟢 Home 1 — Backend Data Loaded Successfully
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Services from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#3ec1d3] font-bold text-sm mb-3 uppercase tracking-wider">
                  📋 Services (from MongoDB)
                </h4>
                {heroData.services && heroData.services.length > 0 ? (
                  <ul className="space-y-2">
                    {heroData.services.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                        <span className="text-[#3ec1d3] mt-0.5">✓</span>
                        <span>{s.name} {s.price ? `— $${s.price}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">Fallback services loaded (DB collection empty)</p>
                )}
              </div>

              {/* Doctors from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#3ec1d3] font-bold text-sm mb-3 uppercase tracking-wider">
                  🩺 Doctor Profiles (from MongoDB)
                </h4>
                {heroData.doctors && heroData.doctors.length > 0 ? (
                  <ul className="space-y-2">
                    {heroData.doctors.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-200">
                        <div className="w-6 h-6 bg-[#3ec1d3] rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {d.name?.charAt(0) || '?'}
                        </div>
                        <span>{d.name} {d.specialization ? `— ${d.specialization}` : ''}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No doctor profiles in DB yet</p>
                )}
              </div>

              {/* Testimonials from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#3ec1d3] font-bold text-sm mb-3 uppercase tracking-wider">
                  ⭐ Testimonials (from API)
                </h4>
                {heroData.testimonials && heroData.testimonials.length > 0 ? (
                  <ul className="space-y-3">
                    {heroData.testimonials.map((t, i) => (
                      <li key={i} className="text-sm text-gray-200">
                        <p className="italic text-gray-300 text-xs leading-relaxed">"{t.review?.substring(0, 80)}..."</p>
                        <p className="text-[#3ec1d3] text-xs font-semibold mt-1">— {t.patientName} {'⭐'.repeat(t.rating || 5)}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No testimonials loaded</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              API Endpoint: <code className="text-green-300 bg-black/30 px-2 py-0.5 rounded">GET /api/home1/hero</code> | 
              Data Source: MongoDB <code className="text-green-300 bg-black/30 px-2 py-0.5 rounded">dentist_db</code>
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
