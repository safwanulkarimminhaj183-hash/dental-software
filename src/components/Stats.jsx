import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { LuShieldPlus, LuHeartHandshake } from "react-icons/lu";
import { MdMonitorHeart } from "react-icons/md";
import { FaSuitcaseMedical } from "react-icons/fa6";

// Assets
import medicalBg from '../assets/medical-background.jpg';
import dentalClinicImg from '../assets/dental-clinic.jpg';

const StatCounter = ({ end, suffix, inView }) => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (inView) {
      let start = 1;
      const duration = 2000;
      const totalFrames = duration / 16;
      const increment = (end - start) / totalFrames;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, end]);

  return <span>{count}{suffix}</span>;
};

const Stats = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const stats = [
    { id: 1, icon: <LuShieldPlus />, end: 34, suffix: '+', title: 'Awards Win' },
    { id: 2, icon: <LuHeartHandshake />, end: 95, suffix: 'K', title: 'Happy Customers' },
    { id: 3, icon: <MdMonitorHeart />, end: 100, suffix: '%', title: 'Satisfaction' },
    { id: 4, icon: <FaSuitcaseMedical />, end: 10, suffix: '+', title: 'Years of experience' },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const bannerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, delay: 0.3 } }
  };

  return (
    <section className="bg-[#0e2a47] relative overflow-hidden py-24 min-h-[700px]">
      
      {/* Background Icon Pattern (2 no screen matching) */}
      <div 
        className="absolute right-0 top-0 w-full md:w-[60%] h-full opacity-[0.08] pointer-events-none z-0"
        style={{ 
          backgroundImage: `url(${medicalBg})`,
          backgroundSize: 'contain',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

      {/* Dotted Circle (Bam Dike) */}
      <div className="absolute left-[-150px] bottom-[-100px] w-[600px] h-[600px] pointer-events-none z-0 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1, 3" />
        </svg>
      </div>

      <motion.div 
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container mx-auto px-6 md:px-24 relative z-10"
      >
        
        {/* Step 1: Stats Cards (Portfolio.jsx animation style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          {stats.map((item) => (
            <motion.div 
              key={item.id} 
              variants={itemVariants}
              className="bg-[#163554]/40 backdrop-blur-sm p-10 border-b-4 border-[#3ec1d3] flex flex-col items-start transition-all duration-300 hover:bg-[#163554]/80"
            >
              <div className="mb-6 text-[#3ec1d3] text-4xl">
                {item.icon}
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                <StatCounter end={item.end} suffix={item.suffix} inView={inView} />
              </div>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[2px]">{item.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Step 2: Banner Section (Height Fixed, professional length) */}
        <motion.div 
          variants={bannerVariants}
          className="flex flex-col md:flex-row w-full max-w-6xl mx-auto shadow-2xl overflow-hidden rounded-sm bg-[#3ec1d3]"
        >
          {/* Left Side: Picture (Natural Height) */}
          <div className="md:w-1/2 h-[350px] md:h-[380px]">
            <img 
              src={dentalClinicImg} 
              alt="Dental Care" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side: Text Box (Dan diker sathe level fixed) */}
          <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center text-white">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
            >
              True Healthcare For <br /> Your Family
            </motion.h2>
            <motion.p 
            variants={itemVariants}
              className="text-white/90 text-[14px] leading-relaxed"
            >
              The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax 
              quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, 
              vex nymphs. Waltz, bad nymph, for quick jigs vex.
            </motion.p>
          </div>
        </motion.div>

      </motion.div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 60s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default Stats;
































