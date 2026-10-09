import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Calendar,
  Tag,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultFallbackMap = {
  105: {
    service: {
      id: 105,
      slug: 'root-canal',
      name: 'Root Canal Therapy',
      category: 'Endodontics',
      shortDescription: 'Gentle, pain-relieving endodontic therapy with 3D apex locator and micro-rotary files.',
      fullDescription: 'Root canal therapy is a highly effective treatment designed to eliminate bacteria from an infected root canal, prevent reinfection, and save the natural tooth. Our clinic utilizes advanced digital imaging and gentle local anaesthesia to ensure a virtually pain-free experience.',
      durationMinutes: 60,
      imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop',
      procedureSteps: [
        { stepNumber: 1, title: 'Digital X-Ray & Canal Mapping', description: 'High-resolution CBCT scan to pinpoint infection depth.' },
        { stepNumber: 2, title: 'Gentle Disinfection & Cleaning', description: 'Rotary nickel-titanium instruments eliminate bacteria and infected pulp.' },
        { stepNumber: 3, title: 'Biocompatible Sealing', description: 'Gutta-percha thermocured sealing protects against future reinfection.' },
        { stepNumber: 4, title: 'Crown / Restoration Prep', description: 'Structural core buildup prepared for durable natural tooth preservation.' },
      ],
      pricing: {
        basePrice: 450,
        currency: 'USD',
        hasDiscount: true,
        discountPercent: 15,
        discountAmount: 67.5,
        finalPrice: 382.5,
        promoCodeApplied: 'ROOTCANAL15',
        discountReason: '15% Endodontic Relief Special',
      },
    },
    assignedDentist: {
      name: 'Dr. Maya Lin, DMD',
      role: 'Senior Endodontist & Micro-Root Specialist',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
      rating: 4.9,
      experienceYears: 14,
      chamber: 'DentoCare Main Clinic - Austin, TX',
      phone: '+1-512-205-1826',
    },
    availableSlots: [
      { date: 'Tomorrow', day: 'Saturday', availableCount: 4, slots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM'] },
      { date: 'Next Mon', day: 'Monday', availableCount: 5, slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'] },
    ],
  },
  101: {
    service: {
      id: 101,
      slug: 'smile-enhancement',
      name: 'Smile Enhancement & Cosmetic Dentistry',
      category: 'Cosmetic Dentistry',
      shortDescription: 'Comprehensive cosmetic smile design incorporating porcelain veneers, reshaping, and shade matching.',
      fullDescription: 'Customized aesthetic smile design designed to correct chips, gaps, discolouration, and symmetry. We combine 3D facial aesthetic scanning with ultra-thin porcelain veneers.',
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=800&auto=format&fit=crop',
      procedureSteps: [
        { stepNumber: 1, title: 'Facial Aesthetic Digital Scan', description: 'Capture digital smile harmonics and bite mechanics.' },
        { stepNumber: 2, title: 'Mock-up Smile Preview', description: 'Test and preview your customized smile in 3D.' },
        { stepNumber: 3, title: 'Precision Bonding', description: 'Handcrafted ceramic restorations bonded with dental laser light.' },
      ],
      pricing: {
        basePrice: 650,
        currency: 'USD',
        hasDiscount: true,
        discountPercent: 10,
        discountAmount: 65,
        finalPrice: 585,
        promoCodeApplied: 'SMILE10',
        discountReason: '10% Cosmetic Consultation Promo',
      },
    },
    assignedDentist: {
      name: 'Dr. Elena Rossi, DDS',
      role: 'Lead Cosmetic & Smile Design Specialist',
      profileImage: 'https://images.unsplash.com/photo-1594824813591-2292f759c5d0?q=80&w=400&auto=format&fit=crop',
      rating: 4.9,
      experienceYears: 12,
      chamber: 'DentoCare Main Clinic - Austin, TX',
      phone: '+1-512-205-1826',
    },
    availableSlots: [
      { date: 'Tomorrow', day: 'Saturday', availableCount: 3, slots: ['10:00 AM', '02:00 PM', '04:00 PM'] },
      { date: 'Next Mon', day: 'Monday', availableCount: 4, slots: ['09:30 AM', '01:00 PM', '03:30 PM'] },
    ],
  },
  102: {
    service: {
      id: 102,
      slug: 'pediatric-care',
      name: 'Pediatric Dental Care',
      category: 'Pediatric Dentistry',
      shortDescription: 'Gentle, friendly, and fear-free dental care tailored specifically for infants, children, and teens.',
      fullDescription: 'Our pediatric dental department provides preventive cleanings, fluoride varnish, cavity treatments, and gentle orthodontic evaluations in a welcoming, stress-free setting.',
      durationMinutes: 45,
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
      procedureSteps: [
        { stepNumber: 1, title: 'Gentle Visual Exam', description: 'Interactive checkup designed to build trust and comfort.' },
        { stepNumber: 2, title: 'Plaque Cleaning & Polishing', description: 'Soft rubber cup polishing with tasty bubblegum/mint pastes.' },
        { stepNumber: 3, title: 'Protective Fluoride Shield', description: 'Fast-drying varnish application for cavity immunity.' },
      ],
      pricing: {
        basePrice: 180,
        currency: 'USD',
        hasDiscount: false,
        discountPercent: 0,
        discountAmount: 0,
        finalPrice: 180,
      },
    },
    assignedDentist: {
      name: 'Dr. Sarah Jenkins, DDS',
      role: 'Board-Certified Pediatric Dental Specialist',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
      rating: 4.9,
      experienceYears: 11,
      chamber: 'DentoCare Pediatric Wing',
      phone: '+1-512-205-1826',
    },
    availableSlots: [
      { date: 'Tomorrow', day: 'Saturday', availableCount: 4, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
    ],
  },
  103: {
    service: {
      id: 103,
      slug: 'dental-implants',
      name: 'Permanent Dental Implants',
      category: 'Implantology',
      shortDescription: 'State-of-the-art titanium and zirconia implant restorations offering lifetime tooth replacement.',
      fullDescription: 'Permanent, bone-fused implants designed to mimic real tooth roots with unparalleled strength, chew efficiency, and lifelike aesthetics.',
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
      procedureSteps: [
        { stepNumber: 1, title: '3D Bone Density Assessment', description: 'Digital scan to determine optimal fixture trajectory.' },
        { stepNumber: 2, title: 'Implant Post Placement', description: 'Micro-surgical placement with rapid recovery protocol.' },
        { stepNumber: 3, title: 'Custom Zirconia Crown Fixture', description: 'Precision abutment and custom porcelain crown attachment.' },
      ],
      pricing: {
        basePrice: 1200,
        currency: 'USD',
        hasDiscount: true,
        discountPercent: 12,
        discountAmount: 144,
        finalPrice: 1056,
        promoCodeApplied: 'SMILE50',
        discountReason: 'Implant Package Special Offer',
      },
    },
    assignedDentist: {
      name: 'Dr. Marcus Vance, DDS',
      role: 'Prosthodontist & Oral Implantologist',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
      rating: 4.9,
      experienceYears: 16,
      chamber: 'DentoCare Surgical Center',
      phone: '+1-512-205-1826',
    },
    availableSlots: [
      { date: 'Next Mon', day: 'Monday', availableCount: 3, slots: ['09:00 AM', '01:30 PM', '04:00 PM'] },
    ],
  }
};

const ServiceDetailsModal = ({ serviceId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isOpen || !serviceId) return;

    const fetchServiceDetails = async () => {
      setLoading(true);
      setSelectedSlot(null);

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const res = await fetch(`${baseUrl}/api/services/${serviceId}`, {
          method: 'GET',
          headers,
        });

        const json = await res.json();

        if (res.ok && json.success) {
          setData(json);
        } else {
          // Fallback to local structured data
          const fallback = defaultFallbackMap[Number(serviceId)] || defaultFallbackMap[105];
          setData({ success: true, userContext: { isGuest: true, userType: 'guest' }, data: fallback });
        }
      } catch (err) {
        // Network / CORS fallback: gracefully display rich local data
        const fallback = defaultFallbackMap[Number(serviceId)] || defaultFallbackMap[105];
        setData({ success: true, userContext: { isGuest: true, userType: 'guest' }, data: fallback });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, isOpen, baseUrl]);

  if (!isOpen) return null;

  const service = data?.data?.service;
  const dentist = data?.data?.assignedDentist;
  const slots = data?.data?.availableSlots || [];
  const pricing = service?.pricing;
  const userContext = data?.userContext;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col my-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors z-20 cursor-pointer shadow-sm"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="p-16 text-center text-gray-500 my-auto">
              <RefreshCw className="w-10 h-10 text-[#3ec1d3] animate-spin mx-auto mb-3" />
              <p className="font-bold text-sm text-[#0e2a47]">Fetching Service Details & Availability...</p>
              <p className="text-xs text-gray-400 mt-1">Connecting to DentoCare Clinical Backend API</p>
            </div>
          ) : service ? (
            <div className="flex flex-col">
              {/* Header Image and Quick Tags */}
              <div className="relative h-48 sm:h-56 w-full bg-gray-900 overflow-hidden">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a47] via-[#0e2a47]/40 to-transparent" />

                <div className="absolute bottom-4 left-4 sm:left-6 right-4 text-white text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#3ec1d3] text-[#0e2a47] font-extrabold text-[11px] uppercase tracking-wider">
                      {service.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-medium text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#3ec1d3]" />
                      <span>{service.durationMinutes} Mins</span>
                    </span>
                    {userContext?.isGuest ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-[11px] border border-amber-500/30">
                        Guest Visitor
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30">
                        Logged-in: {userContext?.userName || 'Member'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {service.name}
                  </h2>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-5 sm:p-7 space-y-6 text-left">
                {/* Pricing & Discount Banner */}
                <div className="bg-[#f0f9fa] border border-[#3ec1d3]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#0e2a47]">
                        ${pricing?.finalPrice}
                      </span>
                      {pricing?.hasDiscount && (
                        <span className="text-sm line-through text-gray-400 font-semibold">
                          ${pricing?.basePrice}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-medium">/ complete procedure</span>
                    </div>

                    {pricing?.hasDiscount && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        <span>
                          {pricing.discountReason || `${pricing.discountPercent}% Discount Applied`}
                          {pricing.promoCodeApplied ? ` (Code: ${pricing.promoCodeApplied})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-white border border-[#3ec1d3]/40 rounded-xl text-xs font-bold text-[#0e2a47] shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-[#3ec1d3]" />
                      <span>All-Inclusive Clinical Care</span>
                    </span>
                  </div>
                </div>

                {/* Service Overview & Full Description */}
                <div>
                  <h4 className="text-sm font-bold text-[#0e2a47] uppercase tracking-wider mb-2">
                    Clinical Overview
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.fullDescription || service.shortDescription}
                  </p>
                </div>

                {/* Key Procedure Steps */}
                {service.procedureSteps && service.procedureSteps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[#0e2a47] uppercase tracking-wider mb-3">
                      Treatment Workflow
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.procedureSteps.map((step, idx) => (
                        <div key={idx} className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-[#3ec1d3] text-[#0e2a47] font-bold text-[11px] flex items-center justify-center">
                              {step.stepNumber || idx + 1}
                            </span>
                            <span className="font-bold text-xs text-[#0e2a47]">{step.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed pl-7">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Specialist Card */}
                {dentist && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={dentist.profileImage}
                        alt={dentist.name}
                        className="w-14 h-14 rounded-xl object-cover border border-[#3ec1d3]/40 shadow-sm"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-[#3ec1d3] uppercase tracking-wider">
                          Assigned Lead Doctor
                        </span>
                        <h4 className="text-base font-extrabold text-[#0e2a47] leading-tight">
                          {dentist.name}
                        </h4>
                        <p className="text-xs text-gray-500">{dentist.role}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <p className="text-gray-400 font-medium">{dentist.chamber || 'Main Clinic'}</p>
                      <p className="font-bold text-[#0e2a47] mt-0.5">{dentist.phone}</p>
                    </div>
                  </div>
                )}

                {/* Available Appointment Slots Selection */}
                {slots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[#0e2a47] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#3ec1d3]" />
                      <span>Next Available Appointment Slots</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {slots.slice(0, 3).map((daySlot, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-[#3ec1d3] transition-colors"
                        >
                          <div className="text-xs font-bold text-[#0e2a47] mb-2 flex items-center justify-between">
                            <span>{daySlot.day}</span>
                            <span className="text-[10px] text-gray-400 font-normal">{daySlot.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {daySlot.slots.slice(0, 4).map((time, tIdx) => {
                              const isSelected = selectedSlot === `${daySlot.date}_${time}`;
                              return (
                                <button
                                  key={tIdx}
                                  onClick={() => setSelectedSlot(isSelected ? null : `${daySlot.date}_${time}`)}
                                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#3ec1d3] text-[#0e2a47] scale-105 shadow-sm'
                                      : 'bg-gray-100 hover:bg-[#3ec1d3]/20 text-gray-700'
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer with Book Appointment CTA */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto rounded-b-2xl">
                <div className="text-xs text-gray-500 text-center sm:text-left">
                  <span>Fast online reservation • No advance cancellation fees</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Close
                  </button>

                  <Link
                    to={`/book?service=${encodeURIComponent(service.name)}&serviceId=${service.id}&dentist=${encodeURIComponent(dentist?.name || '')}${selectedSlot ? `&slot=${encodeURIComponent(selectedSlot)}` : ''}`}
                    onClick={onClose}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#0c1c2b] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceDetailsModal;
