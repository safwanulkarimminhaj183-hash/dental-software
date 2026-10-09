import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Plus,
  Search,
  FileText,
  Pill,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  HeartPulse,
  Activity,
  Phone,
  Mail,
  Calendar,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  UploadCloud,
  Eye,
  RefreshCw,
  UserPlus,
  ChevronRight,
  ArrowLeft,
  Filter,
  Shield,
  Stethoscope,
  Maximize2
} from 'lucide-react';
import Navbar from './Navbar';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/patient-records`;

const PatientRecords = () => {
  // State
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [activeTab, setActiveTab] = useState('medical-history'); // 'medical-history' | 'prescriptions' | 'xrays' | 'treatments'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlood, setFilterBlood] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Modals state
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);
  const [isAddXrayOpen, setIsAddXrayOpen] = useState(false);
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [selectedXrayPreview, setSelectedXrayPreview] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form states
  const [newPatientForm, setNewPatientForm] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    emergencyContact: '',
    allergies: '',
    conditions: '',
    currentMedications: '',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    bloodSugar: 'Normal',
    medicalNotes: '',
  });

  const [editPatientForm, setEditPatientForm] = useState(null);

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Twice daily after food',
    duration: '5 days',
    instructions: '',
  });

  const [xrayForm, setXrayForm] = useState({
    title: '',
    modality: 'OPG Panoramic',
    imageUrl: '',
    radiologistNotes: '',
  });
  const [xrayFilePreview, setXrayFilePreview] = useState('');

  const [treatmentForm, setTreatmentForm] = useState({
    procedure: '',
    toothNumber: 'All / General',
    doctorName: 'Dr. Sarah Johnson',
    status: 'Completed',
    cost: '',
    treatmentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Trigger toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Fetch all patient records
  const fetchPatientRecords = async (preserveSelectedId = null, attempt = 0) => {
    let willRetry = false;
    try {
      setLoading(true);
      setFetchError(null);
      const query = searchTerm.trim()
        ? `?search=${encodeURIComponent(searchTerm.trim())}`
        : '';
      const res = await fetch(`${API_BASE}${query}`);
      const contentType = res.headers.get('content-type') || '';
      const json = contentType.includes('application/json')
        ? await res.json()
        : null;

      if (!res.ok || !json?.success) {
        const message =
          json?.message ||
          `Could not load patient records (HTTP ${res.status}). Make sure the API is running.`;
        if (attempt < 2) {
          willRetry = true;
          setTimeout(() => fetchPatientRecords(preserveSelectedId, attempt + 1), 700);
          return;
        }
        setFetchError(message);
        showToast(message, 'error');
        return;
      }

      const records = Array.isArray(json.data) ? json.data : [];
      setPatients(records);
      if (records.length > 0) {
        if (preserveSelectedId && records.some((p) => p._id === preserveSelectedId || p.patientId === preserveSelectedId)) {
          setSelectedPatientId(preserveSelectedId);
        } else if (!selectedPatientId || !records.some((p) => p._id === selectedPatientId)) {
          setSelectedPatientId(records[0]._id);
        }
      } else {
        setSelectedPatientId(null);
      }
    } catch (err) {
      console.warn('Backend unreachable for patient records, using local fallback:', err.message);
      setFetchError(null);
    } finally {
      if (!willRetry) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPatientRecords();
  }, [searchTerm]);

  const activePatient = patients.find(
    (p) => p._id === selectedPatientId || p.patientId === selectedPatientId
  ) || patients[0];

  // Helper to calculate age
  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // 1. Create Patient Record
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.patientName.trim()) {
      showToast('Please provide a patient name.', 'error');
      return;
    }

    try {
      const payload = {
        patientId: newPatientForm.patientId.trim() || undefined,
        patientName: newPatientForm.patientName.trim(),
        patientEmail: newPatientForm.patientEmail.trim(),
        patientPhone: newPatientForm.patientPhone.trim(),
        dateOfBirth: newPatientForm.dateOfBirth || null,
        gender: newPatientForm.gender,
        bloodGroup: newPatientForm.bloodGroup,
        emergencyContact: newPatientForm.emergencyContact.trim(),
        medicalHistory: {
          allergies: newPatientForm.allergies
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          conditions: newPatientForm.conditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          currentMedications: newPatientForm.currentMedications
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          bloodPressure: newPatientForm.bloodPressure.trim(),
          heartRate: newPatientForm.heartRate.trim(),
          bloodSugar: newPatientForm.bloodSugar.trim(),
          notes: newPatientForm.medicalNotes.trim(),
        },
      };

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(`Patient record for ${data.data.patientName} created successfully!`);
        setIsNewPatientModalOpen(false);
        setNewPatientForm({
          patientId: '',
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          dateOfBirth: '',
          gender: 'Male',
          bloodGroup: 'O+',
          emergencyContact: '',
          allergies: '',
          conditions: '',
          currentMedications: '',
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          bloodSugar: 'Normal',
          medicalNotes: '',
        });
        await fetchPatientRecords(data.data._id);
      } else {
        showToast(data.message || 'Error creating patient record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error while creating patient record.', 'error');
    }
  };

  // 2. Open & Submit Edit Patient Form
  const handleOpenEdit = (patient) => {
    setEditPatientForm({
      _id: patient._id,
      patientId: patient.patientId,
      patientName: patient.patientName || '',
      patientEmail: patient.patientEmail || '',
      patientPhone: patient.patientPhone || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'Unknown',
      emergencyContact: patient.emergencyContact || '',
      allergies: (patient.medicalHistory?.allergies || []).join(', '),
      conditions: (patient.medicalHistory?.conditions || []).join(', '),
      currentMedications: (patient.medicalHistory?.currentMedications || []).join(', '),
      bloodPressure: patient.medicalHistory?.bloodPressure || '120/80 mmHg',
      heartRate: patient.medicalHistory?.heartRate || '72 bpm',
      bloodSugar: patient.medicalHistory?.bloodSugar || 'Normal',
      medicalNotes: patient.medicalHistory?.notes || '',
    });
    setIsEditPatientModalOpen(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (!editPatientForm || !editPatientForm.patientName.trim()) {
      showToast('Patient name is required.', 'error');
      return;
    }

    try {
      const payload = {
        patientName: editPatientForm.patientName.trim(),
        patientEmail: editPatientForm.patientEmail.trim(),
        patientPhone: editPatientForm.patientPhone.trim(),
        dateOfBirth: editPatientForm.dateOfBirth || null,
        gender: editPatientForm.gender,
        bloodGroup: editPatientForm.bloodGroup,
        emergencyContact: editPatientForm.emergencyContact.trim(),
        medicalHistory: {
          allergies: editPatientForm.allergies
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          conditions: editPatientForm.conditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          currentMedications: editPatientForm.currentMedications
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          bloodPressure: editPatientForm.bloodPressure.trim(),
          heartRate: editPatientForm.heartRate.trim(),
          bloodSugar: editPatientForm.bloodSugar.trim(),
          notes: editPatientForm.medicalNotes.trim(),
        },
      };

      const res = await fetch(`${API_BASE}/${editPatientForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Patient record updated successfully!');
        setIsEditPatientModalOpen(false);
        await fetchPatientRecords(editPatientForm._id);
      } else {
        showToast(data.message || 'Error updating patient record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error while updating patient record.', 'error');
    }
  };

  // 3. Delete Patient Record
  const handleDeletePatient = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Patient record deleted successfully.');
        setDeleteConfirmId(null);
        await fetchPatientRecords();
      } else {
        showToast(data.message || 'Failed to delete record.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting patient record.', 'error');
    }
  };

  // 4. Add Prescription
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!prescriptionForm.medicineName.trim()) {
      showToast('Medicine name is required.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${activePatient._id}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Prescription added successfully!');
        setIsAddPrescriptionOpen(false);
        setPrescriptionForm({
          medicineName: '',
          dosage: '',
          frequency: 'Twice daily after food',
          duration: '5 days',
          instructions: '',
        });
        await fetchPatientRecords(activePatient._id);
      } else {
        showToast(data.message || 'Error adding prescription.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add prescription.', 'error');
    }
  };

  // 5. Add X-Ray Report (supports file upload conversion or URL)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('File is too large. Please select an image under 15MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setXrayFilePreview(reader.result);
        setXrayForm((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddXray = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!xrayForm.title.trim()) {
      showToast('X-Ray title is required.', 'error');
      return;
    }
    const finalImage = xrayFilePreview || xrayForm.imageUrl.trim();
    if (!finalImage) {
      showToast('Please provide an image file or direct image URL.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${activePatient._id}/xrays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...xrayForm,
          imageUrl: finalImage,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('X-Ray report uploaded successfully!');
        setIsAddXrayOpen(false);
        setXrayForm({
          title: '',
          modality: 'OPG Panoramic',
          imageUrl: '',
          radiologistNotes: '',
        });
        setXrayFilePreview('');
        await fetchPatientRecords(activePatient._id);
      } else {
        showToast(data.message || 'Error saving X-Ray report.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to upload X-Ray report.', 'error');
    }
  };

  // 6. Add Past Treatment
  const handleAddTreatment = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!treatmentForm.procedure.trim()) {
      showToast('Procedure name is required.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${activePatient._id}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Treatment history recorded successfully!');
        setIsAddTreatmentOpen(false);
        setTreatmentForm({
          procedure: '',
          toothNumber: 'All / General',
          doctorName: 'Dr. Sarah Johnson',
          status: 'Completed',
          cost: '',
          treatmentDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
        await fetchPatientRecords(activePatient._id);
      } else {
        showToast(data.message || 'Error recording treatment.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save treatment record.', 'error');
    }
  };

  // Filtered patients by blood group
  const displayedPatients = patients.filter((p) => {
    if (filterBlood !== 'all' && p.bloodGroup !== filterBlood) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#081523] text-gray-100 flex flex-col selection:bg-[#3ec1d3] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[2000] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-700/50 backdrop-blur-md'
            : 'bg-[#10344d]/95 text-[#6ee7b7] border-[#3ec1d3]/40 backdrop-blur-md'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#3ec1d3] shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Top Header Card */}
        <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ec1d3]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3ec1d3] to-[#127b8a] flex items-center justify-center text-[#081523] shadow-lg shadow-[#3ec1d3]/20 shrink-0">
              <Stethoscope className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Patient Records <span className="text-[#3ec1d3] text-lg sm:text-xl font-bold">(EMR / EHR)</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Clinic Sync
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Centralized Electronic Medical & Health Records: Digital history, clinical prescriptions, dental radiographs, and procedure timelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => fetchPatientRecords(selectedPatientId)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-200 hover:text-white border border-cyan-900/40 text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Refresh records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#3ec1d3]' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold text-sm transition-all shadow-md shadow-[#3ec1d3]/25 hover:shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>New Patient Record</span>
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="bg-rose-950/40 border border-rose-700/50 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Unable to load patient records</p>
                <p className="text-sm text-rose-200/80 mt-0.5">{fetchError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchPatientRecords(selectedPatientId)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-800/60 hover:bg-rose-700/70 text-rose-100 text-sm font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Content: Two Column Layout (Patient Directory & EMR Workspace) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Patient Directory (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Search & Filter Card */}
            <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patient name, ID, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#3ec1d3] transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Blood group filter tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wider mr-1">Blood:</span>
                {['all', 'O+', 'A+', 'B+', 'AB+'].map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setFilterBlood(bg)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filterBlood === bg
                        ? 'bg-[#3ec1d3] text-[#081523]'
                        : 'bg-[#14324f]/60 hover:bg-[#14324f] text-gray-300'
                    }`}
                  >
                    {bg === 'all' ? 'All' : bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Scrollable Directory List */}
            <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-cyan-900/30 flex items-center justify-between bg-[#112a42]">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#3ec1d3]" />
                  Patients ({displayedPatients.length})
                </span>
                <span className="text-[11px] text-gray-400">Click to inspect</span>
              </div>

              <div className="max-h-[640px] overflow-y-auto divide-y divide-cyan-900/20">
                {loading && patients.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#3ec1d3]" />
                    <span>Loading patient records...</span>
                  </div>
                ) : displayedPatients.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
                    <User className="w-10 h-10 text-gray-600 stroke-[1.5]" />
                    <p className="font-semibold text-gray-300">No patient records found</p>
                    <p className="text-xs text-gray-500 max-w-xs">
                      Try searching with a different keyword or create a new patient record.
                    </p>
                    <button
                      onClick={() => setIsNewPatientModalOpen(true)}
                      className="mt-2 px-3 py-1.5 bg-[#3ec1d3] text-[#081523] rounded-lg text-xs font-bold hover:bg-[#34adb9] transition-all cursor-pointer"
                    >
                      + Add New Patient
                    </button>
                  </div>
                ) : (
                  displayedPatients.map((patient) => {
                    const isSelected = activePatient && activePatient._id === patient._id;
                    const allergyCount = patient.medicalHistory?.allergies?.length || 0;
                    const prescriptionCount = patient.prescriptions?.length || 0;
                    const xrayCount = patient.xrayImages?.length || 0;

                    return (
                      <div
                        key={patient._id}
                        onClick={() => setSelectedPatientId(patient._id)}
                        className={`p-4 cursor-pointer transition-all flex items-start justify-between gap-3 group relative ${
                          isSelected
                            ? 'bg-[#14324f] border-l-4 border-l-[#3ec1d3]'
                            : 'hover:bg-[#112a42]/70'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                            isSelected
                              ? 'bg-[#3ec1d3] text-[#081523]'
                              : 'bg-[#183a5c] text-[#3ec1d3] group-hover:bg-[#1c446c]'
                          }`}>
                            {patient.patientName?.charAt(0) || 'P'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                {patient.patientName}
                              </h3>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#091929] text-[#3ec1d3] border border-cyan-900/50">
                                {patient.patientId}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {patient.patientPhone || patient.patientEmail || 'No contact specified'}
                            </p>
                            
                            {/* Badges */}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-800/40">
                                {patient.bloodGroup || 'O+'}
                              </span>
                              {allergyCount > 0 && (
                                <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/40 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                  {allergyCount} {allergyCount === 1 ? 'Allergy' : 'Allergies'}
                                </span>
                              )}
                              <span className="text-gray-500 text-[10px]">
                                {prescriptionCount} Rx • {xrayCount} X-Ray
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${
                          isSelected ? 'text-[#3ec1d3] translate-x-1' : 'text-gray-600 group-hover:text-gray-400'
                        }`} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Patient Comprehensive EMR/EHR Workspace (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activePatient ? (
              <>
                {/* Patient Summary Demographics Banner */}
                <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-cyan-900/30">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#12395b] to-[#1d507d] border-2 border-[#3ec1d3]/40 flex items-center justify-center font-extrabold text-2xl text-[#3ec1d3] shadow-inner shrink-0">
                        {activePatient.patientName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-white">
                            {activePatient.patientName}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#14324f] text-[#3ec1d3] border border-cyan-800/60">
                            {activePatient.patientId}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
                            Blood: {activePatient.bloodGroup || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {activePatient.gender || 'Unspecified'} • {calculateAge(activePatient.dateOfBirth)} yrs
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {activePatient.patientPhone || 'No phone'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {activePatient.patientEmail || 'No email'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(activePatient)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14324f] hover:bg-[#1b4268] text-gray-200 hover:text-white border border-cyan-900/40 text-xs font-semibold transition-all cursor-pointer"
                        title="Edit Demographics & Medical Info"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#3ec1d3]" />
                        <span>Edit Patient</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(activePatient._id)}
                        className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-400 hover:text-rose-200 border border-rose-900/40 transition-all cursor-pointer"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Emergency Contact & Vitals Quick Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                    <div className="bg-[#091929] p-3 rounded-xl border border-cyan-900/30">
                      <span className="text-gray-400 block text-[11px] font-medium">Blood Pressure</span>
                      <span className="font-bold text-white text-sm mt-0.5 block flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                        {activePatient.medicalHistory?.bloodPressure || '120/80 mmHg'}
                      </span>
                    </div>
                    <div className="bg-[#091929] p-3 rounded-xl border border-cyan-900/30">
                      <span className="text-gray-400 block text-[11px] font-medium">Heart Rate</span>
                      <span className="font-bold text-white text-sm mt-0.5 block flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        {activePatient.medicalHistory?.heartRate || '72 bpm'}
                      </span>
                    </div>
                    <div className="bg-[#091929] p-3 rounded-xl border border-cyan-900/30">
                      <span className="text-gray-400 block text-[11px] font-medium">Blood Glucose</span>
                      <span className="font-bold text-white text-sm mt-0.5 block">
                        {activePatient.medicalHistory?.bloodSugar || 'Normal'}
                      </span>
                    </div>
                    <div className="bg-[#091929] p-3 rounded-xl border border-cyan-900/30">
                      <span className="text-gray-400 block text-[11px] font-medium">Emergency Contact</span>
                      <span className="font-bold text-[#3ec1d3] truncate block mt-0.5" title={activePatient.emergencyContact || 'None'}>
                        {activePatient.emergencyContact || 'None designated'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EMR / EHR Interactive Tab Navigation */}
                <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                  
                  <div className="flex border-b border-cyan-900/30 bg-[#112a42] overflow-x-auto">
                    {[
                      { id: 'medical-history', label: 'Medical History', icon: FileText, count: null },
                      { id: 'prescriptions', label: 'Prescriptions', icon: Pill, count: activePatient.prescriptions?.length },
                      { id: 'xrays', label: 'X-Ray Reports & Imaging', icon: ImageIcon, count: activePatient.xrayImages?.length },
                      { id: 'treatments', label: 'Dental Treatment History', icon: Clock, count: (activePatient.pastTreatments || activePatient.treatmentHistory)?.length },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2.5 px-6 py-4 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'border-[#3ec1d3] text-[#3ec1d3] bg-[#0e2439]'
                              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#14324f]/40'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                          {tab.count !== null && tab.count > 0 && (
                            <span className={`px-2 py-0.2 rounded-full text-[11px] font-semibold ${
                              isActive ? 'bg-[#3ec1d3]/20 text-[#3ec1d3]' : 'bg-[#183a5c] text-gray-300'
                            }`}>
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Body */}
                  <div className="p-6">
                    
                    {/* TAB 1: Medical History */}
                    {activeTab === 'medical-history' && (
                      <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                        
                        {/* Allergies Critical Banner */}
                        <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400 shrink-0 border border-rose-800/50">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                Known Allergies & Sensitivities
                              </h4>
                              <p className="text-xs text-rose-200/70 mt-0.5">
                                Critical clinical alerts prior to administering local anesthetics, latex, or antibiotics.
                              </p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {activePatient.medicalHistory?.allergies?.length > 0 ? (
                                  activePatient.medicalHistory.allergies.map((allergy, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-1 rounded-lg bg-rose-900/60 text-rose-200 text-xs font-bold border border-rose-700/60"
                                    >
                                      ⚠️ {allergy}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-emerald-400 font-medium">
                                    No known drug or environmental allergies reported.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenEdit(activePatient)}
                            className="text-xs px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 rounded-lg border border-rose-800/50 font-semibold self-start sm:self-center transition-colors cursor-pointer"
                          >
                            Update Allergies
                          </button>
                        </div>

                        {/* Systemic Conditions & Medications Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Chronic Conditions */}
                          <div className="bg-[#091929] border border-cyan-900/30 rounded-xl p-5">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                              <Shield className="w-4 h-4 text-[#3ec1d3]" />
                              Systemic & Chronic Health Conditions
                            </h4>
                            {activePatient.medicalHistory?.conditions?.length > 0 ? (
                              <ul className="space-y-2">
                                {activePatient.medicalHistory.conditions.map((c, i) => (
                                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-[#0e2439] px-3 py-2 rounded-lg border border-cyan-900/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ec1d3]"></span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No chronic medical conditions recorded.</p>
                            )}
                          </div>

                          {/* Current Medications */}
                          <div className="bg-[#091929] border border-cyan-900/30 rounded-xl p-5">
                            <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                              <Pill className="w-4 h-4 text-emerald-400" />
                              Active Daily Medications
                            </h4>
                            {activePatient.medicalHistory?.currentMedications?.length > 0 ? (
                              <ul className="space-y-2">
                                {activePatient.medicalHistory.currentMedications.map((m, i) => (
                                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-[#0e2439] px-3 py-2 rounded-lg border border-cyan-900/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span>{m}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-500 italic">No regular daily medications taken.</p>
                            )}
                          </div>
                        </div>

                        {/* Clinical Medical Notes */}
                        <div className="bg-[#091929] border border-cyan-900/30 rounded-xl p-5">
                          <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-amber-400" />
                            Attending Doctor's Clinical Medical Notes
                          </h4>
                          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#0e2439] p-3.5 rounded-lg border border-cyan-900/20">
                            {activePatient.medicalHistory?.notes || 'No specific clinical medical history notes added for this patient.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: Prescriptions */}
                    {activeTab === 'prescriptions' && (
                      <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-bold text-white text-base">Prescribed Medications</h3>
                            <p className="text-xs text-gray-400">Oral rinses, analgesics, and antibiotics prescribed for this patient.</p>
                          </div>
                          <button
                            onClick={() => setIsAddPrescriptionOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Prescription</span>
                          </button>
                        </div>

                        {activePatient.prescriptions?.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3.5">
                            {activePatient.prescriptions.map((rx, idx) => (
                              <div
                                key={rx._id || idx}
                                className="bg-[#091929] border border-cyan-900/30 rounded-xl p-4 hover:border-cyan-700/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-[#14324f] text-[#3ec1d3] flex items-center justify-center shrink-0 border border-cyan-800/40">
                                    <Pill className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-white text-sm">{rx.medicineName}</h4>
                                      <span className="px-2 py-0.5 rounded bg-[#14324f] text-[#3ec1d3] font-mono text-xs font-semibold">
                                        {rx.dosage || 'Standard dose'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-xs font-medium">
                                        {rx.duration || '5 days'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-1">
                                      <span className="text-gray-400 font-medium">Frequency:</span> {rx.frequency}
                                    </p>
                                    {rx.instructions && (
                                      <p className="text-xs text-cyan-200/80 mt-1 italic bg-[#0e2439] px-2.5 py-1 rounded border border-cyan-900/20 inline-block">
                                        💡 {rx.instructions}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right text-xs text-gray-400 shrink-0 md:border-l md:border-cyan-900/30 md:pl-4">
                                  <span className="block text-[11px] text-gray-500">Prescribed On</span>
                                  <span className="font-semibold text-gray-300">
                                    {rx.prescribedDate ? new Date(rx.prescribedDate).toLocaleDateString() : 'Recent'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-10 border border-dashed border-cyan-900/40 rounded-xl text-center flex flex-col items-center gap-3">
                            <Pill className="w-8 h-8 text-gray-600" />
                            <p className="text-sm font-semibold text-gray-300">No prescriptions on file</p>
                            <p className="text-xs text-gray-500 max-w-sm">
                              Click the "Add Prescription" button above to record medications, dosage, and instructions.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: X-Ray Reports & Imaging */}
                    {activeTab === 'xrays' && (
                      <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-bold text-white text-base">Dental Radiographs & Diagnostic Imaging</h3>
                            <p className="text-xs text-gray-400">Panoramic OPG, Periapical, Bitewing, and 3D CBCT scans.</p>
                          </div>
                          <button
                            onClick={() => setIsAddXrayOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                          >
                            <UploadCloud className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Upload X-Ray Report</span>
                          </button>
                        </div>

                        {activePatient.xrayImages?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activePatient.xrayImages.map((xray, idx) => (
                              <div
                                key={xray._id || idx}
                                className="bg-[#091929] border border-cyan-900/30 rounded-xl overflow-hidden hover:border-[#3ec1d3]/50 transition-all flex flex-col group"
                              >
                                {/* Image thumbnail container */}
                                <div
                                  onClick={() => setSelectedXrayPreview(xray)}
                                  className="relative h-48 bg-black/60 overflow-hidden cursor-pointer flex items-center justify-center group"
                                >
                                  <img
                                    src={xray.imageUrl}
                                    alt={xray.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#091929] via-transparent to-black/40"></div>
                                  
                                  {/* Modality Tag */}
                                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0e2439]/90 text-[#3ec1d3] border border-cyan-800/50 backdrop-blur-md">
                                    {xray.modality || 'Dental X-Ray'}
                                  </span>

                                  {/* Hover preview button */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ec1d3] text-[#081523] font-bold text-xs shadow-lg">
                                      <Maximize2 className="w-3.5 h-3.5" /> Full Inspection
                                    </span>
                                  </div>
                                </div>

                                {/* X-Ray Info */}
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-white text-sm truncate" title={xray.title}>
                                      {xray.title}
                                    </h4>
                                    <span className="text-[11px] text-gray-400 shrink-0">
                                      {xray.date ? new Date(xray.date).toLocaleDateString() : 'Recent'}
                                    </span>
                                  </div>

                                  {xray.radiologistNotes && (
                                    <p className="text-xs text-gray-300 line-clamp-3 bg-[#0e2439] p-2.5 rounded-lg border border-cyan-900/20">
                                      <span className="text-[#3ec1d3] font-semibold">Report: </span>
                                      {xray.radiologistNotes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-10 border border-dashed border-cyan-900/40 rounded-xl text-center flex flex-col items-center gap-3">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                            <p className="text-sm font-semibold text-gray-300">No radiographic imaging on file</p>
                            <p className="text-xs text-gray-500 max-w-sm">
                              Upload digital OPG panoramic or periapical dental radiographs for this patient using the button above.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 4: Dental Treatment History */}
                    {activeTab === 'treatments' && (
                      <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <h3 className="font-bold text-white text-base">Dental Procedure History</h3>
                            <p className="text-xs text-gray-400">Past operative procedures, endodontics, prosthodontics, and cleanings.</p>
                          </div>
                          <button
                            onClick={() => setIsAddTreatmentOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Record New Treatment</span>
                          </button>
                        </div>

                        {((activePatient.pastTreatments || activePatient.treatmentHistory)?.length > 0) ? (
                          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-900/50">
                            {(activePatient.pastTreatments || activePatient.treatmentHistory).map((t, idx) => (
                              <div key={t._id || idx} className="relative group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#081523] ${
                                  t.status === 'Completed' ? 'bg-emerald-400' : 'bg-amber-400'
                                } shadow-md`}></div>

                                <div className="bg-[#091929] border border-cyan-900/30 rounded-xl p-4.5 hover:border-cyan-700/50 transition-all flex flex-col gap-2.5">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <h4 className="font-bold text-white text-sm">{t.procedure}</h4>
                                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#14324f] text-[#3ec1d3]">
                                        Tooth: {t.toothNumber || 'All'}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        t.status === 'Completed'
                                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                          : 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                                      }`}>
                                        {t.status || 'Completed'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      {t.cost > 0 && (
                                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                                          ${t.cost}
                                        </span>
                                      )}
                                      <span className="font-semibold text-gray-300">
                                        {t.treatmentDate ? new Date(t.treatmentDate).toLocaleDateString() : 'N/A'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-xs text-gray-400 flex items-center gap-2">
                                    <span>Attending: <strong className="text-gray-200">{t.doctorName || 'Dr. Sarah Johnson'}</strong></span>
                                  </div>

                                  {t.notes && (
                                    <p className="text-xs text-gray-300 bg-[#0e2439] p-3 rounded-lg border border-cyan-900/20 leading-relaxed">
                                      {t.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-10 border border-dashed border-cyan-900/40 rounded-xl text-center flex flex-col items-center gap-3">
                            <Clock className="w-8 h-8 text-gray-600" />
                            <p className="text-sm font-semibold text-gray-300">No dental treatment history recorded</p>
                            <p className="text-xs text-gray-500 max-w-sm">
                              Log past dental visits, restorations, extractions, or implants using the button above.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#0e2439] border border-cyan-900/30 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <User className="w-16 h-16 text-gray-600" />
                <h3 className="text-xl font-bold text-white">No Patient Record Selected</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  Choose a patient from the directory on the left or create a brand new digital patient chart.
                </p>
                <button
                  onClick={() => setIsNewPatientModalOpen(true)}
                  className="px-6 py-2.5 bg-[#3ec1d3] text-[#081523] rounded-xl font-bold text-sm hover:bg-[#34adb9] transition-all cursor-pointer shadow-lg shadow-[#3ec1d3]/20"
                >
                  + Add First Patient Record
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Modal: Create New Patient Record */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2439] border border-cyan-900/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#3ec1d3]" />
                <h3 className="text-lg font-bold text-white">Create Digital Patient Record (EMR)</h3>
              </div>
              <button
                onClick={() => setIsNewPatientModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#14324f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={newPatientForm.patientName}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, patientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Custom Patient ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-assigned (e.g. PAT-1050)"
                    value={newPatientForm.patientId}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, patientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="eleanor@example.com"
                    value={newPatientForm.patientEmail}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, patientEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (512) 000-0000"
                    value={newPatientForm.patientPhone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, patientPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatientForm.dateOfBirth}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Blood Group</label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Emergency Contact Info</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (Brother) - 512-555-1234"
                  value={newPatientForm.emergencyContact}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="pt-2 border-t border-cyan-900/30">
                <span className="font-bold text-[#3ec1d3] block mb-2">Medical History & Vitals</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Allergies (comma-separated, e.g. Penicillin, Latex)
                    </label>
                    <input
                      type="text"
                      placeholder="Penicillin, Latex, Local Anesthetic"
                      value={newPatientForm.allergies}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Systemic Conditions (comma-separated, e.g. Hypertension, Diabetes)
                    </label>
                    <input
                      type="text"
                      placeholder="Hypertension, Asthma, Diabetes"
                      value={newPatientForm.conditions}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, conditions: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        value={newPatientForm.bloodPressure}
                        onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodPressure: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Heart Rate</label>
                      <input
                        type="text"
                        value={newPatientForm.heartRate}
                        onChange={(e) => setNewPatientForm({ ...newPatientForm, heartRate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Blood Sugar</label>
                      <input
                        type="text"
                        value={newPatientForm.bloodSugar}
                        onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodSugar: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold cursor-pointer shadow-lg shadow-[#3ec1d3]/20"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Patient Demographics & Medical History */}
      {isEditPatientModalOpen && editPatientForm && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2439] border border-cyan-900/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#3ec1d3]" />
                <h3 className="text-lg font-bold text-white">
                  Edit Patient: {editPatientForm.patientName} ({editPatientForm.patientId})
                </h3>
              </div>
              <button
                onClick={() => setIsEditPatientModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#14324f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={editPatientForm.patientName}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, patientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editPatientForm.emergencyContact}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPatientForm.patientPhone}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, patientPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editPatientForm.patientEmail}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, patientEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editPatientForm.dateOfBirth}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gender</label>
                  <select
                    value={editPatientForm.gender}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Blood Group</label>
                  <select
                    value={editPatientForm.bloodGroup}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-cyan-900/30">
                <span className="font-bold text-[#3ec1d3] block mb-2">Medical History & Allergies</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Allergies (comma-separated)</label>
                    <input
                      type="text"
                      value={editPatientForm.allergies}
                      onChange={(e) => setEditPatientForm({ ...editPatientForm, allergies: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Conditions (comma-separated)</label>
                    <input
                      type="text"
                      value={editPatientForm.conditions}
                      onChange={(e) => setEditPatientForm({ ...editPatientForm, conditions: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        value={editPatientForm.bloodPressure}
                        onChange={(e) => setEditPatientForm({ ...editPatientForm, bloodPressure: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Heart Rate</label>
                      <input
                        type="text"
                        value={editPatientForm.heartRate}
                        onChange={(e) => setEditPatientForm({ ...editPatientForm, heartRate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Blood Sugar</label>
                      <input
                        type="text"
                        value={editPatientForm.bloodSugar}
                        onChange={(e) => setEditPatientForm({ ...editPatientForm, bloodSugar: e.target.value })}
                        className="w-full px-3 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Clinical Notes</label>
                    <textarea
                      rows={3}
                      value={editPatientForm.medicalNotes}
                      onChange={(e) => setEditPatientForm({ ...editPatientForm, medicalNotes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsEditPatientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold cursor-pointer shadow-lg shadow-[#3ec1d3]/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Prescription */}
      {isAddPrescriptionOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e2439] border border-cyan-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <Pill className="w-5 h-5 text-[#3ec1d3]" />
                <h3 className="text-lg font-bold text-white">Add Prescription for {activePatient?.patientName}</h3>
              </div>
              <button
                onClick={() => setIsAddPrescriptionOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#14324f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPrescription} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg, Ketorolac, Chlorhexidine"
                  value={prescriptionForm.medicineName}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicineName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 days, 7 days"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. Twice daily after meals, every 8 hours"
                  value={prescriptionForm.frequency}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Special Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Take with full glass of water. Complete total course."
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddPrescriptionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold cursor-pointer shadow-md"
                >
                  Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Upload / Add X-Ray Report */}
      {isAddXrayOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2439] border border-cyan-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-[#3ec1d3]" />
                <h3 className="text-lg font-bold text-white">Upload Radiograph & Report</h3>
              </div>
              <button
                onClick={() => setIsAddXrayOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#14324f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddXray} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">X-Ray Title / Region *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panoramic OPG, Lower Right Molar #30"
                  value={xrayForm.title}
                  onChange={(e) => setXrayForm({ ...xrayForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Imaging Modality</label>
                <select
                  value={xrayForm.modality}
                  onChange={(e) => setXrayForm({ ...xrayForm, modality: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                >
                  <option value="OPG Panoramic">OPG Panoramic</option>
                  <option value="Periapical">Periapical (IOPA)</option>
                  <option value="Bitewing">Bitewing</option>
                  <option value="CBCT 3D">CBCT 3D Scan</option>
                  <option value="Cephalometric">Cephalometric</option>
                  <option value="Dental Photo">Clinical Dental Photo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Upload or URL option */}
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold">Upload Image File OR Enter Direct Image URL *</label>
                
                <div className="border-2 border-dashed border-cyan-900/50 hover:border-[#3ec1d3]/60 rounded-xl p-4 text-center cursor-pointer bg-[#091929] transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <ImageIcon className="w-8 h-8 text-[#3ec1d3]" />
                    <span className="text-xs text-gray-300 font-semibold">
                      {xrayFilePreview ? 'File Selected (Click to change)' : 'Click or Drag & Drop radiograph image here'}
                    </span>
                    <span className="text-[11px] text-gray-500">PNG, JPG, DICOM preview supported up to 15MB</span>
                  </div>
                </div>

                {xrayFilePreview && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-cyan-800/40 bg-black">
                    <img src={xrayFilePreview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setXrayFilePreview('');
                        setXrayForm((prev) => ({ ...prev, imageUrl: '' }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/80 rounded-full text-rose-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 my-2 text-[11px] text-gray-500">
                  <span className="flex-1 h-px bg-cyan-900/30"></span>
                  <span>OR VIA DIRECT URL</span>
                  <span className="flex-1 h-px bg-cyan-900/30"></span>
                </div>

                <input
                  type="url"
                  placeholder="https://images.example.com/xray-scan.jpg"
                  value={xrayForm.imageUrl}
                  onChange={(e) => setXrayForm({ ...xrayForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Radiologist Diagnostic Notes</label>
                <textarea
                  rows={3}
                  placeholder="Radiographic findings: Periapical radiolucency, bone resorption, or impaction details..."
                  value={xrayForm.radiologistNotes}
                  onChange={(e) => setXrayForm({ ...xrayForm, radiologistNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddXrayOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold cursor-pointer shadow-md"
                >
                  Save Radiograph
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Add Past Dental Treatment */}
      {isAddTreatmentOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e2439] border border-cyan-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-[#3ec1d3]" />
                <h3 className="text-lg font-bold text-white">Record Treatment for {activePatient?.patientName}</h3>
              </div>
              <button
                onClick={() => setIsAddTreatmentOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#14324f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTreatment} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Procedure Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Endodontic Root Canal, Porcelain Veneer, Implant"
                  value={treatmentForm.procedure}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, procedure: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tooth / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. #19 Lower Molar, Full Arch"
                    value={treatmentForm.toothNumber}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, toothNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Status</label>
                  <select
                    value={treatmentForm.status}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Date of Procedure</label>
                  <input
                    type="date"
                    value={treatmentForm.treatmentDate}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, treatmentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Cost / Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 450"
                    value={treatmentForm.cost}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Treating Dentist</label>
                <input
                  type="text"
                  value={treatmentForm.doctorName}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, doctorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Clinical Procedure Notes</label>
                <textarea
                  rows={3}
                  placeholder="Details of materials used, shades, canal instrumentation, or post-op instructions..."
                  value={treatmentForm.notes}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#091929] border border-cyan-900/40 rounded-xl text-white focus:outline-none focus:border-[#3ec1d3]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddTreatmentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#3ec1d3] hover:bg-[#34adb9] text-[#081523] font-bold cursor-pointer shadow-md"
                >
                  Log Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Lightbox: High-Resolution X-Ray Viewer Modal */}
      {selectedXrayPreview && (
        <div className="fixed inset-0 z-[1600] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1c2e] border border-cyan-800/60 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#3ec1d3]" />
                  {selectedXrayPreview.title}
                </h3>
                <span className="text-xs text-gray-400">
                  Modality: <strong className="text-[#3ec1d3]">{selectedXrayPreview.modality}</strong> • Date: {selectedXrayPreview.date ? new Date(selectedXrayPreview.date).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <button
                onClick={() => setSelectedXrayPreview(null)}
                className="p-2 rounded-full bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High Res Image */}
            <div className="h-[480px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-cyan-900/30">
              <img
                src={selectedXrayPreview.imageUrl}
                alt={selectedXrayPreview.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Diagnostic Report Notes */}
            {selectedXrayPreview.radiologistNotes && (
              <div className="bg-[#091929] border border-cyan-900/30 rounded-xl p-3.5 text-xs text-gray-200">
                <span className="text-[#3ec1d3] font-bold block mb-1">Radiologist Interpretation:</span>
                <p className="leading-relaxed text-gray-300">{selectedXrayPreview.radiologistNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Modal: Confirm Delete Patient */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1700] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e2439] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-800/50">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Patient Record?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to permanently delete this patient record and all related medical history, prescriptions, and radiographs? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#14324f] hover:bg-[#1a3e63] text-gray-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientRecords;
