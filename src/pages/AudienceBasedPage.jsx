import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, Calendar, User, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Default mock patients for instant fallback
const DEFAULT_MOCK_PATIENTS = [
  {
    _id: 'mock_1',
    name: 'SAFWANUL KARIM MINHAJ',
    email: 'safwanulkarimminhaj22@gmail.com',
    phone: '01931683915',
    medicalHistory: 'Good dental health',
    allergies: 'None',
    isNewPatient: false,
    previousAppointments: [
      { id: 'apt_1', department: 'General Dental Checkup & Cleaning', appointmentDate: '2026-09-15', appointmentTime: '10:30 AM', status: 'Completed' },
      { id: 'apt_2', department: 'Teeth Whitening Consultation', appointmentDate: '2026-10-12', appointmentTime: '02:00 PM', status: 'Scheduled' }
    ]
  }
];

// Helper to manage localStorage patients
const getLocalPatients = () => {
  try {
    const saved = localStorage.getItem('dentist_patients');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return DEFAULT_MOCK_PATIENTS;
};

const saveLocalPatient = (patient) => {
  try {
    const currentList = getLocalPatients();
    const existingIdx = currentList.findIndex(p => p.email.toLowerCase() === patient.email.toLowerCase());
    if (existingIdx >= 0) {
      currentList[existingIdx] = { ...currentList[existingIdx], ...patient };
    } else {
      currentList.push(patient);
    }
    localStorage.setItem('dentist_patients', JSON.stringify(currentList));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

const AudienceBasedPage = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);

  // New Patient State
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    medicalHistory: '',
    allergies: ''
  });

  // Returning Patient State
  const [returningEmail, setReturningEmail] = useState('');

  // Check if there is an active session in localStorage on mount
  useEffect(() => {
    try {
      const activeSession = localStorage.getItem('active_patient_profile');
      if (activeSession) {
        setProfile(JSON.parse(activeSession));
      }
    } catch (e) {
      // Ignore session restore error
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = newPatient.email.trim().toLowerCase();
    const patientData = {
      ...newPatient,
      email: cleanEmail,
      _id: 'pat_' + Date.now(),
      previousAppointments: []
    };

    let serverSuccess = false;
    let serverMessage = '';

    try {
      const res = await fetch(`${API_BASE}/api/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        serverSuccess = true;
        const registered = data.data || patientData;
        saveLocalPatient(registered);
        serverMessage = data.message || 'Registration successful!';
      } else if (res.status === 409) {
        // Email already exists
        setError('Patient with this email already exists. Please switch to "Returning Patient" to login.');
        setLoading(false);
        return;
      } else {
        serverMessage = data.message || 'Server processed registration locally.';
      }
    } catch (fetchErr) {
      // Network failure / server offline - fall back seamlessly to local storage
      console.warn('Backend server unreachable, saving locally:', fetchErr.message);
    }

    // Always ensure local storage is updated as fallback
    saveLocalPatient(patientData);

    setSuccess(serverSuccess ? serverMessage : 'Registration completed successfully! You can now log in.');
    setReturningEmail(cleanEmail);
    setNewPatient({ name: '', email: '', phone: '', medicalHistory: '', allergies: '' });
    setActiveTab('returning');
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const cleanEmail = returningEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    let foundPatient = null;

    try {
      const res = await fetch(`${API_BASE}/api/patients/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const response = await res.json().catch(() => ({}));

      if (res.ok) {
        foundPatient = response.data || response;
      }
    } catch (fetchErr) {
      console.warn('Backend server unreachable during login, attempting local lookup:', fetchErr.message);
    }

    // Fall back to local lookup if server was unreachable or didn't return patient
    if (!foundPatient) {
      const localPatients = getLocalPatients();
      foundPatient = localPatients.find(p => p.email.toLowerCase() === cleanEmail);
    }

    if (foundPatient) {
      setProfile(foundPatient);
      setSuccess('Logged in successfully!');
      try {
        localStorage.setItem('active_patient_profile', JSON.stringify(foundPatient));
      } catch (e) {}
    } else {
      setError('No patient record found for this email. Please register as a New Patient first.');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setProfile(null);
    setSuccess('');
    setError('');
    try {
      localStorage.removeItem('active_patient_profile');
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#0c1c2b] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Patient Portal</h1>
            <p className="text-gray-400">Manage your dental care journey</p>
          </div>

          {!profile ? (
            <div className="bg-[#122c42] rounded-xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-700">
                <button
                  type="button"
                  className={`flex-1 py-4 px-6 text-lg font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'new' ? 'bg-[#3ec1d3] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a3a56]'}`}
                  onClick={() => { setActiveTab('new'); setError(''); setSuccess(''); }}
                >
                  <UserPlus className="w-5 h-5" /> New Patient
                </button>
                <button
                  type="button"
                  className={`flex-1 py-4 px-6 text-lg font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'returning' ? 'bg-[#3ec1d3] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a3a56]'}`}
                  onClick={() => { setActiveTab('returning'); setError(''); setSuccess(''); }}
                >
                  <LogIn className="w-5 h-5" /> Returning Patient
                </button>
              </div>

              <div className="p-8">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {activeTab === 'new' ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newPatient.name} 
                          onChange={e => setNewPatient({...newPatient, name: e.target.value})} 
                          className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3]" 
                          placeholder="e.g. SAFWANUL KARIM MINHAJ"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={newPatient.email} 
                          onChange={e => setNewPatient({...newPatient, email: e.target.value})} 
                          className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3]" 
                          placeholder="e.g. safwanulkarimminhaj22@gmail.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={newPatient.phone} 
                        onChange={e => setNewPatient({...newPatient, phone: e.target.value})} 
                        className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3]" 
                        placeholder="e.g. 01931683915"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Medical History</label>
                      <textarea 
                        value={newPatient.medicalHistory} 
                        onChange={e => setNewPatient({...newPatient, medicalHistory: e.target.value})} 
                        className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3] h-24" 
                        placeholder="Any previous dental surgeries or medical conditions..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Allergies</label>
                      <input 
                        type="text" 
                        value={newPatient.allergies} 
                        onChange={e => setNewPatient({...newPatient, allergies: e.target.value})} 
                        className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3]" 
                        placeholder="e.g. Penicillin, Latex..."
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Processing Registration...' : 'Complete Registration'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={returningEmail} 
                        onChange={e => setReturningEmail(e.target.value)} 
                        className="w-full bg-[#0c1c2b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#3ec1d3]" 
                        placeholder="Enter your registered email address"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Accessing Portal...' : 'Access My Portal'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#122c42] rounded-xl p-8 shadow-2xl">
              <div className="flex flex-wrap items-center gap-4 mb-8 border-b border-gray-700 pb-6">
                <div className="w-16 h-16 bg-[#3ec1d3]/20 rounded-full flex items-center justify-center text-[#3ec1d3]">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome, {profile.name || 'Patient'}</h2>
                  <p className="text-gray-400">{profile.email}</p>
                  {profile.phone && <p className="text-xs text-gray-500">Phone: {profile.phone}</p>}
                </div>
                <button 
                  onClick={handleLogout} 
                  className="ml-auto px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>

              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3ec1d3]" /> Appointment History
              </h3>
              
              <div className="space-y-4">
                {profile.previousAppointments && profile.previousAppointments.length > 0 ? (
                  profile.previousAppointments.map((apt, idx) => (
                    <div key={apt._id || apt.id || idx} className="bg-[#0c1c2b] p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{apt.department || apt.type || 'Regular Dental Checkup'}</p>
                        <p className="text-sm text-gray-400">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : apt.date} at {apt.appointmentTime || apt.time}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {apt.status || 'Scheduled'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 bg-[#0c1c2b] p-6 rounded-lg text-center border border-gray-700">No previous appointment history found.</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AudienceBasedPage;
