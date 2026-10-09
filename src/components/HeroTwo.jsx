import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Smile, Baby, Activity } from 'lucide-react';

// প্রজেক্টের assets ফোল্ডার থেকে ব্যাকগ্রাউন্ড ইমেজ ইম্পোর্ট
import teethCleaningImg from '../assets/teeth-cleaning.jpg'; 

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const HeroTwo = () => {
  const [activeArrow, setActiveArrow] = useState('right');
  const [activeCard, setActiveCard] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  // ─── Backend State ──────────────────────────────────────────────────────────
  const [heroData, setHeroData] = useState(null);
  const [backendLoaded, setBackendLoaded] = useState(false);

  // পেজ লোড হলে কার্ডগুলোর একের পর এক এনিমেশন ট্রিগার
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimateCards(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('cards-container');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  // ─── Backend Fetch: GET /api/home2/features ─────────────────────────────────
  useEffect(() => {
    const fetchHome2Data = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/home2/features`);
        const json = await res.json();
        if (res.ok && json.success) {
          setHeroData(json.data);
          setBackendLoaded(true);
          console.log('✅ [Home 2] Backend data loaded:', json.layout);
        }
      } catch (err) {
        console.warn('⚠️ [Home 2] Backend fetch failed, using static fallback:', err.message);
      }
    };
    fetchHome2Data();
  }, []);

  // Merge backend data with fallback
  const hero = heroData?.hero || {};
  const title = hero.title || 'Let Us Craft Your Ideal Smile';
  const subtitle = hero.subtitle || 'PRECISE & MODERN DENTAL CARE';
  const ctaText = hero.ctaText || 'OUR APPROACH';
  const stats = heroData?.statistics || {};
  const offers = heroData?.promotionalOffers || [];
  const features = heroData?.features || [
    { title: 'Oral Orthodontics', description: 'Clear aligners and traditional braces.' },
    { title: "Children's Care", description: 'Happy dental experiences for kids.' },
    { title: 'Restorative Solutions', description: 'Durable fillings, crowns, and root canal therapy.' },
  ];

  const featureIcons = [Smile, Baby, Activity];

  return (
    <section id="home-2" className="relative w-full overflow-hidden bg-[#e9f5f8]">

      {/* ─── Backend Status Indicator ──────────────────────────────────── */}
      {backendLoaded && (
        <div className="absolute top-3 right-3 z-50 bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
          Backend Connected — Home 2 Data Live
        </div>
      )}
      
      {/* স্লাইডার এরিয়া */}
      <div className="relative h-[650px] md:h-[85vh] flex items-center">
        
        {/* ব্যাকগ্রাউন্ড স্থির ইমেজ */}
        <div className="absolute inset-0">
          <img 
            src={teethCleaningImg} 
            className="w-full h-full object-cover object-center md:object-right opacity-95"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/45 to-transparent"></div>
        </div>

        {/* মেইন ব্যানার টেক্সট (Backend-driven) */}
        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <div className="max-w-3xl flex flex-col items-start text-left space-y-4 md:space-y-6">
            
            <h5 className="text-[#0e2a47] font-extrabold text-xs md:text-sm tracking-[0.25em] uppercase">
              {subtitle}
            </h5>
            
            <h1 className="text-4xl md:text-6xl lg:text-[76px] font-black text-[#0e2a47] leading-[1.1] tracking-tight">
              {title.includes('Craft') ? (
                <>Let Us Craft Your <br /><span className="text-[#0e2a47]">Ideal Smile</span></>
              ) : (
                title
              )}
            </h1>
            
            <div className="pt-2">
              <button className="bg-[#0088ff] hover:bg-[#0077ee] text-white font-bold py-3.5 px-8 rounded-sm shadow-xl transition-all duration-300 uppercase text-xs tracking-wider">
                {ctaText}
              </button>
            </div>

          </div>
        </div>

        {/* স্লাইডার নেভিগেশন বাটন */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 md:px-12 z-20 pointer-events-none">
          <button 
            onClick={() => setActiveArrow('left')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 pointer-events-auto ${
              activeArrow === 'left' ? 'bg-[#0088ff] text-white' : 'bg-white text-[#0e2a47]'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={() => setActiveArrow('right')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 pointer-events-auto ${
              activeArrow === 'right' ? 'bg-[#0088ff] text-white' : 'bg-white text-[#0e2a47]'
            }`}
          >
            <ArrowRight size={20} />
          </button>
        </div>

      </div>

      {/* ৩টি ইনফো কার্ড সেকশন (Backend-driven Features) */}
      <div className="w-full bg-transparent px-6 md:px-20 relative -mt-24 md:-mt-32 pb-12 z-30">
        <div id="cards-container" className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {features.map((feature, idx) => {
            const Icon = featureIcons[idx] || Smile;
            return (
              <div 
                key={idx}
                className={`p-8 rounded-sm shadow-sm flex flex-col items-start bg-white border border-gray-200 text-gray-600 hover:border-[#0088ff]/30 text-left transition-all duration-700 ${idx > 0 ? `delay-[${idx * 150}ms]` : ''} transform ${
                  animateCards ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'
                }`}
                style={{ transitionDelay: animateCards ? `${idx * 150}ms` : '0ms' }}
              >
                <div className="text-[#0088ff] mb-4">
                  <Icon className="w-10 h-10 stroke-[1.25]" />
                </div>
                <h3 className="font-black text-lg uppercase tracking-wide mb-3 text-[#0e2a47]">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm leading-relaxed mb-6 text-gray-500">
                  {feature.description}
                </p>
                <button 
                  onClick={() => setActiveCard(idx)}
                  className={`font-bold text-xs py-2 px-4 rounded-sm border transition-all ${
                    activeCard === idx 
                      ? 'bg-[#0088ff] text-white border-[#0088ff] shadow-md' 
                      : 'bg-transparent text-[#0088ff] border-[#0088ff] hover:bg-[#0088ff] hover:text-white'
                  }`}
                >
                  Read More →
                </button>
              </div>
            );
          })}

        </div>
      </div>

      {/* ─── Backend Data Preview Panel (Only visible when backend is connected) ─── */}
      {backendLoaded && heroData && (
        <div className="bg-gradient-to-r from-[#001a33] to-[#003366] text-white py-8 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-300">
                🔵 Home 2 — Backend Data Loaded Successfully
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Features from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#0088ff] font-bold text-sm mb-3 uppercase tracking-wider">
                  🎯 Features (from API)
                </h4>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <span className="text-[#0088ff] mt-0.5">✓</span>
                      <span><strong>{f.title}</strong> — {f.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinic Statistics from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#0088ff] font-bold text-sm mb-3 uppercase tracking-wider">
                  📊 Clinic Stats (from MongoDB)
                </h4>
                {Object.keys(stats).length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center bg-black/20 rounded-lg p-3">
                      <p className="text-2xl font-black text-white">{stats.patientsServed?.toLocaleString() || '—'}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Patients Served</p>
                    </div>
                    <div className="text-center bg-black/20 rounded-lg p-3">
                      <p className="text-2xl font-black text-white">{stats.successRate || '—'}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Success Rate</p>
                    </div>
                    <div className="text-center bg-black/20 rounded-lg p-3">
                      <p className="text-2xl font-black text-white">{stats.expertDoctors || '—'}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Expert Doctors</p>
                    </div>
                    <div className="text-center bg-black/20 rounded-lg p-3">
                      <p className="text-2xl font-black text-white">{stats.yearsExperience || '—'}</p>
                      <p className="text-[10px] text-gray-400 uppercase">Years Experience</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No statistics loaded</p>
                )}
              </div>

              {/* Promotional Offers from Backend */}
              <div className="bg-white/10 rounded-lg p-5 backdrop-blur-sm">
                <h4 className="text-[#0088ff] font-bold text-sm mb-3 uppercase tracking-wider">
                  🎁 Promotional Offers (from API)
                </h4>
                {offers.length > 0 ? (
                  <ul className="space-y-3">
                    {offers.map((o, i) => (
                      <li key={i} className="bg-black/20 rounded-lg p-3">
                        <p className="text-sm font-bold text-white">{o.title}</p>
                        <p className="text-xs text-gray-300">{o.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">No offers loaded</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              API Endpoint: <code className="text-blue-300 bg-black/30 px-2 py-0.5 rounded">GET /api/home2/features</code> | 
              Data Source: MongoDB <code className="text-blue-300 bg-black/30 px-2 py-0.5 rounded">dentist_db</code>
            </p>
          </div>
        </div>
      )}

    </section>
  );
};

export default HeroTwo;
