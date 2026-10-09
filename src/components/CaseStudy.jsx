// src/components/CaseStudy.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// ইমেজসমূহ ইম্পোর্ট
import dentistPerforming from '../assets/dentist-work.jpg';
import dentistTalking from '../assets/dentist-talking.jpg';
import confidentDentist from '../assets/dentist-action.jpg';

const CaseStudy = () => {
  const [activeArrow, setActiveArrow] = useState('right');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(1); // ২ নং ছবিকে সেন্টারে রাখার জন্য ইনিশিয়াল ইনডেক্স ১

  const caseStudies = [
    {
      id: 0,
      title: "Maximus libero ornare",
      subtitle: "Nec vehicula",
      image: dentistPerforming
    },
    {
      id: 1,
      title: "Advanced Dental Care",
      subtitle: "Modern clinic treatment",
      image: dentistTalking
    },
    {
      id: 2,
      title: "Smile Transformation",
      subtitle: "Expert orthodontics",
      image: confidentDentist
    }
  ];

  // ডান অ্যারো ক্লিক: পুরো গ্যালারি রো বামে সরবে (৩ নং আসবে ২ নং এর জায়গায়)
  const handleNext = () => {
    setActiveArrow('right');
    setCurrentIndex((prev) => (prev === caseStudies.length - 1 ? 0 : prev + 1));
  };

  //amp; বাম অ্যারো ক্লিক: পুরো গ্যালারি রো ডানে সরবে (১ নং আসবে ২ নং এর জায়গায়)
  const handlePrev = () => {
    setActiveArrow('left');
    setCurrentIndex((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1));
  };

  return (
    <div className="w-full relative bg-white">
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 ১. উপরের অংশ: নেভি ব্লু ব্যাকগ্রাউন্ড লেআউট */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#031326] text-white pt-20 pb-40">
        <div className="w-full max-w-[1240px] mx-auto px-6 md:px-16 flex items-end justify-between">
          <div className="text-left space-y-2">
            <span className="text-[#00a2ff] font-semibold text-xs tracking-[0.25em] uppercase block">
              OUR WORK GALLERY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Clinical Treatment Records
            </h2>
          </div>

          {/* নেভিগেশন বাটন */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeArrow === 'left'
                  ? 'bg-[#00a2ff] text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <button
              onClick={handleNext}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeArrow === 'right'
                  ? 'bg-[#00a2ff] text-white shadow-lg'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
              }`}
            >
              <ArrowRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 ২. ইমেজ স্লাইডার অংশ: যা দুই ব্যাকগ্রাউন্ডের মাঝখানে ঝুলে থাকবে */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="w-full absolute top-[220px] left-0 z-20 overflow-hidden pointer-events-none">
        <div className="w-full max-w-[1240px] mx-auto px-6 md:px-16 pointer-events-auto">
          
          <motion.div
            // স্লাইড পজিশন ক্যালকুলেশন যা উইন্ডো সাইজ অনুযায়ী একদম পারফেক্ট মুভমেন্ট দিবে
            animate={{ x: `calc(-${(currentIndex - 1) * 33.33}% - ${(currentIndex - 1) * 32}px)` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            // ওক্সসি এররটি সমাধান করতে অবজেক্টের বদলে টেলওয়াইন্ড ক্লাস (w-[150%] md:w-full) দিয়ে উইডথ ফিক্স করা হয়েছে
            className="flex gap-8 w-[150%] md:w-full"
          >
            {caseStudies.map((item, index) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="w-[calc(100%/3)] aspect-[4/3] relative flex-shrink-0 bg-slate-900 overflow-hidden shadow-2xl transition-all duration-300"
              >
                {/* ইমেজ কন্টেন্ট */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
                />

                {/* হোভার স্মুথ ওভারলে */}
                <div className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${hoveredIndex === index ? 'bg-transparent' : ''}`} />

                {/* 🔹 হোভার করলে সাদাカード ইনফো ভেসে উঠবে */}
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-6 left-6 bg-white p-6 pr-12 shadow-2xl max-w-[85%] text-left border-l-[4px] border-[#00a2ff] z-30"
                  >
                    <h4 className="font-bold text-[15px] text-[#031326] tracking-wide leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {item.subtitle}
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 ৩. নিচের অংশ: খালি সাদা ব্যাকগ্রাউন্ড স্পেস (গ্যাপ তৈরি করার জন্য) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="w-full h-[260px] bg-white" />
    </div>
  );
};

export default CaseStudy;


























