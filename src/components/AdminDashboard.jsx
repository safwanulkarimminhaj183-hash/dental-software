import React, { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  XCircle,
  AlertCircle,
  LogOut,
  UserCheck,
  Trash2,
  BarChart3,
  DollarSign,
  TrendingUp,
  FileText,
  Send,
  Download,
  Lock,
  Plus,
  Radio,
  Sparkles,
  ShieldAlert,
  Activity,
  Users,
  CreditCard,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Navbar from './Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ─── Helper: Format currency ──────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

// ─── Stat Card Component ──────────────────────────────────────────────────────
const StatCard = ({ label, value, subLabel, Icon, colorClass, bgClass }) => (
  <div className={`${bgClass || 'bg-[#142637]'} border border-gray-700/60 rounded-2xl p-5 shadow-lg flex items-center justify-between`}>
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${colorClass || 'text-white'}`}>{value}</p>
      {subLabel && <p className="text-gray-500 text-xs mt-1">{subLabel}</p>}
    </div>
    {Icon && (
      <div className={`p-3 rounded-xl ${bgClass ? '' : 'bg-[#1c3247]'} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    )}
  </div>
);

// ─── Mini Bar Chart Component ─────────────────────────────────────────────────
const MiniBarChart = ({ data, labelKey, valueKey, color = '#3ec1d3', title }) => {
  if (!data?.length) return <p className="text-gray-500 text-xs">No data available.</p>;
  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div>
      {title && <h4 className="text-sm font-bold text-[#3ec1d3] mb-3">{title}</h4>}
      <div className="flex items-end gap-1.5 h-24">
        {data.map((item, i) => {
          const pct = Math.round(((item[valueKey] || 0) / maxVal) * 100);
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0" title={`${item[labelKey]}: ${item[valueKey]}`}>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.85 }}
              />
              <span className="text-[9px] text-gray-500 mt-1 truncate w-full text-center">
                {(item[labelKey] || '').toString().slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard');

  const [activeTab, setActiveTab] = useState(isDashboardRoute ? 'analytics' : 'appointments');
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastSocketEvent, setLastSocketEvent] = useState(null);
  const [analyticsSource, setAnalyticsSource] = useState('');

  // Prescription Form State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxLoading, setRxLoading] = useState(false);
  const [rxForm, setRxForm] = useState({
    patientName: '',
    patientEmail: '',
    patientAge: '',
    doctorName: 'Dr. Sarah Johnson (DDS, Orthodontics)',
    diagnosis: '',
    generalAdvice: 'Maintain good oral hygiene and follow medication schedule.',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ],
  });

  // Schedule Slot Blocking
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockSlot, setBlockSlot] = useState('');

  const navigate = useNavigate();

  // Sync tab with route
  useEffect(() => {
    if (location.pathname.includes('/dashboard')) setActiveTab('analytics');
    else if (location.pathname.includes('/admin')) setActiveTab('appointments');
  }, [location.pathname]);

  // ── Auth helpers ────────────────────────────────────────────────────────────
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'x-admin-key': 'dentocare_admin_sandbox_key_2026',
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ── Fetch: Admin Analytics (MongoDB Aggregation) ─────────────────────────────
  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setAnalyticsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setAnalytics(mockAnalytics);
    setAnalyticsSource('Mock Data');
    setAnalyticsLoading(false);
  }, []);

  // ── Fetch: All Appointments ─────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setAppointments(mockAppointments);
    setLoading(false);
  }, []);

  // ── Fetch: Schedule & Available Slots ──────────────────────────────────────
  const fetchSchedule = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setSchedule(mockSchedule);
    setAvailableSlots(mockSchedule.availableSlots || []);
    if (mockSchedule.availableSlots?.length > 0) {
      setBlockSlot(mockSchedule.availableSlots[0].slot);
    }
  }, [blockDate]);

  // ── Fetch: Financial Summary ────────────────────────────────────────────────
  const fetchFinancials = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setFinancials(mockFinancials);
  }, []);

  // ── Fetch: Prescriptions List ───────────────────────────────────────────────
  const fetchPrescriptions = useCallback(async () => {
    await new Promise(r => setTimeout(r, 400));
    setPrescriptions(mockPrescriptions);
  }, []);

  // ── Socket.io Real-Time Connection ─────────────────────────────────────────
  useEffect(() => {
    fetchAppointments();
    fetchAnalytics();
    fetchSchedule();
    fetchFinancials();
    fetchPrescriptions();

    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_admin_hub');
    });

    socket.on('disconnect', () => setSocketConnected(false));

    // Admin hub acknowledgment
    socket.on('admin:connected', (data) => {
      console.log('✅ Admin hub connected:', data.message);
    });

    // Real-time appointment events
    socket.on('admin:appointment_updated', (data) => {
      setLastSocketEvent(`Appointment updated: ${data.patientName} → ${data.status}`);
      fetchAppointments();
      fetchAnalytics(true);
    });

    socket.on('admin:appointment_cancelled', (data) => {
      setLastSocketEvent(`Appointment cancelled: ${data.patientName}`);
      fetchAppointments();
      fetchAnalytics(true);
    });

    // Revenue events
    socket.on('admin:revenue_updated', (data) => {
      setLastSocketEvent(`Payment received: ${data.patientName} — ${fmt(data.amountPaid)}`);
      fetchAnalytics(true);
      fetchFinancials();
    });

    socket.on('admin:payment_failed', (data) => {
      setLastSocketEvent(`⚠️ Payment failed: ${data.patientName}`);
    });

    // Schedule events
    socket.on('admin:schedule_updated', () => {
      setLastSocketEvent('Schedule updated by admin.');
      fetchSchedule();
    });

    // Prescription events
    socket.on('admin:prescription_created', (data) => {
      setLastSocketEvent(`Rx ${data.prescriptionNumber} issued to ${data.patientName}`);
      fetchPrescriptions();
    });

    return () => socket.disconnect();
  }, [fetchAppointments, fetchAnalytics, fetchSchedule, fetchFinancials, fetchPrescriptions]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStatusChange = async (id, newStatus) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        showNotification(`Status updated to "${newStatus}" successfully.`);
      } else {
        // Fallback to old public endpoint
        await fetch(`${API_BASE}/api/v1/appointments/${id}/status`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus }),
        });
        setAppointments((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockSlotSubmit = async (e) => {
    e.preventDefault();
    if (!blockSlot) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/schedule/block-slot`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date: blockDate, timeSlot: blockSlot, reason: 'Blocked by Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchSchedule();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setRxLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/prescriptions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rxForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Prescription ${data.prescription.prescriptionNumber} generated${data.emailSent ? ' & emailed!' : ' (email pending SMTP config).'}`);
        setIsRxModalOpen(false);
        setRxForm({
          patientName: '', patientEmail: '', patientAge: '',
          doctorName: 'Dr. Sarah Johnson (DDS, Orthodontics)',
          diagnosis: '', generalAdvice: 'Maintain good oral hygiene.',
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        });
        fetchPrescriptions();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      showNotification(`Prescription failed: ${err.message}`, 'error');
    } finally {
      setRxLoading(false);
    }
  };

  const handleWebhookTest = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/financials/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: 250, paymentStatus: 'Paid' }),
      });
      const d = await res.json();
      if (d.success) {
        showNotification('✅ Payment webhook processed! Dashboard metrics updated.');
        fetchFinancials();
        fetchAnalytics(true);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const addMedication = () => {
    setRxForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    }));
  };

  const updateMedication = (index, field, value) => {
    setRxForm((prev) => {
      const meds = [...prev.medications];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medications: meds };
    });
  };

  const removeMedication = (index) => {
    setRxForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  // ── Filtered Appointments ───────────────────────────────────────────────────
  const filteredAppointments = appointments.filter((item) => {
    const s = (item.status || 'pending').toLowerCase();
    if (statusFilter !== 'all' && s !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (item.name || item.patientName || '').toLowerCase().includes(q) ||
        (item.phone || item.patientPhone || '').toLowerCase().includes(q) ||
        (item.email || item.patientEmail || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Navigation Tabs ─────────────────────────────────────────────────────────
  const TABS = [
    { id: 'analytics',     label: '📊 Analytics Hub',        icon: BarChart3   },
    { id: 'appointments',  label: '📅 Appointments',          icon: Calendar    },
    { id: 'schedule',      label: '⏰ Schedule Manager',      icon: Clock       },
    { id: 'prescriptions', label: '💊 Prescriptions',         icon: FileText    },
    { id: 'financials',    label: '💳 Financial Hub',         icon: DollarSign  },
  ];

  // ── Status Badge ────────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const config = {
      pending:   'bg-amber-500/20 text-amber-300 border-amber-500/30',
      approved:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      completed: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      replied:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return (
      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border uppercase ${config[s] || 'bg-gray-700/40 text-gray-300 border-gray-600'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c1c2b] text-white">
      <Navbar />

      <div className="p-4 sm:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">

          {/* ── Top Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to="/" className="p-2 bg-[#142637] hover:bg-[#1c3247] rounded-lg text-[#3ec1d3] border border-gray-700/60 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Clinic Admin <span className="text-[#3ec1d3]">Control Center</span>
                </h1>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold border ${
                  socketConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  <Radio className={`w-3 h-3 ${socketConnected ? 'animate-pulse text-emerald-400' : ''}`} />
                  {socketConnected ? 'Live WebSockets' : 'Connecting…'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {storedUser?.name && <span className="text-[#3ec1d3] font-semibold">{storedUser.name}</span>}
                {storedUser?.role && <span className="ml-2 text-xs bg-[#142637] border border-gray-700 px-2 py-0.5 rounded-full capitalize">{storedUser.role.replace('_', ' ')}</span>}
                <span className="ml-2 text-gray-500">· MongoDB Aggregation · Redis Cache · Socket.io · PDFKit</span>
              </p>
              {lastSocketEvent && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                  <Activity className="w-3 h-3" /> {lastSocketEvent}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsRxModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#0c1c2b] font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>+ Write Rx Prescription</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ── Toast Notification ──────────────────────────────────────────── */}
          {notification && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${
              notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'error'
                  ? <AlertCircle className="w-5 h-5" />
                  : <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                }
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white font-bold ml-4">✕</button>
            </div>
          )}

          {/* ── Navigation Tabs ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 border-b border-gray-800 pb-4 mb-8 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#3ec1d3] text-[#0c1c2b] shadow-lg scale-105'
                      : 'bg-[#142637] text-gray-300 hover:text-white border border-gray-700/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 1 — MongoDB Analytics Hub
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Cache source badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {analyticsSource && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      analyticsSource === 'redis_cache'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {analyticsSource === 'redis_cache' ? '⚡ Redis Cache HIT' : '🍃 MongoDB Live Query'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fetchAnalytics()}
                  disabled={analyticsLoading}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#3ec1d3] transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                  {analyticsLoading ? 'Computing…' : 'Refresh Analytics'}
                </button>
              </div>

              {analyticsLoading && !analytics && (
                <div className="text-center py-20 text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#3ec1d3]" />
                  <p>Running MongoDB Aggregation Pipelines…</p>
                </div>
              )}

              {analytics && (
                <>
                  {/* ── KPI Overview Row ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                      label="Total Revenue"
                      value={fmt(analytics.totalRevenue)}
                      subLabel="via $group aggregation"
                      Icon={DollarSign}
                      colorClass="text-emerald-400"
                    />
                    <StatCard
                      label="Total Appointments"
                      value={analytics.totalAppointments?.toLocaleString() || '0'}
                      subLabel="All-time count"
                      Icon={Calendar}
                      colorClass="text-sky-400"
                    />
                    <StatCard
                      label="Distinct Patients"
                      value={analytics.totalPatientsCount?.toLocaleString() || '0'}
                      subLabel="via $distinct emails"
                      Icon={Users}
                      colorClass="text-purple-400"
                    />
                    <StatCard
                      label="New Patients (Month)"
                      value={analytics.newPatientsThisMonth?.toLocaleString() || '0'}
                      subLabel="Current calendar month"
                      Icon={UserCheck}
                      colorClass="text-teal-400"
                    />
                  </div>

                  {/* ── Secondary KPIs ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                      label="Total Billed (Invoices)"
                      value={fmt(analytics.totalBilled)}
                      subLabel="Billing model total"
                      Icon={CreditCard}
                      colorClass="text-amber-400"
                    />
                    <StatCard
                      label="Total Outstanding"
                      value={fmt(analytics.totalOutstanding)}
                      subLabel="Unpaid balance"
                      Icon={AlertCircle}
                      colorClass="text-rose-400"
                    />
                    <StatCard
                      label="Prescriptions (Month)"
                      value={analytics.prescriptionsThisMonth?.toLocaleString() || '0'}
                      subLabel="Issued this month"
                      Icon={Stethoscope}
                      colorClass="text-[#3ec1d3]"
                    />
                    <StatCard
                      label="Treatment Plans"
                      value={analytics.totalTreatmentsCount?.toLocaleString() || '0'}
                      subLabel="Available plans"
                      Icon={TrendingUp}
                      colorClass="text-indigo-400"
                    />
                  </div>

                  {/* ── Charts Row ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Revenue Trend */}
                    <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                      <MiniBarChart
                        data={analytics.monthlyRevenueTrend}
                        labelKey="label"
                        valueKey="monthlyRevenue"
                        color="#3ec1d3"
                        title="📈 Monthly Revenue Trend ($group + $sort)"
                      />
                    </div>

                    {/* Monthly Appointment Trend */}
                    <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                      <MiniBarChart
                        data={analytics.monthlyAppointmentTrend}
                        labelKey="label"
                        valueKey="appointments"
                        color="#8b5cf6"
                        title="📅 Monthly Appointments (Booking Volume)"
                      />
                    </div>
                  </div>

                  {/* ── Popular Treatments & Payment Breakdown ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Treatments */}
                    <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                      <h3 className="text-sm font-bold text-[#3ec1d3] mb-4">
                        🦷 Top Dental Treatments ($group + $sort)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                              <th className="pb-2">Treatment</th>
                              <th className="pb-2 text-right">Bookings</th>
                              <th className="pb-2 text-right">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/50">
                            {(analytics.popularTreatments || []).map((t, i) => (
                              <tr key={i} className="hover:bg-[#182e42]">
                                <td className="py-2.5 font-medium text-white">{t._id || 'General Treatment'}</td>
                                <td className="py-2.5 text-right text-emerald-400 font-bold">{t.bookingsCount}</td>
                                <td className="py-2.5 text-right text-gray-300">{fmt(t.revenueGenerated)}</td>
                              </tr>
                            ))}
                            {!analytics.popularTreatments?.length && (
                              <tr><td colSpan={3} className="py-4 text-center text-gray-500 text-xs">No booking data yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payment Status + Appointment Status */}
                    <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-[#3ec1d3] mb-3">💳 Payment Status Breakdown</h3>
                        <div className="space-y-2">
                          {(analytics.paymentStatuses || []).map((ps, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-gray-300 capitalize">{ps._id || 'Unknown'}</span>
                              <span className="font-bold text-white">{ps.count} · {fmt(ps.sumAmount)}</span>
                            </div>
                          ))}
                          {!analytics.paymentStatuses?.length && <p className="text-gray-500 text-xs">No payment data.</p>}
                        </div>
                      </div>
                      <div className="border-t border-gray-800 pt-4">
                        <h3 className="text-sm font-bold text-purple-400 mb-3">📋 Appointment Status Stats</h3>
                        <div className="space-y-2">
                          {(analytics.appointmentStatusStats || []).map((as, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-300 capitalize">{as._id || 'Unknown'}</span>
                              <span className="font-bold text-white">{as.count}</span>
                            </div>
                          ))}
                          {!analytics.appointmentStatusStats?.length && <p className="text-gray-500 text-xs">No appointment data.</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Staff stats */}
                  {analytics.staffStats?.length > 0 && (
                    <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                      <h3 className="text-sm font-bold text-[#3ec1d3] mb-4">👥 Staff / Role Distribution</h3>
                      <div className="flex flex-wrap gap-3">
                        {analytics.staffStats.map((s, i) => (
                          <div key={i} className="bg-[#0c1c2b] border border-gray-700 px-4 py-2.5 rounded-xl text-center">
                            <p className="text-xs text-gray-400 capitalize">{(s._id || 'Unknown').replace('_', ' ')}</p>
                            <p className="text-xl font-extrabold text-white mt-0.5">{s.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 2 — Appointments Hub
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'appointments' && (
            <div>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard label="Total Bookings" value={appointments.length} Icon={Calendar} colorClass="text-[#3ec1d3]" />
                <StatCard label="Total Revenue" value={fmt(analytics?.totalRevenue)} Icon={DollarSign} colorClass="text-emerald-400" />
                <StatCard label="Distinct Patients" value={analytics?.totalPatientsCount || 0} Icon={Users} colorClass="text-sky-400" />
                <StatCard
                  label="Working Hours"
                  value={`${schedule?.workingHours?.startTime || '09:00 AM'} – ${schedule?.workingHours?.endTime || '06:00 PM'}`}
                  Icon={Clock}
                  colorClass="text-purple-400"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, or phone…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#142637] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 bg-[#142637] border border-gray-700 rounded-xl text-sm text-white"
                >
                  {['all', 'pending', 'approved', 'confirmed', 'cancelled', 'completed'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button onClick={fetchAppointments} className="flex items-center gap-1.5 px-3 py-2 bg-[#142637] border border-gray-700 rounded-xl text-xs text-gray-400 hover:text-white">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#142637] border border-gray-700/60 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0e2133] text-[#3ec1d3] text-xs font-bold uppercase">
                        <th className="p-4">Patient</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Service</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading appointments…</td></tr>
                      ) : filteredAppointments.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-gray-500">No appointments found.</td></tr>
                      ) : (
                        filteredAppointments.map((item) => (
                          <tr key={item._id} className="hover:bg-[#182e42]">
                            <td className="p-4 font-bold text-white">{item.name || item.patientName}</td>
                            <td className="p-4 text-gray-300 text-xs">
                              <span>{item.phone || item.patientPhone}</span><br />
                              <span className="text-gray-500">{item.email || item.patientEmail}</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-sky-500/10 text-sky-300 text-xs px-2.5 py-1 rounded font-medium">
                                {item.department || item.serviceName || 'General'}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : '—'}
                              <br />
                              <span className="text-gray-400">{item.appointmentTime || '—'}</span>
                            </td>
                            <td className="p-4">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleStatusChange(item._id, 'confirmed')}
                                  disabled={actionLoadingId === item._id}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleStatusChange(item._id, 'cancelled')}
                                  disabled={actionLoadingId === item._id}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 3 — Dynamic Schedule Manager
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Schedule Config Overview */}
              {schedule && (
                <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">Active Clinic Schedule</h3>
                    <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full font-bold">
                      {schedule.slotDurationMinutes || 30} min / slot
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0c1c2b] p-3 rounded-xl">
                      <p className="text-xs text-gray-400">Doctor</p>
                      <p className="text-sm font-bold text-white mt-1">{schedule.doctorName}</p>
                    </div>
                    <div className="bg-[#0c1c2b] p-3 rounded-xl">
                      <p className="text-xs text-gray-400">Working Hours</p>
                      <p className="text-sm font-bold text-[#3ec1d3] mt-1">
                        {schedule.workingHours?.startTime} – {schedule.workingHours?.endTime}
                      </p>
                    </div>
                    <div className="bg-[#0c1c2b] p-3 rounded-xl">
                      <p className="text-xs text-gray-400">Break Time</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">
                        {schedule.breakHours?.breakStart} – {schedule.breakHours?.breakEnd}
                      </p>
                    </div>
                    <div className="bg-[#0c1c2b] p-3 rounded-xl">
                      <p className="text-xs text-gray-400">Working Days</p>
                      <p className="text-xs font-bold text-white mt-1">{(schedule.workingDays || []).join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Block Slot Form */}
              <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-2">Block a Time Slot</h3>
                <p className="text-xs text-gray-400 mb-5">Prevent patients from booking a specific date/time slot.</p>
                <form onSubmit={handleBlockSlotSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">Select Date</label>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5">Time Slot</label>
                    <select
                      value={blockSlot}
                      onChange={(e) => setBlockSlot(e.target.value)}
                      className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm text-white"
                    >
                      {availableSlots.length > 0
                        ? availableSlots.map((s) => (
                            <option key={s.slot} value={s.slot}>{s.slot} {s.isBlocked ? '(Blocked)' : s.isBooked ? '(Booked)' : ''}</option>
                          ))
                        : ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))
                      }
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer">
                      🔒 Block Slot
                    </button>
                  </div>
                </form>
              </div>

              {/* Slot Status Grid */}
              <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                <h4 className="font-bold text-sm text-[#3ec1d3] mb-4">
                  Slot Availability Grid — {blockDate}
                </h4>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availableSlots.map((slotObj, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          slotObj.isBlocked
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : slotObj.isBooked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        <p>{slotObj.slot}</p>
                        <span className="text-[10px] uppercase mt-0.5 block">
                          {slotObj.isBlocked ? '🔒 Blocked' : slotObj.isBooked ? '📅 Booked' : '✅ Free'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No slots configured. Update schedule settings.</p>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 4 — Prescriptions (PDFKit)
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Digital Prescription Manager</h3>
                  <p className="text-xs text-gray-400 mt-1">PDFKit-generated prescriptions emailed directly to patients via Nodemailer.</p>
                </div>
                <button
                  onClick={() => setIsRxModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#0c1c2b] font-extrabold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> New Prescription
                </button>
              </div>

              <div className="bg-[#142637] border border-gray-700/60 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0e2133] text-[#3ec1d3] text-xs font-bold uppercase">
                        <th className="p-4">Rx No.</th>
                        <th className="p-4">Patient</th>
                        <th className="p-4">Doctor</th>
                        <th className="p-4">Diagnosis</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Email Sent</th>
                        <th className="p-4 text-center">Download</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {prescriptions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-gray-500">
                            No prescriptions issued yet. Click "+ New Prescription" to create one.
                          </td>
                        </tr>
                      ) : (
                        prescriptions.map((rx) => (
                          <tr key={rx._id} className="hover:bg-[#182e42]">
                            <td className="p-4 font-bold text-[#3ec1d3] font-mono text-xs">{rx.prescriptionNumber}</td>
                            <td className="p-4 font-medium text-white">
                              {rx.patientName}
                              <br />
                              <span className="text-gray-500 text-xs">{rx.patientEmail}</span>
                            </td>
                            <td className="p-4 text-gray-300 text-xs">{rx.doctorName}</td>
                            <td className="p-4 text-gray-300 text-xs max-w-[200px] truncate">{rx.diagnosis}</td>
                            <td className="p-4 text-gray-400 text-xs">{new Date(rx.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rx.emailSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                                {rx.emailSent ? '✓ Sent' : '— Pending'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <a
                                href={`${API_BASE}/api/admin/prescriptions/${rx._id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#3ec1d3]/20 hover:bg-[#3ec1d3]/30 text-[#3ec1d3] text-xs font-bold rounded-lg transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" /> PDF
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              TAB 5 — Financial Hub
          ════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* KPIs */}
              {financials && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <StatCard
                    label="Total Billed (Invoices)"
                    value={fmt(financials.billingOverview?.totalBilled)}
                    Icon={CreditCard}
                    colorClass="text-[#3ec1d3]"
                  />
                  <StatCard
                    label="Total Collected"
                    value={fmt(financials.billingOverview?.totalPaid)}
                    Icon={DollarSign}
                    colorClass="text-emerald-400"
                  />
                  <StatCard
                    label="Total Outstanding"
                    value={fmt(financials.billingOverview?.totalDue)}
                    Icon={AlertCircle}
                    colorClass="text-rose-400"
                  />
                </div>
              )}

              {/* Payment Method Breakdown */}
              {financials?.paymentMethodBreakdown?.length > 0 && (
                <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-[#3ec1d3] mb-4">Payment Method Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {financials.paymentMethodBreakdown.map((pm, i) => (
                      <div key={i} className="bg-[#0c1c2b] border border-gray-800 p-3 rounded-xl text-center">
                        <p className="text-xs text-gray-400 capitalize">{pm._id?.replace('_', ' ') || 'Other'}</p>
                        <p className="text-xl font-extrabold text-white mt-1">{pm.count}</p>
                        <p className="text-xs text-emerald-400">{fmt(pm.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stripe Webhook Simulator */}
              <div className="bg-[#142637] border border-gray-700/60 p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">💳 Payment Gateway Webhook Simulator</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Simulates a Stripe/SSLCommerz webhook event — updates payment status in MongoDB
                      and broadcasts real-time revenue change via Socket.io to all connected admin clients.
                    </p>
                  </div>
                  <button
                    onClick={handleWebhookTest}
                    className="bg-[#3ec1d3] text-[#0c1c2b] font-extrabold px-5 py-2.5 rounded-xl text-xs hover:bg-[#34adb9] cursor-pointer whitespace-nowrap shadow-lg"
                  >
                    Trigger Webhook Event (+$250)
                  </button>
                </div>

                {/* Webhook Architecture Info */}
                <div className="mt-5 bg-[#0c1c2b] border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 font-bold mb-2">Webhook Processing Architecture:</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      'POST /api/admin/financials/webhook',
                      '→ Verify Stripe Signature (STRIPE_WEBHOOK_SECRET)',
                      '→ Match PaymentIntent ID in MongoDB',
                      '→ Update Booking.paymentStatus = "Paid"',
                      '→ deleteCachePattern("admin:*") [Redis]',
                      '→ notifyAdminDashboard("admin:revenue_updated") [Socket.io]',
                    ].map((step, i) => (
                      <span key={i} className="bg-[#142637] border border-gray-700 px-2.5 py-1 rounded-lg text-gray-300">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Booking Invoices */}
              {financials?.recentBookingInvoices?.length > 0 && (
                <div className="bg-[#142637] border border-gray-700/60 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="font-bold text-sm text-[#3ec1d3]">Recent Booking Invoices</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 bg-[#0e2133] text-gray-400 text-xs uppercase">
                          <th className="p-4">Ref</th>
                          <th className="p-4">Patient</th>
                          <th className="p-4">Treatment</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Paid</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {financials.recentBookingInvoices.map((inv, i) => (
                          <tr key={i} className="hover:bg-[#182e42]">
                            <td className="p-4 font-mono text-xs text-gray-400">{inv.bookingReference}</td>
                            <td className="p-4 font-medium text-white">{inv.patientName}</td>
                            <td className="p-4 text-gray-300 text-xs">{inv.treatmentPlanTitle}</td>
                            <td className="p-4 font-bold text-white">{fmt(inv.totalAmount)}</td>
                            <td className="p-4 text-emerald-400 font-bold">{fmt(inv.amountPaid)}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                                inv.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                inv.paymentStatus === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-rose-500/20 text-rose-400'
                              }`}>
                                {inv.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Write Rx Prescription Modal (PDFKit + Nodemailer)
      ══════════════════════════════════════════════════════════════════════ */}
      {isRxModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#142637] border border-gray-700 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative text-white my-8">
            <button onClick={() => setIsRxModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white font-bold text-lg">✕</button>

            <h3 className="text-xl font-extrabold text-[#3ec1d3] mb-1">Generate Digital Prescription</h3>
            <p className="text-xs text-gray-400 mb-6">
              Saved to MongoDB → PDFKit compiles professional PDF → Nodemailer emails to patient instantly.
            </p>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Patient Name *</label>
                  <input
                    type="text"
                    value={rxForm.patientName}
                    onChange={(e) => setRxForm({ ...rxForm, patientName: e.target.value })}
                    className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm"
                    placeholder="e.g. Jane Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Patient Email *</label>
                  <input
                    type="email"
                    value={rxForm.patientEmail}
                    onChange={(e) => setRxForm({ ...rxForm, patientEmail: e.target.value })}
                    className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm"
                    placeholder="patient@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Patient Age</label>
                  <input
                    type="number"
                    value={rxForm.patientAge}
                    onChange={(e) => setRxForm({ ...rxForm, patientAge: e.target.value })}
                    className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm"
                    placeholder="30"
                    min="1" max="120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Doctor Name</label>
                  <input
                    type="text"
                    value={rxForm.doctorName}
                    onChange={(e) => setRxForm({ ...rxForm, doctorName: e.target.value })}
                    className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={rxForm.diagnosis}
                  onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                  className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm"
                  placeholder="e.g. Mild dental fluorosis and bite misalignment"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">General Advice</label>
                <textarea
                  rows={2}
                  value={rxForm.generalAdvice}
                  onChange={(e) => setRxForm({ ...rxForm, generalAdvice: e.target.value })}
                  className="w-full p-2.5 bg-[#0c1c2b] border border-gray-700 rounded-xl text-sm resize-none"
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Medications</label>
                  <button type="button" onClick={addMedication} className="text-xs text-[#3ec1d3] hover:text-white flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Medication
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rxForm.medications.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2 bg-[#0c1c2b] p-2.5 rounded-xl border border-gray-800">
                      <input
                        placeholder="Name"
                        value={med.name}
                        onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                        className="col-span-2 bg-transparent border-b border-gray-700 text-xs text-white p-1 focus:outline-none"
                      />
                      <input
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                        className="bg-transparent border-b border-gray-700 text-xs text-white p-1 focus:outline-none"
                      />
                      <input
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                        className="bg-transparent border-b border-gray-700 text-xs text-white p-1 focus:outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                          className="bg-transparent border-b border-gray-700 text-xs text-white p-1 focus:outline-none flex-1"
                        />
                        {rxForm.medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(idx)} className="text-rose-400 hover:text-rose-300 text-xs">✕</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={rxLoading}
                className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] disabled:opacity-60 text-[#0c1c2b] font-extrabold py-3 rounded-xl text-sm cursor-pointer shadow-lg"
              >
                {rxLoading ? '⏳ Generating PDF & Sending Email…' : '📋 Generate PDF & Send Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
