import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Stethoscope, 
  Sparkles, 
  ShieldCheck,
  Calendar,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import doctorWoman from '../assets/Doctor-woman.jpg';
import minimalIcon from '../assets/minimal.jpg';
import queueIcon from '../assets/queue.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const FALLBACK = {
  name: 'DentoCare Dental Clinic',
  clinicHistory:
    'Founded in 2012, DentoCare Dental Clinic has provided world-class oral healthcare and advanced dental treatments to over 25,000 patients. Our clinic integrates cutting-edge dental tech with personalized therapies to build brilliant smiles.',
  description:
    'Our clinic integrates cutting-edge dental tech with personalized therapies to build brilliant smiles. From diagnostic analysis to full reconstructive oral aesthetics, we prioritize your long-term wellness in a calm, modern environment.',
  bannerImage:
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop',
  doctorProfiles: [
    {
      name: 'Dr. Sarah Johnson',
      designation: 'Chief Orthodontist & Dental Surgeon',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
      bio: 'Over 14 years of clinical experience in smile design, orthodontic treatments, and Invisalign solutions.',
    },
    {
      name: 'Dr. Michael Chen',
      designation: 'Senior Periodontist & Implant Specialist',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
      bio: 'Expert in dental implants, gum disease treatment, and restorative cosmetic oral surgery.',
    },
  ],
  labImages: [
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
  ],
  workingHours: {
    monday: '9:00 AM – 8:00 PM',
    tuesday: '9:00 AM – 8:00 PM',
    wednesday: '9:00 AM – 8:00 PM',
    thursday: '9:00 AM – 8:00 PM',
    friday: '2:00 PM – 8:00 PM',
    saturday: '9:00 AM – 8:00 PM',
    sunday: 'Closed',
    summary: 'Sat–Thu: 9:00 AM – 8:00 PM · Fri: 2:00 PM – 8:00 PM',
  },
  facilities: [
    'Advanced 3D Oral CT & Digital X-Ray',
    'Pain-Free Laser Therapy & Whitening',
    'Class-B Autoclave Sterilization Room',
    'Ultra-HD Intraoral Diagnostic Cameras',
    'Comfortable Pediatric Care Lounge',
    'In-House CAD/CAM Dental Prosthetics Lab',
  ],
  features: [
    'Advanced Equipment',
    'Professional Experts',
    'Sterilized Global Standards',
    '24/7 Patient Support',
  ],
  address: '123 Dental Street, Suite 400, Austin, TX 78701',
  phone: '+1 (512) 205-1826',
  email: 'hello@dentocare.com',
  mapLink: 'https://maps.google.com/?q=Austin+TX',
};

const formatHours = (hours) => {
  if (!hours) return 'Sat–Thu: 9:00 AM – 8:00 PM · Fri: 2:00 PM – 8:00 PM';
  if (typeof hours === 'string') return hours;
  return hours.summary || 'Sat–Thu: 9:00 AM – 8:00 PM · Fri: 2:00 PM – 8:00 PM';
};

const About = () => {
  const [clinic, setClinic] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let res = await fetch(`${API_BASE}/api/about/clinic`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/clinic-info`);
        }
        const json = await res.json();
        if (json.success && json.data) {
          setClinic({ ...FALLBACK, ...json.data });
        }
      } catch (err) {
        console.error('About clinic fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const doctorList = clinic.doctorProfiles?.length ? clinic.doctorProfiles : FALLBACK.doctorProfiles;
  const labImageList = clinic.labImages?.length ? clinic.labImages : FALLBACK.labImages;
  const facilityList = clinic.facilities?.length ? clinic.facilities : FALLBACK.facilities;
  const features = clinic.features?.length ? clinic.features.slice(0, 4) : FALLBACK.features;
  const featureIcons = [minimalIcon, queueIcon];

  return (
    <section className="relative z-20 pb-20 px-4 sm:px-6 md:px-16 bg-[#fbfdfd]">
      
      {/* ─── 1. Main Overview Card ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-14 flex flex-col lg:flex-row items-center gap-12 -mt-20 border border-gray-100">
        
        {/* Left Side: Photo & Floating Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full lg:w-1/2 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#e3f7fa] to-[#d2f1f7] rounded-3xl transform -rotate-2 -z-10 shadow-inner"></div>
          <img
            src={doctorWoman}
            alt="Expert Dental Care"
            className="w-full max-h-[460px] object-contain mx-auto drop-shadow-md"
          />
          
          <div className="absolute -bottom-5 left-4 md:left-8 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-teal-50 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#3ec1d3]/15 text-[#0fa3b8] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">State-Certified</p>
              <h4 className="text-sm font-bold text-[#0e2a47]">100% Sterilized Care</h4>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Info & History */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
          className="w-full lg:w-1/2"
        >
          <motion.div variants={fadeInRight} className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3ec1d3] animate-pulse"></span>
            <span className="text-[#3ec1d3] font-extrabold tracking-[2.5px] text-xs uppercase">
              ABOUT OUR CLINIC
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInRight}
            className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#0e2a47] leading-tight mb-4 tracking-tight"
          >
            {clinic.name || 'DentoCare Dental Clinic'}
          </motion.h2>

          <motion.p variants={fadeInRight} className="text-gray-600 text-sm md:text-[15px] leading-relaxed mb-4">
            {clinic.description || FALLBACK.description}
          </motion.p>

          {/* Clinic History Highlight Box */}
          {clinic.clinicHistory && (
            <motion.div 
              variants={fadeInRight}
              className="bg-[#f2fbfa] border-l-4 border-[#3ec1d3] p-4 rounded-r-xl mb-6 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[#0e2a47] font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-[#3ec1d3]" />
                <span>Our Heritage & Experience</span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {clinic.clinicHistory}
              </p>
            </motion.div>
          )}

          {/* Quick Feature Badges */}
          <motion.div variants={fadeInRight} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, i) => (
              <div key={`${feature}-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100/80">
                <img src={featureIcons[i % featureIcons.length]} alt="" className="w-8 h-8 object-contain" />
                <span className="text-xs md:text-sm font-bold text-[#0e2a47]">{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* Location & Hours Quick Snapshot */}
          <motion.div variants={fadeInRight} className="text-xs md:text-sm text-gray-500 space-y-1.5 mb-8 border-t border-gray-100 pt-4">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3ec1d3] shrink-0" />
              <span><strong className="text-[#0e2a47]">Hours:</strong> {formatHours(clinic.workingHours || clinic.openingHours)}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#3ec1d3] shrink-0" />
              <span><strong className="text-[#0e2a47]">Location:</strong> {clinic.address || FALLBACK.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#3ec1d3] shrink-0" />
              <span>
                <strong className="text-[#0e2a47]">Contact:</strong>{' '}
                <a href={`tel:${clinic.phone}`} className="hover:text-[#3ec1d3] font-medium transition-colors">{clinic.phone || FALLBACK.phone}</a>
                {' · '}
                <a href={`mailto:${clinic.email}`} className="hover:text-[#3ec1d3] font-medium transition-colors">{clinic.email || FALLBACK.email}</a>
              </span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeInRight} className="flex flex-wrap items-center gap-4">
            <Link to="/book">
              <button className="bg-[#3ec1d3] hover:bg-[#0e2a47] text-white font-bold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-sm flex items-center gap-2">
                <span>Book Appointment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            {clinic.mapLink && (
              <a 
                href={clinic.mapLink} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs md:text-sm font-semibold text-[#0e2a47] hover:text-[#3ec1d3] flex items-center gap-1.5 transition-colors"
              >
                <span>View Google Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        </motion.div>

      </div>

      {/* ─── 2. Clinic Facilities Section ──────────────────────────────── */}
      {facilityList.length > 0 && (
        <div className="max-w-7xl mx-auto mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h5 className="text-[#3ec1d3] font-extrabold tracking-[2px] text-xs uppercase mb-2">
              CUTTING-EDGE INFRASTRUCTURE
            </h5>
            <h3 className="text-2xl md:text-3xl font-black text-[#0e2a47]">
              Our Clinical Facilities & Technologies
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Equipped with global-grade dental technologies for pain-free precision diagnosis and smile transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {facilityList.map((facility, idx) => (
              <motion.div
                key={`${facility}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#3ec1d3]/40 transition-all group flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-[#f0f9fa] text-[#3ec1d3] group-hover:bg-[#3ec1d3] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0e2a47] text-sm md:text-[15px] group-hover:text-[#3ec1d3] transition-colors">
                    {facility}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Certified standard surgical & clinical compliance
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 3. Doctor Profiles Section ───────────────────────────────── */}
      {doctorList.length > 0 && (
        <div className="max-w-7xl mx-auto mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h5 className="text-[#3ec1d3] font-extrabold tracking-[2px] text-xs uppercase mb-2">
              MEET OUR LEADERS
            </h5>
            <h3 className="text-2xl md:text-3xl font-black text-[#0e2a47]">
              Doctor Profiles & Clinical Specialists
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Decades of combined clinical mastery in cosmetic dentistry, periodontics, surgery, and orthodontics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {doctorList.map((doc, idx) => (
              <motion.div
                key={doc._id || doc.name || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-inner">
                  <img
                    src={doc.photoUrl || doctorWoman}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = doctorWoman;
                    }}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <div className="inline-block px-3 py-1 bg-[#f0f9fa] text-[#0fa3b8] rounded-full text-xs font-bold mb-2">
                    {doc.designation}
                  </div>
                  <h4 className="text-xl font-bold text-[#0e2a47] mb-2">{doc.name}</h4>
                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed mb-4">
                    {doc.bio || 'Dedicated to providing gentle, advanced oral health treatments.'}
                  </p>
                  <Link 
                    to="/book" 
                    className="text-xs font-bold text-[#3ec1d3] hover:text-[#0e2a47] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Consult with {doc.name.split(' ')[1] || 'Doctor'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. Dental Lab & Clinic Photos Gallery ───────────────────── */}
      {labImageList.length > 0 && (
        <div className="max-w-7xl mx-auto mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h5 className="text-[#3ec1d3] font-extrabold tracking-[2px] text-xs uppercase mb-2">
              MODERN LAB & ENVIRONMENT
            </h5>
            <h3 className="text-2xl md:text-3xl font-black text-[#0e2a47]">
              Dental Lab & Clinical Infrastructure
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Take a visual tour inside our hygienic surgical suites, CAD/CAM prosthetic laboratories, and patient lounges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {labImageList.map((imgUrl, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative group rounded-2xl overflow-hidden shadow-md h-64 bg-gray-100"
              >
                <img
                  src={imgUrl}
                  alt={`Clinic Lab Suite ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a47]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                  <p className="text-white text-xs font-bold tracking-wide">
                    Sterilized Dental Lab & Diagnostic Suite #{idx + 1}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. Working Hours Breakdown ──────────────────────────────── */}
      {clinic.workingHours && typeof clinic.workingHours === 'object' && (
        <div className="max-w-7xl mx-auto mt-20 bg-white rounded-2xl p-8 border border-gray-100 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-[#3ec1d3] font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Visit Us On Schedule</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#0e2a47]">
                Weekly Operating Hours
              </h3>
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-500 bg-[#f0f9fa] px-4 py-2 rounded-lg text-[#0fa3b8]">
              {clinic.workingHours.summary || 'Open 6 Days a Week for Routine & Emergency Care'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const val = clinic.workingHours[day];
              const isClosed = val === 'Closed' || !val;
              return (
                <div
                  key={day}
                  className={`p-3.5 rounded-xl text-center border transition-all ${
                    isClosed
                      ? 'bg-gray-50 border-gray-100 text-gray-400'
                      : 'bg-[#fbfdfd] border-teal-100/60 shadow-xs'
                  }`}
                >
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                    {day.substring(0, 3)}
                  </span>
                  <span
                    className={`block text-xs font-bold mt-1 ${
                      isClosed ? 'text-red-400' : 'text-[#0e2a47]'
                    }`}
                  >
                    {val || 'Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
};

export default About;
