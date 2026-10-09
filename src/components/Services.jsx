import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Tag, Clock, Stethoscope, Layers } from 'lucide-react';
import ServiceDetailsModal from './ServiceDetailsModal';

// Fallback image assets
import cosmeticImg from '../assets/cosmetic-dentistry.jpg';
import implantImg from '../assets/dental-implants.jpg';
import pediatricImg from '../assets/pediatric-dentistry.jpg';

const initialFallbackServices = [
  {
    serviceId: 105,
    name: 'Root Canal Therapy',
    category: 'Endodontics',
    basePrice: 450,
    serviceDiscountPercent: 15,
    imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Gentle, pain-relieving endodontic therapy with 3D apex locator and micro-rotary files.',
    assignedDentistName: 'Dr. Maya Lin, DMD',
  },
  {
    serviceId: 101,
    name: 'Smile Enhancement',
    category: 'Cosmetic Dentistry',
    basePrice: 650,
    serviceDiscountPercent: 10,
    imageUrl: cosmeticImg,
    shortDescription: 'Transform your smile with advanced cosmetic dentistry, porcelain veneers, and shade matching.',
    assignedDentistName: 'Dr. Elena Rossi, DDS',
  },
  {
    serviceId: 102,
    name: 'Pediatric Care',
    category: 'Pediatric Dentistry',
    basePrice: 180,
    serviceDiscountPercent: 0,
    imageUrl: pediatricImg,
    shortDescription: 'Gentle, fear-free dental care tailored specifically for children, ensuring healthy smiles.',
    assignedDentistName: 'Dr. Sarah Jenkins, DDS',
  },
  {
    serviceId: 103,
    name: 'Dental Implants',
    category: 'Implantology',
    basePrice: 1200,
    serviceDiscountPercent: 12,
    imageUrl: implantImg,
    shortDescription: 'Permanent solutions for missing teeth, restoring function with durable, natural-looking implants.',
    assignedDentistName: 'Dr. Marcus Vance, DDS',
  },
  {
    serviceId: 104,
    name: 'Laser Teeth Whitening',
    category: 'Cosmetic Dentistry',
    basePrice: 280,
    serviceDiscountPercent: 20,
    imageUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=800&auto=format&fit=crop',
    shortDescription: 'Advanced dual-wave in-office laser whitening providing up to 8 shades brighter in 60 mins.',
    assignedDentistName: 'Dr. Adrian Thorne, DDS',
  },
];

const categoryList = [
  'All',
  'Endodontics',
  'Cosmetic Dentistry',
  'Implantology',
  'Pediatric Dentistry',
];

const Services = () => {
  const [services, setServices] = useState(initialFallbackServices);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/services`);
        const json = await res.json();
        if (res.ok && json.success && json.data?.length > 0) {
          setServices(json.data);
        }
      } catch (err) {
        console.warn('Backend services live fetch fallback in use:', err.message);
      }
    };

    fetchServices();
  }, [baseUrl]);

  const handleOpenService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  // Resilient category filtering
  const normalize = (str) => (str || '').toLowerCase().trim();

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter((s) => {
        const itemCat = normalize(s.category);
        const target = normalize(selectedCategory);
        return itemCat === target || itemCat.includes(target) || target.includes(itemCat);
      });

  // Calculate counts for each category
  const getCategoryCount = (cat) => {
    if (cat === 'All') return services.length;
    const target = normalize(cat);
    return services.filter((s) => {
      const itemCat = normalize(s.category);
      return itemCat === target || itemCat.includes(target) || target.includes(itemCat);
    }).length;
  };

  return (
    <section id="services" className="bg-white py-16 md:py-24 px-6 md:px-16 overflow-hidden">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3ec1d3]/10 text-[#0e2a47] font-bold text-xs uppercase tracking-[3px] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#3ec1d3]" />
            <span>WHAT WE DO</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0e2a47] leading-tight">
            Comprehensive Dental <br /> Care Solutions
          </h2>
          <p className="mt-4 text-gray-500 text-sm leading-relaxed">
            Click on any clinical service to view procedure details, transparent pricing, assigned doctors, and live available booking slots.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-12">
          {categoryList.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = getCategoryCount(cat);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? 'bg-[#0e2a47] text-white shadow-[#0e2a47]/30 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#0e2a47]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-[#3ec1d3] text-[#0e2a47]' : 'bg-white text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-[#0e2a47]">No Services Found</h4>
            <p className="text-xs text-gray-500 mt-1">Try clicking 'All' to view all available dental treatments.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 px-4 py-2 bg-[#3ec1d3] text-[#0e2a47] font-bold text-xs rounded-lg cursor-pointer hover:bg-[#34adb9]"
            >
              View All Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {filteredServices.map((service) => {
              const sid = service.serviceId || service.id;
              const price = service.basePrice || service.price;
              const discount = service.serviceDiscountPercent || 0;
              const finalPrice = discount > 0 ? (price * (100 - discount)) / 100 : price;

              return (
                <div
                  key={sid}
                  className="relative flex flex-col items-center group h-full cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                  onClick={() => handleOpenService(sid)}
                >
                  {/* Image Section with Category Badge */}
                  <div className="w-full h-60 overflow-hidden rounded-xl shadow-md relative bg-gray-900">
                    <img
                      src={service.imageUrl || cosmeticImg}
                      alt={service.name || service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 bg-[#0e2a47]/90 backdrop-blur-md text-[#3ec1d3] px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border border-[#3ec1d3]/30">
                      {service.category || 'General'}
                    </span>

                    {/* Promo Badge */}
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-md">
                        <Tag className="w-3 h-3" />
                        <span>{discount}% OFF</span>
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div
                    className="bg-white w-[92%] -mt-12 pt-6 pb-6 px-5 shadow-xl rounded-xl z-10 text-left flex-grow flex flex-col justify-between transition-all duration-300 border border-gray-100 group-hover:border-[#3ec1d3]/40"
                  >
                    <div>
                      {/* Title */}
                      <h3 className="text-lg font-bold text-[#0e2a47] group-hover:text-[#3ec1d3] transition-colors line-clamp-1 mb-2">
                        {service.name || service.title}
                      </h3>

                      {/* Assigned Doctor */}
                      {service.assignedDentistName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mb-3">
                          <Stethoscope className="w-3.5 h-3.5 text-[#3ec1d3]" />
                          <span>{service.assignedDentistName}</span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">
                        {service.shortDescription || service.description}
                      </p>
                    </div>

                    {/* Pricing and CTA Button */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Price</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-[#0e2a47]">${finalPrice}</span>
                          {discount > 0 && (
                            <span className="text-xs line-through text-gray-400">${price}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenService(sid);
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#0e2a47] group-hover:bg-[#3ec1d3] text-white group-hover:text-[#0e2a47] text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Details Backend Flow Modal */}
      <ServiceDetailsModal
        serviceId={selectedServiceId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default Services;
