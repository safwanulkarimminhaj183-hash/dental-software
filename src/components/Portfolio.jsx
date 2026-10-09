import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

// Assets
import laserTreatment from '../assets/laser-treatment.jpg';
import confidentDentist from '../assets/confident-dentist.jpg';
import dentistOperating from '../assets/dentist-operating.jpg';
import dentalCheckup from '../assets/dental-checkup.jpg';
import smilingWithPatient from '../assets/smiling-with-patient.jpg';

const Portfolio = () => {
  // মোবাইলে ক্লিক ট্র্যাক করার জন্য স্টেট (এখানে ডিফাইন করা হয়েছে)
  const [activeCard, setActiveCard] = useState(null); 

  const portfolioData = [
    {
      id: 1,
      image: smilingWithPatient,
      title: 'Smile Rejuvenation',
      description: 'Comprehensive transformation for a youthful smile.',
    },
    {
      id: 2,
      image: dentalCheckup,
      title: 'Pediatric Care',
      description: 'Gentle dental care for healthy, confident children.',
    },
    {
      id: 3,
      image: dentistOperating,
      title: 'Expert Oral Surgery',
      description: 'Advanced surgical procedures with expert precision.',
    },
    {
      id: 4,
      image: confidentDentist,
      title: 'Confident Profiles',
      description: 'Transforming confidence with orthodontic solutions.',
    },
    {
      id: 5,
      image: laserTreatment,
      title: 'Advanced Laser Care',
      description: 'Minimally invasive treatment with modern laser tech.',
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <section className="bg-white py-16 md:py-24 px-6 md:px-16 overflow-hidden">
      <motion.div 
        className="container mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Step 1: Bam Diker Text Section */}
          <motion.div variants={itemVariants} className="md:w-1/3 flex flex-col justify-start">
            <h5 className="text-[#3ec1d3] font-bold tracking-[3px] uppercase text-xs mb-3">
              PORTFOLIO
            </h5>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0e2a47] mb-6 leading-tight">
              Clinical <br /> Success Stories
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-sm mb-6">
              Discover how our modern dental care and expertise transform smiles and enhance life quality through advanced techniques and personalized treatment plans for every patient.
            </p>
            <Link
              to="/smile-gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0e2a47] hover:bg-[#3ec1d3] text-white hover:text-[#0e2a47] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md group w-fit cursor-pointer"
            >
              <span>Explore Smile Gallery</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Step 2: Dan Diker Chobir Grid Section */}
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top 2 Grid Items */}
            <div className="grid grid-cols-2 gap-6 md:col-span-2">
              {portfolioData.slice(0, 2).map((item, index) => (
                <motion.div 
                  key={item.id} 
                  variants={imageVariants}
                  className="relative group overflow-hidden rounded-sm shadow-lg"
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute left-3 bottom-6 md:left-6 bg-white p-4 md:p-6 rounded-sm shadow-lg z-10 text-left transition-all duration-300 ${
                    index === 0 
                      ? 'opacity-100' 
                      : 'opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}>
                    <h3 className="text-lg md:text-xl font-bold text-[#0e2a47] mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-xs md:text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom 3 Grid Items */}
            <div className="grid grid-cols-3 gap-6 md:col-span-2">
              {portfolioData.slice(2, 5).map((item) => (
                <motion.div 
                  key={item.id} 
                  variants={imageVariants}
                  // মোবাইল এবং ডেস্কটপ দুটোর জন্যই ইন্টারেকশন হ্যান্ডেল করা হয়েছে
                  onClick={() => setActiveCard(activeCard === item.id ? null : item.id)}
                  onMouseEnter={() => setActiveCard(item.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  className="relative group overflow-hidden rounded-sm shadow-md cursor-pointer"
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* ক্লিকের ওপর ভিত্তি করে এখানে opacity এবং সাদা টেক্সট কালার নিয়ন্ত্রণ করা হচ্ছে */}
                  <div className={`absolute inset-0 bg-black/50 p-3 md:p-6 flex flex-col justify-end text-left transition-opacity duration-300 ${
                    activeCard === item.id 
                      ? 'opacity-100' 
                      : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <h3 className="text-sm md:text-lg font-bold text-white mb-1 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-white md:text-white/80 text-[10px] md:text-xs leading-tight">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Portfolio;



















