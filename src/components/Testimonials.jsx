// src/components/Testimonials.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, X } from 'lucide-react';

const Testimonials = () => {
  // ক্লিক করা ইমেজ ট্র্যাক করার জন্য স্টেট
  const [zoomedImage, setZoomedImage] = useState(null);

  const testimonialsData = [
    {
      id: 1,
      name: "Marcus Vance",
      role: "Executive Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      review: "The advanced clinical checkup completely transformed my dental experience. The automated stabilization systems made the complex root canal procedure absolutely painless and surprisingly quick."
    },
    {
      id: 2,
      name: "Clara Josephson",
      role: "Senior Consultant",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
      review: "I am amazed by the expertise of their board-certified surgeons. They combined world-class diagnostics with exceptional care, giving me a perfectly radiant and confident smile."
    },
    {
      id: 3,
      name: "Jonathan Reyes",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
      review: "Clean clinic, multi-tier protocols, and an incredibly friendly team. Their global standards of care are evident from the moment you step in. Highly recommended for family dental health!"
    }
  ];

  // Framer Motion সেকশন অ্যানিমেশন
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="w-full bg-[#f8fafc] py-24 px-6 md:px-20 relative overflow-hidden flex flex-col items-center"
    >
      {/* ব্যাকগ্রাউন্ড ওয়াটারমার্ক ম্যাপ */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-center bg-no-repeat bg-contain"
        style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/1/15/World_map_blank_black_white.svg')` }}
      ></div>

      {/* টাইটেল হেডার */}
      <motion.div variants={headerVariants} className="relative z-10 text-center max-w-2xl mb-16 space-y-3">
        <span className="text-[#00a2ff] font-bold text-xs tracking-[0.25em] uppercase">
          CLIENT TESTIMONIALS
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051322]">
          What our clients say
        </h2>
        <div className="w-12 h-[3px] bg-[#00a2ff] mx-auto mt-2 rounded-full"></div>
        <p className="text-xs text-slate-500 max-w-lg mx-auto pt-2 leading-relaxed">
          Discover how our precision medical frameworks and elite practitioners leave a lasting impression on our patients' healthcare journey.
        </p>
      </motion.div>

      {/* টেস্টীমোনিয়াল কার্ড গ্রিড */}
      <div className="w-full max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {testimonialsData.map((item) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white p-8 rounded-none border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.08)] flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  
                  {/* ক্লিকযোগ্য ছবি (Image Container with Zoom Handler) */}
                  <div 
                    onClick={() => setZoomedImage(item.image)}
                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-50 shadow-inner cursor-zoom-in relative group/img active:scale-95 transition-transform"
                    title="Click to zoom"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                    />
                  </div>

                  <div className="text-left">
                    <h4 className="font-bold text-sm text-[#051322] tracking-wide">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.role}</p>
                  </div>
                </div>

                <Quote className="w-7 h-7 text-[#00a2ff] opacity-80 transform rotate-180 stroke-[1.5]" />
              </div>

              <p className="text-[12px] text-slate-500 text-left leading-relaxed font-normal italic">
                "{item.review}"
              </p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0080ff] to-[#00a2ff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </motion.div>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 🔹 লাইটবক্স পপআপ: ছবিতে ক্লিক করলে ফুল স্ক্রিন স্মুথ জুম ইফেক্ট */}
      {/* ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)} // বাইরে ক্লিক করলে ক্লোজ হবে
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center cursor-zoom-out"
          >
            {/* ক্লোজ বাটন */}
            <button 
              onClick={() => setZoomedImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* জুমড ইমেজ মোশন */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // ইমেজে ক্লিক করলে যেন ক্লোজ না হয়
              className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-4 border-white shadow-2xl"
            >
              <img 
                src={zoomedImage} 
                alt="Zoomed Reviewer" 
                className="w-full h-full object-cover select-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default Testimonials;











































