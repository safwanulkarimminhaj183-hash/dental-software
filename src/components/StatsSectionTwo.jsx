// src/components/StatsSectionTwo.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Stethoscope, Sparkles, Smile, Star, ShieldPlus } from 'lucide-react';
import patientImg from '../assets/patient.jpg'; // আপনার লোকাল এসেটস ফোল্ডারের ইমেজ

const StatsSectionTwo = () => {
  // কাউন্টার স্টেটস
  const [clinics, setClinics] = useState(1);
  const [patients, setPatients] = useState(1);
  const [successRate, setSuccessRate] = useState(1);
  const [surgeons, setSurgeons] = useState(1);

  // স্ক্রল ট্র্যাক করার জন্য স্টেট (ইন-ভিউ লজিক)
  const [isInView, setIsInView] = useState(false);

  // একটিভ আইকন স্টেট (ক্লিক করলে শুধু আইকনের কালার চেঞ্জ করার জন্য)
  const [activeIcon, setActiveIcon] = useState(null);

  useEffect(() => {
    if (!isInView) return; // ইউজার স্ক্রল করে এই সেকশনে না আসা পর্যন্ত কাউন্টিং শুরু হবে না

    const timer15 = setInterval(() => setClinics(p => p >= 15 ? 15 : p + 1), 80);
    const timer45 = setInterval(() => setPatients(p => p >= 45 ? 45 : p + 1), 30);
    const timer99 = setInterval(() => setSuccessRate(p => p >= 99 ? 99 : p + 1), 15);
    const timer25 = setInterval(() => setSurgeons(p => p >= 25 ? 25 : p + 1), 50);

    return () => {
      clearInterval(timer15); clearInterval(timer45);
      clearInterval(timer99); clearInterval(timer25);
    };
  }, [isInView]);

  // Framer Motion কনফিগারেশন
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      onViewportEnter={() => setIsInView(true)} // স্ক্রল করে এখানে আসলেই কাউন্টার ট্রিগার হবে
      variants={containerVariants}
      className="w-full bg-[#031326] text-white relative overflow-hidden flex flex-col"
    >
      {/* ওয়াটারমার্ক প্লাস সাইন গ্রিড ব্যাকগ্রাউন্ড */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:45px_45px] pointer-events-none"></div>
      <div className="absolute top-20 left-12 text-white/[0.02] font-light text-[10rem] select-none pointer-events-none">+</div>
      <div className="absolute bottom-40 right-20 text-white/[0.02] font-light text-[10rem] select-none pointer-events-none">+</div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 উপরের অংশ: ডক্টর এক্সরে ইমেজ এবং ইনফো টেক্সট কন্টেন্ট */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="relative w-full pt-20 pb-12 px-6 md:px-20 max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* [মোশন ১] বাম পাশের ইমেজ কন্টেইনার (patient.jpg) */}
        <motion.div 
          variants={itemVariants}
          className="w-full h-[340px] md:h-[400px] rounded-md overflow-hidden border border-white/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] group"
        >
          <img 
            src={patientImg} 
            alt="Clinical Diagnostics" 
            className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
          />
        </motion.div>

        {/* [মোশন ২] ডান পাশের টেক্সট পার্ট */}
        <motion.div variants={itemVariants} className="flex flex-col text-left space-y-6 lg:pl-4">
          <div>
            <span className="text-[#00a2ff] font-bold text-[11px] tracking-[0.25em] uppercase">
              OUR MEDICAL CHARTER
            </span>
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-white leading-[1.2] mt-3">
              Advanced Clinical Care <br />For Lifelong Smiles
            </h2>
            <p className="text-xs text-slate-400 mt-3 max-w-lg leading-relaxed">
              We combine leading-edge healthcare automation with top-tier global medical practitioners to deliver unprecedented diagnostics.
            </p>
          </div>

          {/* আইকন ক্লিক ইন্টারঅ্যাকশন গ্রিড */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* আইকন বক্স ১ */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setActiveIcon(1)}
                className="w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer select-none"
              >
                <HeartPulse 
                  className={`w-6 h-6 stroke-[1.6] transition-colors duration-300 ${
                    activeIcon === 1 ? "text-white scale-105" : "text-[#00a2ff]"
                  }`} 
                />
              </div>
              <h4 className="font-semibold text-base text-white tracking-wide">Elite Standard Protocols</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Strict multi-tier checkups and fully certified automated stabilization systems for every single procedure.
              </p>
            </div>

            {/* আইকন باکس ২ */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setActiveIcon(2)}
                className="w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer select-none"
              >
                <Stethoscope 
                  className={`w-6 h-6 stroke-[1.6] transition-colors duration-300 ${
                    activeIcon === 2 ? "text-white scale-105" : "text-[#00a2ff]"
                  }`} 
                />
              </div>
              <h4 className="font-semibold text-base text-white tracking-wide">Top Tier Practitioners</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Our board-certified surgical team holds extensive international accolades and global healthcare training.
              </p>
            </div>

          </div>
        </motion.div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 নিচের অংশ: উপরের কন্টেন্টের সমান উইডথ লেভেলের কাউন্টার এরিয়া (image_5de17c.jpg এর মতো) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[1240px] mx-auto px-6 md:px-20 pb-20 z-10">
        <motion.div 
          variants={itemVariants}
          className="w-full bg-gradient-to-r from-[#0080ff] to-[#0099ff] py-10 px-8 rounded-none text-center text-white shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center"
        >
          {/* কাউন্টার ১ */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 mb-2">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{clinics}+</h3>
            <p className="text-[9px] font-bold text-blue-50 tracking-widest uppercase mt-0.5">Global Branches</p>
          </div>

          {/* কাউন্টার ২ */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 mb-2">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{patients}K</h3>
            <p className="text-[9px] font-bold text-blue-50 tracking-widest uppercase mt-0.5">Patients Served</p>
          </div>

          {/* কাউন্টার ৩ */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 mb-2">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{successRate}%</h3>
            <p className="text-[9px] font-bold text-blue-50 tracking-widest uppercase mt-0.5">Success Rating</p>
          </div>

          {/* কাউন্টার ৪ */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 mb-2">
              <ShieldPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">{surgeons}+</h3>
            <p className="text-[9px] font-bold text-blue-50 tracking-widest uppercase mt-0.5">Expert Surgeons</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default StatsSectionTwo;































