// src/components/BlogSection.jsx
import { motion } from 'framer-motion';

const ArticlesSection = () => {
  const articles = [
    {
      id: 1,
      date: "28 JANUARY, 2026",
      author: "BY ADMIN",
      category: "Oral Health",
      title: "Donec dapibus mauris id odio ornare tempus",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 2,
      date: "15 FEBRUARY, 2026",
      author: "BY ADMIN",
      category: "Pediatric Care",
      title: "Quisque suscipit ipsum est, eu venenatis leo",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 3,
      date: "04 MARCH, 2026",
      author: "BY ADMIN",
      category: "Dentistry",
      title: "Mauris neque nisiibus non elementum",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop"
    }
  ];

  // অ্যানিমেশন কনফিগারেশন
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="w-full bg-white py-24 px-6 md:px-16 flex flex-col items-center">
      
      {/* 🔹 হেডার সেকশন (image_43f8af.png এর হুবহু লেআউট) */}
      <div className="w-full max-w-[1140px] flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div className="space-y-2 text-left">
          <span className="text-[#00a2ff] font-bold text-xs tracking-[0.25em] uppercase block">
            LATEST NEWS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#051322]">
            Our Insights & Articles
          </h2>
        </div>
        
        {/* স্লাইডার নেভিগেশন বাটনসমূহ */}
        <div className="flex space-x-3 mt-6 md:mt-0">
          <button className="w-12 h-12 border border-slate-200 flex items-center justify-center text-[#051322] hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 rounded-sm">
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button className="w-12 h-12 border border-slate-200 flex items-center justify-center text-[#051322] hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] transition-all duration-300 rounded-sm">
            <svg className="w-4 h-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* 🔹 আর্টিকেলের ৩টি মেইন কার্ড গ্রিড */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-[1140px] grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {articles.map((article) => (
          <motion.div
            key={article.id}
            variants={cardVariants}
            className="flex flex-col bg-white shadow-[0_10px_35px_rgba(0,0,0,0.02)] border border-slate-100 rounded-sm overflow-hidden group"
          >
            {/* 🔴 ইমেজ পার্ট (image_43f436.png এর হুবহু টিন্ট ও জুম মোশন ইফেক্ট) */}
            <div className="w-full h-[220px] relative overflow-hidden bg-slate-900 cursor-pointer">
              
              {/* লাইট-ব্লু ওভারলে কালার - হোভার বা ক্লিকে ওড়াবে */}
              <div className="absolute inset-0 bg-[#00a2ff]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
              
              <motion.img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />

              {/* ডেট ট্যাগ (বক্সের নিচে নীল রঙের রাইট সাইড ট্রিম) */}
              <div className="absolute bottom-0 right-0 bg-[#00a2ff] text-white text-[11px] font-bold px-4 py-2 z-20 tracking-wider">
                {article.date}
              </div>
            </div>

            {/* 📄 টেক্সট ও কন্টেন্ট কন্টেইনার */}
            <div className="p-6 flex flex-col flex-grow text-left space-y-4">
              
              {/* মেটা ইনফো (Author & Category) */}
              <div className="flex items-center space-x-4 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                <span className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>{article.author}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A9 9 0 0112 3v0a9 9 0 019 9v.75m-18 0a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 12.75m-18 0V17.25A2.25 2.25 0 004.25 19.5h15.5A2.25 2.25 0 0022 17.25V12.75" />
                  </svg>
                  <span>{article.category}</span>
                </span>
              </div>

              {/* 🟢 টাইটেল টেক্সট - টাচ বা হোভার করলে কালারফুল হবে (image_43f0d6.png এর স্টাইল) */}
              <h3 className="font-bold text-[18px] text-[#051322] leading-snug cursor-pointer transition-colors duration-300 hover:text-[#00a2ff] active:text-[#00a2ff]">
                {article.title}
              </h3>

              {/* 🔵 বাটন এরিয়া - হোভার বা ক্লিকে ফুল কালারফুল ব্যাকগ্রাউন্ড হবে (image_43ed33.png এর স্টাইল) */}
              <div className="pt-2">
                <button className="flex items-center space-x-2 text-[12px] font-bold text-[#00a2ff] border border-slate-100 bg-white px-4 py-2.5 transition-all duration-300 hover:bg-[#00a2ff] hover:text-white hover:border-[#00a2ff] rounded-sm group/btn active:scale-95">
                  <span>Read More</span>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5] transform transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6.75 6.75-6.75 6.75M3.75 12h16.5" />
                  </svg>
                </button>
              </div>

            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};

export default ArticlesSection;










































