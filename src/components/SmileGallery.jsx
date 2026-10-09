import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Filter, 
  Clock, 
  User, 
  ShieldCheck, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Maximize2, 
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  'All Cases',
  'Teeth Whitening',
  'Dental Implants',
  'Braces',
  'Veneers',
  'Smile Makeover',
];

const SmileGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Cases');
  const [cases, setCases] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState({}); // { [caseId]: 'after' | 'before' }
  const [selectedCaseModal, setSelectedCaseModal] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Directly use fallback data for now to ensure content displays
  const loadFallbackData = () => {
    const allFallbackCases = [
      {
        _id: '1',
        caseId: 'SC-102938',
        title: 'Full Arch Dental Implant Reconstruction',
        category: 'Dental Implants',
        doctorName: 'Dr. Adrian Thorne, DDS',
        patientAge: 52,
        patientGender: 'Male',
        treatmentDuration: '4 Months',
        procedureDetails: 'CBCT 3D Guided Implant Surgery, All-on-4 Titanium Implants, Fixed Zirconia Bridge.',
        tags: ['Implants', 'Full Arch', 'Zirconia'],
        isBefore_After: true,
        beforeImage: {
          processedUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=480&auto=format&fit=crop',
        },
        afterImage: {
          processedUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=480&auto=format&fit=crop',
        },
        viewCount: 428,
      },
      {
        _id: '2',
        caseId: 'SC-203941',
        title: 'Laser Teeth Whitening & Enamel Remineralization',
        category: 'Teeth Whitening',
        doctorName: 'Dr. Maya Lin, DMD',
        patientAge: 29,
        patientGender: 'Female',
        treatmentDuration: '2 Sessions',
        procedureDetails: 'Zoom Laser In-Office Whitening 38% Hydrogen Peroxide with Desensitizing Protection.',
        tags: ['Whitening', 'Laser', 'Cosmetic'],
        isBefore_After: true,
        beforeImage: {
          processedUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=480&auto=format&fit=crop',
        },
        afterImage: {
          processedUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=480&auto=format&fit=crop',
        },
        viewCount: 612,
      },
      {
        _id: '3',
        caseId: 'SC-304952',
        title: 'Custom E-Max Porcelain Veneers (Upper 8 Teeth)',
        category: 'Veneers',
        doctorName: 'Dr. Marcus Vance, DDS',
        patientAge: 34,
        patientGender: 'Female',
        treatmentDuration: '3 Weeks',
        procedureDetails: 'Digital Smile Design (DSD), Minimal Prep Veneers 0.3mm, Gingival Contouring.',
        tags: ['Veneers', 'E-Max', 'Porcelain'],
        isBefore_After: true,
        beforeImage: {
          processedUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=480&auto=format&fit=crop',
        },
        afterImage: {
          processedUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=480&auto=format&fit=crop',
        },
        viewCount: 389,
      },
      {
        _id: '4',
        caseId: 'SC-405963',
        title: 'Adult Orthodontics: Complex Malocclusion Fix',
        category: 'Braces',
        doctorName: 'Dr. Adrian Thorne, DDS',
        patientAge: 24,
        patientGender: 'Male',
        treatmentDuration: '14 Months',
        procedureDetails: 'Clear Aesthetic Ceramic Braces, NiTi Archwires, Interproximal Enamel Reduction.',
        tags: ['Braces', 'Orthodontics', 'Alignment'],
        isBefore_After: true,
        beforeImage: {
          processedUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=480&auto=format&fit=crop',
        },
        afterImage: {
          processedUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=480&auto=format&fit=crop',
        },
        viewCount: 295,
      },
      {
        _id: '5',
        caseId: 'SC-506974',
        title: 'Complete Smile Makeover: Veneers + Whitening',
        category: 'Smile Makeover',
        doctorName: 'Dr. Elena Rossi, DDS',
        patientAge: 38,
        patientGender: 'Female',
        treatmentDuration: '6 Weeks',
        procedureDetails: 'Laser Whitening, 10-unit Porcelain Veneers, Gum Contouring, Bite Correction.',
        tags: ['Smile Makeover', 'Veneers', 'Whitening'],
        isBefore_After: true,
        beforeImage: {
          processedUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=480&auto=format&fit=crop',
        },
        afterImage: {
          processedUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=900&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=480&auto=format&fit=crop',
        },
        viewCount: 542,
      }
    ];

    // Filter by selected category
    const filteredCases = selectedCategory === 'All Cases'
      ? allFallbackCases
      : allFallbackCases.filter(c => c.category === selectedCategory);

    setCases(filteredCases);
    setLoading(false);
  };

  useEffect(() => {
    loadFallbackData();
  }, [selectedCategory]);

  const toggleImageMode = (caseId, mode) => {
    setActiveViewMode((prev) => ({
      ...prev,
      [caseId]: mode,
    }));
  };

  // Helper to format image URLs
  const getImageUrl = (imgObj, fallbackUrl) => {
    if (!imgObj) return fallbackUrl;
    const url = imgObj.processedUrl || imgObj.thumbnailUrl;
    if (!url) return fallbackUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${baseUrl}${url}`;
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* ─── Header Banner ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3ec1d3]/10 border border-[#3ec1d3]/30 text-[#0e2a47] font-semibold text-xs uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4 text-[#3ec1d3]" />
          <span>Clinical Excellence & Smile Transformation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0e2a47] tracking-tight">
          Smile Gallery & <span className="text-[#3ec1d3]">Case Studies</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-sm sm:text-base leading-relaxed">
          Explore real clinical before-and-after cases treated by our dental specialists. Every case is documented with strict privacy standards and verified by lead doctors.
        </p>

        {/* HIPAA & Security Assurance Banner */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm text-xs text-gray-600">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>HIPAA Compliant & De-identified</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-1.5 text-[#0e2a47] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#3ec1d3]" />
            <span>Doctor Approved Clinical Results</span>
          </div>
          <span className="hidden sm:inline text-gray-300">•</span>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>High-Res WebP Optimized</span>
          </div>
        </div>
      </div>

      {/* ─── Category Filter Navigation Bar ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All Cases' ? cases.length : categoryCounts[cat];

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm ${
                  isSelected
                    ? 'bg-[#0e2a47] text-white shadow-[#0e2a47]/20 shadow-md scale-105'
                    : 'bg-white text-gray-600 hover:text-[#0e2a47] hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#3ec1d3] text-[#0e2a47]' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Cases Grid ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-10 h-10 text-[#3ec1d3] animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-sm">Connecting to backend gallery database...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-sm">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#0e2a47]">No Smile Cases in this Category</h3>
            <p className="text-gray-500 text-xs mt-1">Please select another category or check back soon.</p>
            <button
              onClick={() => setSelectedCategory('All Cases')}
              className="mt-4 px-4 py-2 bg-[#3ec1d3] text-[#0e2a47] rounded-lg font-bold text-xs hover:bg-[#34adb9] transition-colors"
            >
              Show All Cases
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((item) => {
              const currentMode = activeViewMode[item._id] || 'after';
              const isAfter = currentMode === 'after';
              const displayImg = isAfter
                ? getImageUrl(item.afterImage, item.beforeImage?.processedUrl)
                : getImageUrl(item.beforeImage, item.afterImage?.processedUrl);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  key={item._id || item.caseId}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container with Before/After Toggle */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-900">
                    <img
                      src={displayImg}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Watermark Banner */}
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white tracking-wide border border-white/10 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#3ec1d3]" />
                      <span>© DentoCare Clinic</span>
                    </div>

                    {/* Case ID Badge (HIPAA Anonymized) */}
                    <div className="absolute top-3 left-3 bg-[#0e2a47]/80 backdrop-blur-md text-[#3ec1d3] px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider border border-[#3ec1d3]/30">
                      {item.caseId || 'CASE STUDY'}
                    </div>

                    {/* Before / After Selector Pills */}
                    {item.isBefore_After && item.beforeImage && item.afterImage && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/20 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageMode(item._id, 'before');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            !isAfter ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          Before
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageMode(item._id, 'after');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            isAfter ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          After
                        </button>
                      </div>
                    )}

                    {/* Quick Modal Zoom Button */}
                    <button
                      onClick={() => setSelectedCaseModal(item)}
                      className="absolute bottom-3 left-3 p-2 bg-white/90 hover:bg-white text-[#0e2a47] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="View Clinical Details"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Badge & Duration */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#3ec1d3]/15 text-[#0e2a47] font-bold text-xs">
                          {item.category}
                        </span>
                        {item.treatmentDuration && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {item.treatmentDuration}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-[#0e2a47] group-hover:text-[#3ec1d3] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Doctor Name */}
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-600 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-[#3ec1d3]" />
                        <span>Lead Specialist: <strong className="text-[#0e2a47]">{item.doctorName}</strong></span>
                      </div>

                      {/* Clinical Description / Procedure */}
                      <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {item.description || item.procedureDetails || 'Advanced clinical case executed with computerized precision and cosmetic alignment.'}
                      </p>

                      {/* Clinical Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: View Details CTA */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.viewCount || 100}+ views</span>
                      </div>

                      <button
                        onClick={() => setSelectedCaseModal(item)}
                        className="text-[#3ec1d3] hover:text-[#0e2a47] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Case Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Case Details Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCaseModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Modal Title & Category */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#3ec1d3]/15 text-[#0e2a47] rounded-full text-xs font-bold">
                    {selectedCaseModal.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">
                    ID: {selectedCaseModal.caseId || 'SC-DEMO'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#0e2a47]">
                  {selectedCaseModal.title}
                </h2>

                {/* Side-by-Side Images */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <div className="bg-amber-500 text-white font-bold text-xs py-1 px-3 flex items-center justify-between">
                      <span>BEFORE TREATMENT</span>
                      <span className="text-[10px] opacity-80">Initial Presentation</span>
                    </div>
                    <img
                      src={getImageUrl(selectedCaseModal.beforeImage, selectedCaseModal.afterImage?.processedUrl)}
                      alt="Before treatment"
                      className="w-full h-64 object-cover"
                    />
                  </div>

                  {/* After Image */}
                  <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <div className="bg-emerald-600 text-white font-bold text-xs py-1 px-3 flex items-center justify-between">
                      <span>AFTER TREATMENT</span>
                      <span className="text-[10px] opacity-80">Final Result</span>
                    </div>
                    <img
                      src={getImageUrl(selectedCaseModal.afterImage, selectedCaseModal.beforeImage?.processedUrl)}
                      alt="After treatment"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>

                {/* Clinical Breakdown */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase font-bold">Attending Specialist</span>
                    <span className="text-[#0e2a47] font-extrabold text-sm">{selectedCaseModal.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold">Treatment Duration</span>
                    <span className="text-[#0e2a47] font-extrabold text-sm">{selectedCaseModal.treatmentDuration || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-bold">Patient Demographics</span>
                    <span className="text-[#0e2a47] font-extrabold text-sm">
                      {selectedCaseModal.patientAge ? `${selectedCaseModal.patientAge} Yrs, ` : ''}
                      {selectedCaseModal.patientGender || 'De-identified'}
                    </span>
                  </div>
                </div>

                {/* Case Description & Procedure Details */}
                <div className="mt-6 space-y-4 text-sm text-gray-600">
                  {selectedCaseModal.description && (
                    <div>
                      <h4 className="font-bold text-[#0e2a47] mb-1">Clinical Assessment:</h4>
                      <p className="leading-relaxed">{selectedCaseModal.description}</p>
                    </div>
                  )}

                  {selectedCaseModal.procedureDetails && (
                    <div>
                      <h4 className="font-bold text-[#0e2a47] mb-1">Procedure Details & Materials:</h4>
                      <p className="leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-gray-700">
                        {selectedCaseModal.procedureDetails}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-gray-500">
                    Want similar smile rejuvenation? Consult our specialists today.
                  </span>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                      to="/book"
                      onClick={() => setSelectedCaseModal(null)}
                      className="w-full sm:w-auto text-center px-6 py-2.5 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#0c1c2b] font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                    >
                      Book Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmileGallery;
