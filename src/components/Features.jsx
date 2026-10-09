import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Animation-er jonno

// Assets
import { Stethoscope, Baby, Microscope, HeartPulse } from 'lucide-react';
import doctorMan from '../assets/Doctor-man.jpg';

const Features = () => {
  const [activeIconId, setActiveIconId] = useState(1);

  const featuresData = [
    { id: 1, icon: <Stethoscope size={28} />, title: 'Expert Oral Surgery', description: 'Advanced surgical procedures, including wisdom tooth extraction.' },
    { id: 2, icon: <Baby size={28} />, title: 'Pediatric Care', description: 'Gentle, specialized dental care designed specifically for children.' },
    { id: 3, icon: <Microscope size={28} />, title: 'Modern Technology', description: 'Utilizing state-of-the-art diagnostic and treatment tools.' },
    { id: 4, icon: <HeartPulse size={28} />, title: 'Complete Healthcare', description: 'Integrated approach combines expert expertise with compassion.' },
  ];

  // Animation Variants defined kora hoyeche
  const headerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.3, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.6 + i * 0.2, ease: "easeOut" } // Sequential delay
    })
  };

  return (
    <section className="bg-[#0e2a47] py-24 px-6 md:px-16 overflow-hidden">
      <div className="container mx-auto">
        
        {/* Header & Image Section (Sequential Animation) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
          <motion.div 
            className="max-w-2xl text-center md:text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={headerVariants}
          >
            <h5 className="text-[#3ec1d3] font-bold tracking-[4px] uppercase text-xs mb-4">WHAT WE DO</h5>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">What You Can Do <br /> with Carenow</h2>
          </motion.div>

          <motion.div 
            className="relative w-80 h-80 rounded-full border-8 border-[#3ec1d3]/30 flex items-center justify-center shadow-inner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={imageVariants}
          >
            <img src={doctorMan} alt="Doctor" className="w-full h-full object-cover rounded-full" />
          </motion.div>
        </div>

        {/* Features Cards Grid with your Original Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, i) => (
            <motion.div 
              key={feature.id} 
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              onClick={() => setActiveIconId(feature.id)}
              className="bg-white p-12 rounded-sm shadow-xl text-center flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-2"
            >
              
              {/* ICON BOX: Apnar deya icon design thik rakha hoyeche */}
              <div 
                className={`w-20 h-20 mb-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_5px_15px_rgba(62,193,211,0.08)] ${
                  activeIconId === feature.id 
                    ? 'bg-[#3ec1d3]' // Active colorful background
                    : 'bg-[#f8fbfc]' 
                }`}
              >
                <div 
                  className={`transition-colors duration-300 ${
                    activeIconId === feature.id 
                      ? 'text-white' 
                      : 'text-[#3ec1d3]' 
                  }`}
                >
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#0e2a47] mb-5">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;


































