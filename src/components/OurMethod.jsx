// src/components/OurMethod.jsx
import { motion } from 'framer-motion';

const OurMethod = () => {
  const steps = [
    {
      id: "01",
      title: "Dental Examination",
      desc: "We begin with a comprehensive digital scan and clinical evaluation to thoroughly analyze your specific oral health status."
    },
    {
      id: "02",
      title: "Personalized Treatment",
      desc: "Our senior specialists design a tailored procedure map, integrating advanced technologies suited just for your smile goals."
    },
    {
      id: "03",
      title: "Care & Aftercare",
      desc: "Execute precise clinical treatments under expert hands, followed by seamless recovery monitoring and structural support."
    }
  ];

  // হেডার ও কন্টেইনার অ্যানিমেশন ভেরিয়েন্ট
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <section className="w-full bg-[#f8fafc] py-16 px-4 md:px-16 flex justify-center">
      {/* 🔹 মেইন ডার্ক ব্লু কন্টেইনার (image_44658e.png এর ব্যাকগ্রাউন্ড স্টাইল) */}
      <div className="w-full max-w-[1140px] bg-[#051322] rounded-lg pt-16 pb-0 px-6 md:px-12 relative overflow-hidden flex flex-col items-center min-h-[480px]">
        
        {/* ব্যাকগ্রাউন্ড ডেকোরেশন গ্লোব/গ্রিড ইফেক্ট (স্ক্রিনশটের মতো রাইট সাইডে) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,162,255,0.15)_0%,transparent_70%)] pointer-events-none z-0"></div>
        <div className="absolute right-12 top-12 w-64 h-64 rounded-full border border-sky-500/10 pointer-events-none z-0 hidden md:block"></div>

        {/* 🔹 হেডার এরিয়া (মোশন অ্যানিমেশন সহ) */}
        <div className="text-center max-w-xl mb-12 space-y-2 z-10">
          <motion.span 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={headerVariants}
            className="text-[#00a2ff] font-bold text-xs tracking-[0.25em] uppercase block"
          >
            WORK PROCESS
          </motion.span>
          
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={headerVariants}
            className="text-2xl md:text-4xl font-bold tracking-tight text-white mt-1"
          >
            We Complete Every Step Carefully
          </motion.h2>
        </div>

        {/* 🔹 ৩টি প্রসেস কার্ড গ্রিড (যা নিচ থেকে ফ্লাশ হয়ে ঝুলে থাকবে) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-0 mt-auto z-10 items-end"
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={cardVariants}
              className="bg-[#00a2ff] text-white pt-12 pb-10 px-6 text-center relative flex flex-col items-center border-r border-sky-400/20 last:border-0 min-h-[260px] justify-start group"
            >
              {/* ⚪ গোল নাম্বার ব্যাজ (১ নম্বর স্ক্রিনশটের মতো উপরে ওভারল্যাপ করা) */}
              <div className="w-14 h-14 rounded-full bg-white text-[#00a2ff] font-bold text-[18px] flex items-center justify-center shadow-md absolute -top-7 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-105 select-none">
                {step.id}
              </div>

              {/* 🔴 ১ম লাইনের লেখা (টাইটেল) - যা টাচ বা হোভারে ব্ল্যাক এবং কালারফুল হবে */}
              <h3 className="font-bold text-[16px] tracking-wide mb-3 text-white transition-all duration-300 cursor-pointer group-hover:text-[#051322] active:text-[#051322] select-none">
                {step.title}
              </h3>

              {/* 📄 ডেসক্রিপশন টেক্সট */}
              <p className="text-[12px] text-sky-100 leading-relaxed font-light max-w-[220px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default OurMethod;









































