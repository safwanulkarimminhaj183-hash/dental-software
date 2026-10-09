import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  UserCheck,
  FileText,
  DollarSign,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Printer,
  Download,
  Send,
  Loader2,
  ChevronRight,
  User,
  Activity,
  Award,
  Stethoscope,
  Building2,
  FilePlus,
  TrendingUp,
  CreditCard,
  Edit3,
  X,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import Navbar from './Navbar';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

const MOCK_DOCTOR = {
  _id: 'doc-1',
  name: 'Dr. Adrian Thorne',
  slug: 'dr-adrian-thorne',
  specialization: 'Senior Orthodontist',
  degrees: [{ degree: 'BDS' }, { degree: 'MDS – Orthodontics' }],
  experienceYears: 18,
  consultationFee: 75,
  bio: 'Board-certified orthodontist specializing in clear aligners, complex malocclusion corrections, and digital smile design.',
  availableDays: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  slotDuration: 15,
  workStartTime: '16:00',
  workEndTime: '20:00',
  blockedDates: ['2026-09-20'],
  isChamberBlockedToday: false,
};

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Sarah Jenkins', time: '04:00 PM', procedure: 'Invisalign Consultation', status: 'Waiting', age: 29, gender: 'Female', phone: '+1 512-555-0144', email: 'sarah.j@example.com' },
  { id: 'p2', name: 'Michael Vance', time: '04:15 PM', procedure: 'Root Canal Treatment (RCT)', status: 'In Chamber', age: 42, gender: 'Male', phone: '+1 512-555-0188', email: 'vance.m@example.com' },
  { id: 'p3', name: 'Elena Rostova', time: '04:30 PM', procedure: 'Scaling & Polishing', status: 'Completed', age: 34, gender: 'Female', phone: '+1 512-555-0199', email: 'elena.r@example.com' },
  { id: 'p4', name: 'David Kim', time: '04:45 PM', procedure: 'Dental Crown Placement', status: 'Waiting', age: 51, gender: 'Male', phone: '+1 512-555-0211', email: 'david.k@example.com' },
];

const PROCEDURES_LIST = [
  'Consultation & Oral Examination',
  'Scaling & Dental Polishing',
  'Root Canal Treatment (RCT)',
  'Invisalign Clear Aligners',
  'Dental Implant Placement',
  'Porcelain Crown & Bridge',
  'Teeth Whitening (Bleaching)',
  'Tooth Extraction / Oral Surgery',
];

const DentistPortal = () => {
  const { id } = useParams();
  const doctorId = id || 'doc-1';

  // Active Portal Tab: 'schedule' | 'emr' | 'earnings' | 'blogs'
  const [activeTab, setActiveTab] = useState('schedule');

  // Doctor Profile State
  const [doctor, setDoctor] = useState(MOCK_DOCTOR);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ ...MOCK_DOCTOR });

  // ── 1. Schedule & Slot Engine State ────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableDays, setAvailableDays] = useState(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday']);
  const [workStartTime, setWorkStartTime] = useState('16:00');
  const [workEndTime, setWorkEndTime] = useState('20:00');
  const [slotDuration, setSlotDuration] = useState(15);
  const [isChamberBlockedToday, setIsChamberBlockedToday] = useState(false);
  const [blockedDates, setBlockedDates] = useState(['2026-09-20']);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [patients, setPatients] = useState(MOCK_PATIENTS);

  // ── 2. EMR & Prescription Generator State ──────────────────────────────────
  const [prescriptions, setPrescriptions] = useState([]);
  const [rxForm, setRxForm] = useState({
    patientName: 'Sarah Jenkins',
    patientEmail: 'sarah.j@example.com',
    patientAge: '29',
    patientGender: 'Female',
    procedure: 'Root Canal Treatment (RCT)',
    advice: 'Take prescribed antibiotics after meals. Avoid hard food on right jaw for 48 hours.',
    nextVisitDate: '2026-09-26',
  });
  const [medicines, setMedicines] = useState([
    { name: 'Amoxicillin 500mg', dosage: '1-0-1', duration: '5 days', note: 'After meals' },
    { name: 'Ibuprofen 400mg', dosage: '1-1-1', duration: '3 days', note: 'For pain relief' },
  ]);
  const [activeRxPrint, setActiveRxPrint] = useState(null);

  // Treatment Tracker state
  const [treatmentSteps, setTreatmentSteps] = useState([
    { id: 1, title: 'Step 1: Clinical Diagnosis & Digital X-Ray', date: '2026-09-01', status: 'Completed' },
    { id: 2, title: 'Step 2: Cleaning, Canal Pulp Extraction & Temporary Seal', date: '2026-09-08', status: 'Completed' },
    { id: 3, title: 'Step 3: Gutta-Percha Canal Filling & Permanent Crown', date: '2026-09-15', status: 'Scheduled' },
    { id: 4, title: 'Step 4: Final Bite Check & Polish Review', date: '2026-09-26', status: 'Pending' },
  ]);

  // Sample X-Ray Attachments
  const [xrays] = useState([
    { id: 'xr-1', label: 'Panoramic OPG X-Ray', date: '2026-09-01', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop' },
    { id: 'xr-2', label: 'Periapical Molars Scan', date: '2026-09-08', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=400&auto=format&fit=crop' },
  ]);

  // ── 3. Billing & Earnings State ────────────────────────────────────────────
  const [earnings, setEarnings] = useState({
    dailyRevenue: 600,
    monthlyRevenue: 10650,
    advancePayments: 1800,
    pendingDues: 450,
  });
  const [invoiceForm, setInvoiceForm] = useState({
    patientName: 'Sarah Jenkins',
    procedure: 'Root Canal Treatment (RCT)',
    amount: 350,
    advance: 100,
  });
  const [invoices, setInvoices] = useState([
    { id: 'INV-1091', patientName: 'Sarah Jenkins', procedure: 'Root Canal Treatment (RCT)', amount: 350, advance: 100, due: 250, date: '2026-09-12', status: 'Partial' },
    { id: 'INV-1090', patientName: 'Michael Vance', procedure: 'Invisalign Consultation', amount: 150, advance: 150, due: 0, date: '2026-09-11', status: 'Paid' },
  ]);
  const [activeInvoicePrint, setActiveInvoicePrint] = useState(null);

  // ── 4. Blog Manager State ──────────────────────────────────────────────────
  const [blogs, setBlogs] = useState([
    { id: 'b1', title: '5 Essential Tips for Protecting Tooth Enamel', category: 'Preventive Dentistry', date: '2026-09-02', content: 'Enamel is the hardest substance in the human body...' },
    { id: 'b2', title: 'Why Clear Aligners Are Replacing Traditional Braces', category: 'Orthodontics', date: '2026-08-28', content: 'Modern orthodontic patients prefer discreet, removable aligners...' },
  ]);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Preventive Care',
    excerpt: '',
    coverImage: '',
    content: '',
  });

  // Helper notification toast
  const showToast = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Fetch Doctor Details from Backend ──────────────────────────────────────
  const fetchDoctorProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/specialists/${doctorId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDoctor(json.data);
          setEditForm(json.data);
          if (json.data.availableDays) setAvailableDays(json.data.availableDays);
          if (json.data.workStartTime) setWorkStartTime(json.data.workStartTime);
          if (json.data.workEndTime) setWorkEndTime(json.data.workEndTime);
          if (json.data.slotDuration) setSlotDuration(json.data.slotDuration);
          if (json.data.blockedDates) setBlockedDates(json.data.blockedDates);
          if (json.data.isChamberBlockedToday !== undefined) setIsChamberBlockedToday(json.data.isChamberBlockedToday);
        }
      }
    } catch {
      // Use mock fallback seamlessly
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // ── Fetch Doctor Earnings ──────────────────────────────────────────────────
  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/specialists/${doctorId}/earnings`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEarnings(json.data);
        }
      }
    } catch {
      // Use fallback
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchEarnings();
  }, [fetchDoctorProfile, fetchEarnings]);

  // ── Save Schedule Handler ──────────────────────────────────────────────────
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/specialists/${doctorId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableDays,
          workStartTime,
          workEndTime,
          slotDuration,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        showToast('Schedule settings saved to server successfully!');
      } else {
        showToast('Schedule settings updated in portal (Local Mode).');
      }
    } catch {
      showToast('Schedule updated locally.');
    }
  };

  // ── Block Chamber / Emergency Toggle Handler ──────────────────────────────
  const handleToggleBlockToday = async () => {
    const nextState = !isChamberBlockedToday;
    setIsChamberBlockedToday(nextState);

    try {
      await fetch(`${API_BASE}/specialists/${doctorId}/block-date`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChamberBlockedToday: nextState }),
      });
      // Trigger automatic SMS notification to queue
      await fetch(`${API_BASE}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EMERGENCY_CHAMBER_LOCK',
          message: `Notice: Chamber operations for ${doctor.name} on ${selectedDate} are ${nextState ? 'TEMPORARILY BLOCKED' : 'RESUMED'}.`,
        }),
      });

      showToast(nextState ? 'Emergency: Chamber blocked today. Patients notified via SMS.' : 'Chamber unblocked. Operations resumed!');
    } catch {
      showToast(nextState ? 'Chamber status set to Blocked Today.' : 'Chamber unblocked.');
    }
  };

  // ── Add Blocked Date Handler ───────────────────────────────────────────────
  const handleAddBlockedDate = async () => {
    if (!newBlockDate) return;
    const updated = [...blockedDates, newBlockDate];
    setBlockedDates(updated);

    try {
      await fetch(`${API_BASE}/specialists/${doctorId}/block-date`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedDate: newBlockDate }),
      });
      showToast(`Date ${newBlockDate} added to blocked schedule.`);
    } catch {
      showToast(`Date ${newBlockDate} blocked.`);
    } finally {
      setNewBlockDate('');
    }
  };

  // ── Generate Time Slots Engine ─────────────────────────────────────────────
  const generateTimeSlots = () => {
    const slots = [];
    const [startH, startM] = workStartTime.split(':').map(Number);
    const [endH, endM] = workEndTime.split(':').map(Number);

    let curr = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (curr < end) {
      const h = Math.floor(curr / 60);
      const m = curr % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const formattedH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const formattedM = m < 10 ? `0${m}` : m;
      const timeString = `${formattedH}:${formattedM} ${period}`;

      slots.push(timeString);
      curr += Number(slotDuration);
    }
    return slots;
  };

  // ── Patient Queue Status Handler ───────────────────────────────────────────
  const handlePatientStatusChange = (pId, newStatus) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === pId ? { ...p, status: newStatus } : p))
    );
    showToast(`Patient status updated to "${newStatus}".`);
  };

  // ── Prescription Generator Handler ─────────────────────────────────────────
  const handleGeneratePrescription = async (e) => {
    e.preventDefault();
    if (!rxForm.patientName) {
      showToast('Patient name is required.', 'error');
      return;
    }

    const payload = {
      ...rxForm,
      dentistId: doctorId,
      dentistName: doctor.name,
      specialty: doctor.specialization,
      medicines,
    };

    try {
      const res = await fetch(`${API_BASE}/prescriptions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      const created = json.data || {
        _id: `rx-${Date.now()}`,
        prescriptionNumber: `RX-DENTO-${Math.floor(100000 + Math.random() * 900000)}`,
        ...payload,
        issuedAt: new Date().toISOString(),
      };

      setPrescriptions([created, ...prescriptions]);
      setActiveRxPrint(created);
      showToast('Digital Prescription generated successfully!');
    } catch {
      const fallbackRx = {
        _id: `rx-${Date.now()}`,
        prescriptionNumber: `RX-DENTO-${Math.floor(100000 + Math.random() * 900000)}`,
        ...payload,
        issuedAt: new Date().toISOString(),
      };
      setPrescriptions([fallbackRx, ...prescriptions]);
      setActiveRxPrint(fallbackRx);
      showToast('Digital Prescription generated.');
    }
  };

  // ── Generate Invoice Handler ──────────────────────────────────────────────
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const amount = Number(invoiceForm.amount) || 0;
    const advance = Number(invoiceForm.advance) || 0;
    const due = Math.max(0, amount - advance);
    const newInv = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: invoiceForm.patientName,
      procedure: invoiceForm.procedure,
      amount,
      advance,
      due,
      date: new Date().toISOString().split('T')[0],
      status: due === 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Unpaid',
    };

    setInvoices([newInv, ...invoices]);
    setActiveInvoicePrint(newInv);
    showToast(`Invoice ${newInv.id} created successfully!`);
  };

  // ── Publish Blog Article Handler ───────────────────────────────────────────
  const handlePublishBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) {
      showToast('Title and content are required.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blogForm,
          authorName: doctor.name,
          authorRole: doctor.specialization,
        }),
      });

      const json = await res.json().catch(() => ({}));
      const newB = json.data || {
        id: `b-${Date.now()}`,
        ...blogForm,
        date: new Date().toISOString().split('T')[0],
      };

      setBlogs([newB, ...blogs]);
      showToast('Article published to DentoCare Blog!');
      setBlogForm({ title: '', category: 'Preventive Care', excerpt: '', coverImage: '', content: '' });
    } catch {
      const newB = {
        id: `b-${Date.now()}`,
        ...blogForm,
        date: new Date().toISOString().split('T')[0],
      };
      setBlogs([newB, ...blogs]);
      showToast('Article published to DentoCare Blog!');
      setBlogForm({ title: '', category: 'Preventive Care', excerpt: '', coverImage: '', content: '' });
    }
  };

  // ── Save Profile Edit Handler ──────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/specialists/${doctorId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setDoctor(editForm);
      setShowEditModal(false);
      showToast('Doctor Profile updated successfully!');
    } catch {
      setDoctor(editForm);
      setShowEditModal(false);
      showToast('Doctor Profile updated.');
    }
  };

  const portalTabs = [
    { id: 'schedule', label: 'Schedule & Slots', icon: Clock },
    { id: 'emr', label: 'EMR & Prescriptions', icon: FileText },
    { id: 'earnings', label: 'Earnings & Invoices', icon: DollarSign },
    { id: 'blogs', label: 'Blog Manager', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0f2132] text-slate-100 font-sans pb-16">
      <Navbar />

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-[9999] px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'error'
                ? 'bg-red-900/90 border-red-500 text-red-200'
                : 'bg-teal-900/90 border-teal-400 text-teal-100'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-[#3ec1d3]" />}
            <span className="text-sm font-semibold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Header Banner ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#14293e] via-[#1a344f] to-[#14293e] border-b border-slate-700/60 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={doctor.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop'}
                alt={doctor.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#3ec1d3] shadow-lg"
              />
              <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0f2132] ${isChamberBlockedToday ? 'bg-red-500' : 'bg-emerald-400'}`} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">{doctor.name}</h1>
                <span className="bg-[#3ec1d3]/10 text-[#3ec1d3] text-xs font-bold px-3 py-1 rounded-full border border-[#3ec1d3]/30">
                  Doctor Portal
                </span>
              </div>
              <p className="text-[#3ec1d3] font-semibold text-sm mt-0.5">{doctor.specialization}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#3ec1d3]" /> {doctor.degrees?.map((d) => d.degree).join(', ') || 'BDS'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5 text-[#3ec1d3]" /> Fee: ${doctor.consultationFee}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-[#3ec1d3]" /> {doctor.experienceYears}+ Yrs Exp</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#3ec1d3]" /> Edit Profile
            </button>
            <button
              onClick={handleToggleBlockToday}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg ${
                isChamberBlockedToday
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isChamberBlockedToday ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isChamberBlockedToday ? 'Chamber Blocked Today' : 'Block Chamber Today'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Tabbed Navigation Bar ─────────────────────────────────────────── */}
      <div className="bg-[#142637] border-b border-slate-700/60 sticky top-[80px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-2 overflow-x-auto">
          {portalTabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeTab === tabId
                  ? 'border-[#3ec1d3] text-[#3ec1d3] bg-[#0f2132]/40'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Container ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: SCHEDULE & APPOINTMENT SLOT ENGINE                             */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Top Grid: Slot Configuration + Blocked Dates Control */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Slot Engine Configuration */}
              <div className="lg:col-span-2 bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#3ec1d3]" />
                    <h3 className="text-lg font-bold text-white">Appointment Slot Configuration</h3>
                  </div>
                  <span className="text-xs bg-[#3ec1d3]/10 text-[#3ec1d3] font-semibold px-2.5 py-1 rounded-md">
                    Engine Active
                  </span>
                </div>

                <form onSubmit={handleSaveSchedule} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Weekly Available Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                        const active = availableDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() =>
                              setAvailableDays((prev) =>
                                active ? prev.filter((d) => d !== day) : [...prev, day]
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? 'bg-[#3ec1d3] text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Chamber Start Time
                      </label>
                      <input
                        type="time"
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Chamber End Time
                      </label>
                      <input
                        type="time"
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Slot Duration (Min/Patient)
                      </label>
                      <select
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      >
                        <option value={15}>15 Minutes per Slot</option>
                        <option value={20}>20 Minutes per Slot</option>
                        <option value={30}>30 Minutes per Slot</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Save Slot Rules
                    </button>
                  </div>
                </form>

                {/* Generated Time Slots Grid */}
                <div className="pt-4 border-t border-slate-700/60">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Generated Daily Patient Slots ({generateTimeSlots().length} Total Slots)
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {generateTimeSlots().map((slot, i) => (
                      <span
                        key={i}
                        className="bg-[#0f2132] border border-slate-700/80 text-[#3ec1d3] text-center text-xs font-bold py-2 rounded-lg"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Chamber Control & Blocked Dates Panel */}
              <div className="bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-bold text-white">Emergency & Blocked Dates</h3>
                  </div>

                  <div className="bg-[#0f2132] p-4 rounded-xl border border-slate-700/60 mb-6">
                    <p className="text-xs font-bold text-slate-300 mb-1">Emergency Chamber Lockout</p>
                    <p className="text-xs text-slate-400 mb-4">
                      Toggle to immediately stop accepting patient walk-ins and send SMS alerts to today's queue.
                    </p>
                    <button
                      onClick={handleToggleBlockToday}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                        isChamberBlockedToday
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {isChamberBlockedToday ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      {isChamberBlockedToday ? 'Chamber Currently Blocked' : 'Block Chamber Today'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Block Leave / Absent Date
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="date"
                        value={newBlockDate}
                        onChange={(e) => setNewBlockDate(e.target.value)}
                        className="flex-1 bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                      <button
                        onClick={handleAddBlockedDate}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                      >
                        Block
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {blockedDates.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No blocked dates scheduled.</p>
                      ) : (
                        blockedDates.map((bDate) => (
                          <div
                            key={bDate}
                            className="flex items-center justify-between bg-[#0f2132] px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300"
                          >
                            <span>📅 {bDate}</span>
                            <button
                              onClick={() => setBlockedDates((prev) => prev.filter((d) => d !== bDate))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 text-center">
                  <span className="text-[11px] text-slate-400">
                    Engine Sync: <span className="text-emerald-400 font-bold">Online</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Live Patient Queue Filtered by Date */}
            <div className="bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-[#3ec1d3]" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Patient Queue</h3>
                    <p className="text-xs text-slate-400">Real-time chamber appointments & queue progress</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-300">Filter Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0f2132] text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 rounded-l-lg">Time</th>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Age / Gender</th>
                      <th className="p-3.5">Procedure</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 rounded-r-lg text-right">Queue Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40 font-medium">
                    {patients.map((pt) => (
                      <tr key={pt.id} className="hover:bg-[#0f2132]/50 transition-colors">
                        <td className="p-3.5 font-bold text-[#3ec1d3]">{pt.time}</td>
                        <td className="p-3.5 font-bold text-white">{pt.name}</td>
                        <td className="p-3.5 text-slate-400">{pt.age} yrs / {pt.gender}</td>
                        <td className="p-3.5 text-slate-300">{pt.procedure}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              pt.status === 'Completed'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                                : pt.status === 'In Chamber'
                                ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {pt.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handlePatientStatusChange(pt.id, 'In Chamber')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            In Chamber
                          </button>
                          <button
                            onClick={() => handlePatientStatusChange(pt.id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Complete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: EMR & DIGITAL PRESCRIPTION GENERATOR                            */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'emr' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Grid: Prescription Generator Form + Patient EMR History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Prescription Generator */}
              <div className="lg:col-span-2 bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div className="flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-[#3ec1d3]" />
                    <h3 className="text-lg font-bold text-white">Digital Prescription Generator</h3>
                  </div>
                  <span className="text-xs text-slate-400">Rx Output: PDF & Print</span>
                </div>

                <form onSubmit={handleGeneratePrescription} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Patient Name</label>
                      <input
                        type="text"
                        value={rxForm.patientName}
                        onChange={(e) => setRxForm({ ...rxForm, patientName: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Age</label>
                      <input
                        type="text"
                        value={rxForm.patientAge}
                        onChange={(e) => setRxForm({ ...rxForm, patientAge: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Gender</label>
                      <select
                        value={rxForm.patientGender}
                        onChange={(e) => setRxForm({ ...rxForm, patientGender: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Procedure</label>
                      <select
                        value={rxForm.procedure}
                        onChange={(e) => setRxForm({ ...rxForm, procedure: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      >
                        {PROCEDURES_LIST.map((proc) => (
                          <option key={proc} value={proc}>{proc}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Medicines List Input */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Rx Prescribed Medicines ({medicines.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => setMedicines([...medicines, { name: '', dosage: '1-0-1', duration: '5 days', note: 'After meals' }])}
                        className="text-xs text-[#3ec1d3] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Medicine
                      </button>
                    </div>

                    <div className="space-y-2">
                      {medicines.map((med, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#0f2132] p-2.5 rounded-xl border border-slate-700/60">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].name = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-5 bg-[#142637] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                          />
                          <input
                            type="text"
                            placeholder="Dosage (1-0-1)"
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].dosage = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-2 bg-[#142637] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                          />
                          <input
                            type="text"
                            placeholder="Duration (5 days)"
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].duration = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-2 bg-[#142637] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                          />
                          <input
                            type="text"
                            placeholder="Instructions"
                            value={med.note}
                            onChange={(e) => {
                              const updated = [...medicines];
                              updated[idx].note = e.target.value;
                              setMedicines(updated);
                            }}
                            className="col-span-2 bg-[#142637] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                          />
                          <button
                            type="button"
                            onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))}
                            className="col-span-1 text-red-400 hover:text-red-300 flex justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Clinical Advice & Notes</label>
                      <textarea
                        rows={2}
                        value={rxForm.advice}
                        onChange={(e) => setRxForm({ ...rxForm, advice: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Next Follow-Up Date</label>
                      <input
                        type="date"
                        value={rxForm.nextVisitDate}
                        onChange={(e) => setRxForm({ ...rxForm, nextVisitDate: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Generate & Print Digital Prescription
                    </button>
                  </div>
                </form>
              </div>

              {/* Patient EMR Medical Records & X-Ray Attachments */}
              <div className="bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
                  <Activity className="w-5 h-5 text-[#3ec1d3]" />
                  <h3 className="text-lg font-bold text-white">EMR Records & Scans</h3>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Attached Dental X-Rays & Imaging
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {xrays.map((xr) => (
                      <div key={xr.id} className="bg-[#0f2132] rounded-xl overflow-hidden border border-slate-700/60 group">
                        <img src={xr.url} alt={xr.label} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                        <div className="p-2 text-center">
                          <p className="text-[11px] font-bold text-slate-200 truncate">{xr.label}</p>
                          <p className="text-[10px] text-slate-500">{xr.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treatment Progress Tracker */}
                <div className="pt-4 border-t border-slate-700/60">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Visual Treatment Progress Tracker
                  </p>
                  <div className="space-y-3">
                    {treatmentSteps.map((step) => (
                      <div key={step.id} className="flex items-start gap-3 bg-[#0f2132] p-3 rounded-xl border border-slate-700/60">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                          step.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {step.status === 'Completed' ? <Check className="w-3.5 h-3.5" /> : step.id}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{step.title}</p>
                          <p className="text-[10px] text-slate-400">{step.date} • <span className="text-[#3ec1d3]">{step.status}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: EARNINGS & INVOICE GENERATOR                                    */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'earnings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#142637] p-5 rounded-2xl border border-slate-700/60 shadow-xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Today's Revenue</p>
                <h4 className="text-2xl font-extrabold text-[#3ec1d3] mt-2">${earnings.dailyRevenue}</h4>
                <p className="text-[11px] text-emerald-400 font-semibold mt-1">↑ +14% vs yesterday</p>
              </div>

              <div className="bg-[#142637] p-5 rounded-2xl border border-slate-700/60 shadow-xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Total</p>
                <h4 className="text-2xl font-extrabold text-emerald-400 mt-2">${earnings.monthlyRevenue}</h4>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">142 procedures completed</p>
              </div>

              <div className="bg-[#142637] p-5 rounded-2xl border border-slate-700/60 shadow-xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Advance Collected</p>
                <h4 className="text-2xl font-extrabold text-indigo-400 mt-2">${earnings.advancePayments}</h4>
                <p className="text-[11px] text-indigo-300 font-semibold mt-1">For upcoming treatments</p>
              </div>

              <div className="bg-[#142637] p-5 rounded-2xl border border-slate-700/60 shadow-xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Dues</p>
                <h4 className="text-2xl font-extrabold text-amber-400 mt-2">${earnings.pendingDues}</h4>
                <p className="text-[11px] text-amber-300 font-semibold mt-1">6 invoices pending</p>
              </div>
            </div>

            {/* Invoice Generator + Invoices List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Invoice Form */}
              <div className="bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
                  <CreditCard className="w-5 h-5 text-[#3ec1d3]" />
                  <h3 className="text-lg font-bold text-white">Auto Invoice Generator</h3>
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={invoiceForm.patientName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, patientName: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Treatment / Procedure</label>
                    <select
                      value={invoiceForm.procedure}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, procedure: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    >
                      {PROCEDURES_LIST.map((proc) => (
                        <option key={proc} value={proc}>{proc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Total Fee ($)</label>
                      <input
                        type="number"
                        value={invoiceForm.amount}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Advance ($)</label>
                      <input
                        type="number"
                        value={invoiceForm.advance}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, advance: e.target.value })}
                        className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Create & Print Invoice
                  </button>
                </form>
              </div>

              {/* Invoices List */}
              <div className="lg:col-span-2 bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <h3 className="text-lg font-bold text-white">Recent Treatment Invoices</h3>
                  <span className="text-xs text-slate-400">{invoices.length} Invoices</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f2132] text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Patient</th>
                        <th className="p-3">Procedure</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3">Due</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40 font-medium">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#0f2132]/50">
                          <td className="p-3 font-bold text-[#3ec1d3]">{inv.id}</td>
                          <td className="p-3 font-bold text-white">{inv.patientName}</td>
                          <td className="p-3 text-slate-300">{inv.procedure}</td>
                          <td className="p-3 font-bold">${inv.amount}</td>
                          <td className="p-3 text-emerald-400">${inv.advance}</td>
                          <td className="p-3 text-amber-400">${inv.due}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setActiveInvoicePrint(inv)}
                              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-md cursor-pointer"
                            >
                              Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: DOCTOR BLOG MANAGER                                            */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'blogs' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Blog Article Form */}
              <div className="bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-700/60 pb-4">
                  <BookOpen className="w-5 h-5 text-[#3ec1d3]" />
                  <h3 className="text-lg font-bold text-white">Publish Oral Care Article</h3>
                </div>

                <form onSubmit={handlePublishBlog} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Article Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Benefits of Clear Aligners"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    >
                      <option value="Preventive Care">Preventive Care</option>
                      <option value="Orthodontics">Orthodontics</option>
                      <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
                      <option value="Oral Health">Oral Health</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Short Excerpt</label>
                    <input
                      type="text"
                      placeholder="Brief overview for blog cards..."
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Article Content</label>
                    <textarea
                      rows={4}
                      placeholder="Write educational content for patients..."
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="w-full bg-[#0f2132] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Publish to Website Blog
                  </button>
                </form>
              </div>

              {/* Published Articles List */}
              <div className="lg:col-span-2 bg-[#142637] p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <h3 className="text-lg font-bold text-white">Your Published Articles</h3>
                  <span className="text-xs text-slate-400">{blogs.length} Published</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogs.map((b) => (
                    <div key={b.id} className="bg-[#0f2132] p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold bg-[#3ec1d3]/10 text-[#3ec1d3] px-2 py-0.5 rounded-md">
                          {b.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2 leading-snug">{b.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.excerpt || b.content}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-700/60 pt-2 text-[11px] text-slate-500">
                        <span>{b.date}</span>
                        <button
                          onClick={() => setBlogs(blogs.filter((x) => x.id !== b.id))}
                          className="text-red-400 hover:text-red-300 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Digital Prescription Print Modal ───────────────────────────────────── */}
      {activeRxPrint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveRxPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Printable RX Document */}
            <div id="rx-printable-doc" className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#3ec1d3] pb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0e2a47]">DentoCare Dental Clinic</h2>
                  <p className="text-xs text-slate-500">Official Clinical Digital Prescription</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#3ec1d3]">{activeRxPrint.prescriptionNumber}</p>
                  <p className="text-xs text-slate-400">{new Date(activeRxPrint.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Patient Information</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{activeRxPrint.patientName}</p>
                  <p className="text-slate-600">Age: {activeRxPrint.patientAge} | Gender: {activeRxPrint.patientGender}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Attending Doctor</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{doctor.name}</p>
                  <p className="text-[#3ec1d3] font-semibold">{doctor.specialization}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Rx Prescribed Medicines</p>
                <table className="w-full text-xs border text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border">Medicine</th>
                      <th className="p-2 border">Dosage</th>
                      <th className="p-2 border">Duration</th>
                      <th className="p-2 border">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRxPrint.medicines?.map((m, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2 font-bold border">{m.name}</td>
                        <td className="p-2 border">{m.dosage}</td>
                        <td className="p-2 border">{m.duration}</td>
                        <td className="p-2 border text-slate-600">{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border text-xs space-y-2">
                <p className="font-bold text-slate-700">Clinical Advice:</p>
                <p className="text-slate-600">{activeRxPrint.advice}</p>
                {activeRxPrint.nextVisitDate && (
                  <p className="font-bold text-[#3ec1d3]">Next Follow-Up Date: {activeRxPrint.nextVisitDate}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => window.print()}
                className="bg-[#3ec1d3] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#34adb9] flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print PDF Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Printable Invoice Modal ───────────────────────────────────────────── */}
      {activeInvoicePrint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveInvoicePrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-4">
              <div className="border-b pb-3 text-center">
                <h3 className="text-xl font-extrabold text-[#0e2a47]">DentoCare Clinic Invoice</h3>
                <p className="text-xs text-slate-500">Invoice ID: {activeInvoicePrint.id}</p>
              </div>

              <div className="text-xs space-y-1">
                <p><span className="font-bold">Patient:</span> {activeInvoicePrint.patientName}</p>
                <p><span className="font-bold">Procedure:</span> {activeInvoicePrint.procedure}</p>
                <p><span className="font-bold">Date:</span> {activeInvoicePrint.date}</p>
              </div>

              <div className="border-t border-b py-3 text-xs space-y-1.5">
                <div className="flex justify-between font-bold"><span>Total Procedure Fee:</span><span>${activeInvoicePrint.amount}</span></div>
                <div className="flex justify-between text-emerald-600"><span>Advance Paid:</span><span>-${activeInvoicePrint.advance}</span></div>
                <div className="flex justify-between font-extrabold text-amber-600 text-sm pt-1 border-t"><span>Balance Due:</span><span>${activeInvoicePrint.due}</span></div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-[#3ec1d3] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#34adb9] cursor-pointer"
              >
                Print Official Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Doctor Profile Modal ─────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#142637] text-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700/60 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4">Edit Specialist Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Specialization</label>
                <input
                  type="text"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Consultation Fee ($)</label>
                <input
                  type="number"
                  value={editForm.consultationFee}
                  onChange={(e) => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })}
                  className="w-full bg-[#0f2132] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#0f2132] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-700 px-4 py-2 rounded-lg font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white px-5 py-2 rounded-lg font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentistPortal;
