// src/components/TeamSection.jsx
import { motion } from 'framer-motion';

const TeamSection = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Adrian Thorne",
      role: "Senior Orthodontist",
      desc: "Providing top-tier orthodontic treatments with a focus on modern clear aligners and comprehensive patient care systems.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150&auto=format&fit=crop",
      hasSocials: false
    },
    {
      id: 2,
      name: "Dr. Eliana Vance",
      role: "Pediatric Dentist",
      desc: "Dedicated to making dental visits a fun and anxiety-free experience for children while promoting long-term oral health habits.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&auto=format&fit=crop",
      hasSocials: true // ২ নম্বর কার্ডের নিচে সোশ্যাল আইকন থাকবে
    },
    {
      id: 3,
      name: "Dr. Marcus Sterling",
      role: "Maxillofacial Surgeon",
      desc: "Specializing in advanced corrective jaw surgeries, dental implants, and complex facial reconstructive procedures.",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=150&auto=format&fit=crop",
      hasSocials: false
    }
  ];

  // স্ক্রোল অ্যানিমেশন ভেরিয়েন্ট
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="w-full bg-[#f8fafc] py-24 px-6 md:px-16 flex flex-col items-center">
      
      {/* 🔹 হেডার এরিয়া (image_4ece78.png স্টাইল) */}
      <div className="text-center max-w-2xl mb-16 space-y-2">
        <span className="text-[#00a2ff] font-bold text-xs tracking-[0.25em] uppercase block">
          MEET OUR TEAM
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051322]">
          Meet Our Doctors
        </h2>
        <div className="w-12 h-[3px] bg-[#00a2ff] mx-auto mt-3 rounded-full"></div>
      </div>

      {/* 🔹 কার্ড গ্রিড লেআউট */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-[1140px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {teamMembers.map((member) => (
          <motion.div
            key={member.id}
            variants={cardVariants}
            className="bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between text-left relative group transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
          >
            <div>
              {/* 🔴 কার্ড হেডার: ছবি + নাম-পদবি (১ নম্বর স্ক্রিনশটের মতো বামে-ডানে) */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* ছোট গোল ইমেজ - ক্লিক করলে হালকা জুম হবে */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 1.15 }}
                    className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer flex-shrink-0"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* নাম ও রোল */}
                  <div>
                    <h3 className="font-bold text-[16px] text-[#051322] tracking-wide">
                      {member.name}
                    </h3>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* ডেকোরেটিভ কোটেশন মার্ক আইকন (১ নম্বর স্ক্রিনশটের মতো নীল রঙের) */}
                <span className="text-[#00a2ff] opacity-20 text-4xl font-serif select-none">“</span>
              </div>

              {/* 📄 ডেসক্রিপশন টেক্সট (সবগুলোর আলাদা) */}
              <p className="text-[14px] text-slate-500 leading-relaxed font-normal">
                {member.desc}
              </p>
            </div>

            {/* 🔹 ২ নম্বর কার্ডের নিচের স্পেশাল সোশ্যাল আইকনসমূহ */}
            {member.hasSocials && (
              <div className="flex items-center space-x-3 pt-5 mt-5 border-t border-slate-100 justify-start">
                
                {/* Facebook */}
                <a
                  href="#HeroTwo"
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 shadow-sm"
                  title="Go to HeroTwo"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="#HeroTwo"
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 shadow-sm"
                  title="Go to HeroTwo"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#HeroTwo"
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 shadow-sm"
                  title="Go to HeroTwo"
                >
                  <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" h="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#HeroTwo"
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 shadow-sm"
                  title="Go to HeroTwo"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default TeamSection;


































