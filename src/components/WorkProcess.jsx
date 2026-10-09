import React from 'react';

import { motion } from 'framer-motion';



// Assets import - spelling as per your assets folder

import cosmeticImg from '../assets/dentist-performing.jpg';

import pediatricImg from '../assets/dentist-teamwork.jpg';

import implantsImg from '../assets/dentist-examining.jpg';



const WorkProcess = () => {

  // Stats.jsx components staggered animation logic

  const containerVariants = {

    hidden: { opacity: 0 },

    visible: {

      opacity: 1,

      transition: {

        staggerChildren: 0.3,

        delayChildren: 0.2

      }

    }

  };



  const fadeInUp = {

    hidden: { opacity: 0, y: 30 },

    visible: {

      opacity: 1,

      y: 0,

      transition: { duration: 0.7, ease: "easeOut" }

    }

  };



  const processData = [

    {

      id: 1,

      title: "Cosmetic Dentistry",

      img: cosmeticImg,

      desc: "Comprehensive dental care services focused on enhancing your smile and oral health."

    },

    {

      id: 2,

      title: "Pediatric Dentistry",

      img: pediatricImg,

      desc: "Specialized dental care for children in a friendly and comfortable environment."

    },

    {

      id: 3,

      title: "Dental Implants",

      img: implantsImg,

      desc: "Advanced dental implant solutions to restore your smile and functionality."

    }

  ];



  return (

    <section className="py-24 bg-white overflow-hidden">

      <div className="container mx-auto px-6">

       

        {/* 1. Header Section - First to show on scroll */}

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          whileInView={{ opacity: 1, y: 0 }}

          viewport={{ once: true }}

          transition={{ duration: 0.6 }}

          className="text-center mb-16"

        >

          <h5 className="text-[#3ec1d3] font-bold tracking-[3px] text-[10px] mb-3 uppercase">

            WORK PROCESS

          </h5>

          <h2 className="text-3xl md:text-5xl font-bold text-[#0e2a47]">

            We Complete Every <br /> Step Carefully

          </h2>

        </motion.div>



        {/* 2. Cards Section - Stats style staggered animation */}

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, amount: 0.2 }}

          variants={containerVariants}

          className="grid grid-cols-1 md:grid-cols-3 gap-12"

        >

          {processData.map((item) => (

            <motion.div

              key={item.id}

              variants={fadeInUp}

              className="flex flex-col items-center text-center group"

            >

              {/* 3. Image Section - 1 no screen square style */}

              <div className="relative mb-8 w-full aspect-square max-w-[350px] overflow-hidden rounded-lg shadow-sm">

                <img

                  src={item.img}

                  alt={item.title}

                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"

                />

              </div>



              {/* 4. Text Content */}

              <h4 className="text-xl font-bold text-[#0e2a47] mb-4">

                {item.title}

              </h4>

              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">

                {item.desc}

              </p>



              {/* 5. Button Section - 2 no screen style */}

              {/* Border thakbe, click/hover korle colorful hobe, text white hobe */}

              <button className="px-8 py-3 border border-[#3ec1d3] text-[#3ec1d3] font-bold text-[12px] uppercase tracking-widest rounded-sm transition-all duration-300 hover:bg-[#3ec1d3] hover:text-white active:bg-[#2daab9] active:text-white">

                Read More →

              </button>

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default WorkProcess; 
































