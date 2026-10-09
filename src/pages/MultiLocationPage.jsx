import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Calendar, User, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Pre-configured fallback branches
const FALLBACK_BRANCHES = [
  { _id: '1', id: '1', name: 'Downtown Main Clinic', address: '123 Medical Center Blvd', phone: '(512) 555-0100', city: 'Austin' },
  { _id: '2', id: '2', name: 'Northside Branch', address: '8900 Tech Ridge Parkway', phone: '(512) 555-0102', city: 'Round Rock' },
  { _id: '3', id: '3', name: 'Southpark Family Care', address: '4500 William Cannon Dr', phone: '(512) 555-0103', city: 'Austin' }
];

// Pre-configured fallback doctors mapped by branch ID or name pattern
const FALLBACK_DOCTORS_MAP = {
  '1': [
    { _id: 'doc_1', name: 'Dr. Sarah Johnson', specialty: 'General Dentistry & Cleaning', experience: 12, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_2', name: 'Dr. Michael Chen', specialty: 'Orthodontics & Braces', experience: 8, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300' }
  ],
  '2': [
    { _id: 'doc_3', name: 'Dr. Priya Patel', specialty: 'Pediatric & Family Dentistry', experience: 7, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1594824813571-24a69f100417?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_4', name: 'Dr. David Kim', specialty: 'Oral Surgery & Implants', experience: 20, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300' }
  ],
  '3': [
    { _id: 'doc_5', name: 'Dr. Emily Rodriguez', specialty: 'Cosmetic Dentistry & Veneers', experience: 15, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
    { _id: 'doc_6', name: 'Dr. James Park', specialty: 'Endodontics & Root Canal', experience: 10, isAvailable: true, profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' }
  ]
};

const getFallbackDoctors = (branch) => {
  if (!branch) return FALLBACK_DOCTORS_MAP['1'];
  const identifier = String(branch._id || branch.id || branch.name || '').toLowerCase();
  if (identifier.includes('2') || identifier.includes('north')) {
    return FALLBACK_DOCTORS_MAP['2'];
  }
  if (identifier.includes('3') || identifier.includes('south')) {
    return FALLBACK_DOCTORS_MAP['3'];
  }
  return FALLBACK_DOCTORS_MAP['1'];
};

const MultiLocationPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState(FALLBACK_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState(FALLBACK_BRANCHES[0]);
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS_MAP['1']);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchDoctors(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await fetch(`${API_BASE}/api/branches`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || [];
        if (data.length > 0) {
          setBranches(data);
          setSelectedBranch(data[0]);
          setLoadingBranches(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend branches fetch failed, using fallback branches:', err.message);
    }
    setBranches(FALLBACK_BRANCHES);
    setSelectedBranch(FALLBACK_BRANCHES[0]);
    setLoadingBranches(false);
  };

  const fetchDoctors = async (branch) => {
    setLoadingDoctors(true);
    const branchId = branch._id || branch.id;
    let loadedDoctors = [];

    try {
      const res = await fetch(`${API_BASE}/api/branches/${branchId}/doctors`);
      if (res.ok) {
        const response = await res.json();
        const data = response.data || [];
        if (Array.isArray(data) && data.length > 0) {
          loadedDoctors = data;
        }
      }
    } catch (err) {
      console.warn(`Backend fetch failed for branch ${branchId}, using fallback doctors:`, err.message);
    }

    // If server returned no doctors or failed, use pre-configured fallback doctors
    if (loadedDoctors.length === 0) {
      loadedDoctors = getFallbackDoctors(branch);
    }

    setDoctors(loadedDoctors);
    setLoadingDoctors(false);
  };

  const handleBookAppointment = (doctor) => {
    navigate('/urgency-based', {
      state: {
        prefillData: {
          doctorId: doctor._id || doctor.id,
          doctorName: doctor.name,
          branchId: selectedBranch?._id || selectedBranch?.id,
          branchName: selectedBranch?.name,
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#0c1c2b] text-white pt-10 pb-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Locations & Specialists</h1>
        <p className="text-[#3ec1d3] font-medium max-w-xl mx-auto">
          Find a DentoCare clinic near you and connect with our expert dental team
        </p>
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-8 mb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Sidebar - Branch List */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-[#0e2a47] flex items-center gap-2 text-base">
                  <MapPin className="w-5 h-5 text-[#3ec1d3]" /> Clinic Locations
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {loadingBranches ? (
                  <div className="p-6 text-center text-gray-400">Loading locations...</div>
                ) : (
                  branches.map(branch => {
                    const isSelected = (selectedBranch?._id || selectedBranch?.id) === (branch._id || branch.id);
                    return (
                      <button
                        key={branch._id || branch.id}
                        onClick={() => setSelectedBranch(branch)}
                        className={`w-full text-left p-4 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-[#f0f9fa] border-2 border-[#3ec1d3] shadow-sm'
                            : 'hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-[#3ec1d3]' : 'text-[#0e2a47]'}`}>
                          {branch.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2 leading-relaxed">{branch.address}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#3ec1d3]" /> {branch.phone}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Doctors Grid */}
          <div className="w-full lg:w-2/3">
            {selectedBranch && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-[#0e2a47] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#3ec1d3]" />
                      {selectedBranch.name} Specialists
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Available doctors & specialists at this branch location
                    </p>
                  </div>
                  <span className="bg-[#3ec1d3]/10 text-[#3ec1d3] text-xs font-semibold px-3 py-1 rounded-full border border-[#3ec1d3]/20">
                    {doctors.length} Doctors Available
                  </span>
                </div>
              </div>
            )}

            {loadingDoctors ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ec1d3] mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Loading specialist doctors...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <div
                    key={doc._id || doc.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={doc.profileImage || doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100'}
                          alt={doc.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#3ec1d3]/30 flex-shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-[#0e2a47] text-base mb-0.5">{doc.name}</h3>
                          <p className="text-[#3ec1d3] font-semibold text-xs mb-1">{doc.specialty}</p>
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">
                            {doc.experience ? `${doc.experience} Years Experience` : 'Experienced Specialist'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => doc.isAvailable !== false && handleBookAppointment(doc)}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                        doc.isAvailable !== false
                          ? 'bg-[#3ec1d3] text-white hover:bg-[#34adb9] shadow-sm'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {doc.isAvailable !== false ? 'Book Appointment' : 'Not Available'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MultiLocationPage;
