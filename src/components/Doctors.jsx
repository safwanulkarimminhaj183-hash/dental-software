import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';

// Icons
import { FaFacebookF, FaTwitter, FaInstagram, FaRegEnvelope } from 'react-icons/fa'; 
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// Assets
import doc1 from '../assets/Doctor-man1.jpg';
import doc2 from '../assets/Doctor-woman2.jpg';
import doc3 from '../assets/Doctor-woman3.jpg';

const Doctors = () => {
  const doctorsData = [
    { id: 1, name: 'Doris Jordan', role: 'Design Expert', image: doc1 },
    { id: 2, name: 'Diana Wagner', role: 'Design Expert', image: doc2 },
    { id: 3, name: 'Harry Garrett', role: 'Design Expert', image: doc3 },
    { id: 4, name: 'Doris Jordan', role: 'Design Expert', image: doc1 },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: "easeOut" } 
    }
  };

  return (
    <section className="bg-white py-20 px-6 md:px-16 overflow-hidden">
      <motion.div 
        className="container mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        
        {/* Step 1: Header (Title & Navigation) */}
        <motion.div variants={itemVariants} className="flex items-end justify-between mb-12">
          <div>
            <h5 className="text-gray-500 font-bold tracking-[3px] uppercase text-xs mb-3">
              MEET OUR TEAM
            </h5>
            <h2 className="text-4xl font-bold text-[#0e2a47]">Meet Our Doctors</h2>
          </div>

          <div className="flex gap-2">
            <button className="prev-btn w-12 h-12 border border-gray-200 flex items-center justify-center text-[#0e2a47] hover:bg-[#3ec1d3] hover:text-white transition-all">
              <HiChevronLeft size={24} />
            </button>
            <button className="next-btn w-12 h-12 bg-[#3ec1d3] flex items-center justify-center text-white hover:bg-[#0e2a47] transition-all">
              <HiChevronRight size={24} />
            </button>
          </div>
        </motion.div>

        {/* Swiper Section */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            prevEl: '.prev-btn',
            nextEl: '.next-btn',
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mySwiper"
        >
          {doctorsData.map((doctor) => (
            <SwiperSlide key={doctor.id}>
              {/* Step 2: Doctor Card sequential animation */}
              <motion.div variants={itemVariants} className="bg-[#f8f9fa] rounded-sm overflow-hidden group">
                
                {/* Picture Section */}
                <div className="h-[400px] overflow-hidden flex items-end justify-center bg-[#f0f2f5]">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Step 3: Info & Social Media Section */}
                <motion.div 
                  variants={itemVariants}
                  className="p-8 text-center bg-white"
                >
                  <h3 className="text-xl font-bold text-[#0e2a47] mb-1">{doctor.name}</h3>
                  <p className="text-gray-400 text-sm mb-6 font-medium uppercase">
                    {doctor.role}
                  </p>
                  
                  {/* Social Icons */}
                  <div className="flex justify-center gap-5 py-3 px-8 border border-gray-100 rounded-full w-fit mx-auto shadow-sm transition-all duration-300 hover:border-[#3ec1d3]/30">
                    <FaFacebookF size={14} className="text-gray-400 hover:text-[#3ec1d3] cursor-pointer" />
                    <FaTwitter size={14} className="text-gray-400 hover:text-[#3ec1d3] cursor-pointer" />
                    <FaRegEnvelope size={14} className="text-gray-400 hover:text-[#3ec1d3] cursor-pointer" />
                    <FaInstagram size={14} className="text-gray-400 hover:text-[#3ec1d3] cursor-pointer" />
                  </div>
                </motion.div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default Doctors;




































