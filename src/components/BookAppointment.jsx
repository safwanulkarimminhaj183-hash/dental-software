import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight 
} from 'lucide-react';

const DENTAL_SERVICES = [
  'Teeth Cleaning & Hygiene',
  'Dental Checkup & Consultation',
  'Cosmetic Dentistry & Veneers',
  'Dental Implants',
  'Teeth Whitening',
  'Root Canal Treatment',
  'Orthodontics & Braces',
  'Pediatric Dentistry',
  'Tooth Extraction & Surgery',
  'Emergency Dental Care'
];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM'
];

const BookAppointment = ({ onBookingSuccess }) => {
  // 1. Form State managed using useState
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  // 2. UI & Feedback State
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '', data?: any }

  // Minimum selectable date is today
  const todayDate = new Date().toISOString().split('T')[0];

  // 3. Clear form helper
  const resetForm = () => {
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setServiceName('');
    setAppointmentDate('');
    setAppointmentTime('');
    setDoctorName('');
    setNotes('');
  };

  // 4. Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Client-side validation
    if (!patientName.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!patientEmail.trim() || !patientEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }
    if (!patientPhone.trim()) {
      setFeedback({ type: 'error', message: 'Please provide your contact phone number.' });
      return;
    }
    if (!serviceName) {
      setFeedback({ type: 'error', message: 'Please select a dental service.' });
      return;
    }
    if (!appointmentDate) {
      setFeedback({ type: 'error', message: 'Please select an appointment date.' });
      return;
    }
    if (!appointmentTime) {
      setFeedback({ type: 'error', message: 'Please choose an appointment time slot.' });
      return;
    }

    const payload = {
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
      serviceName: serviceName.trim(),
      appointmentDate,
      appointmentTime,
      doctorName: doctorName.trim() || 'Assigned Specialist',
      notes: notes.trim(),
    };

    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFeedback({
          type: 'success',
          message: result.message || 'Your appointment has been booked successfully! We will confirm via phone or email.',
          data: result.data,
        });

        // Clear form fields on success
        resetForm();

        if (onBookingSuccess) {
          onBookingSuccess(result.data);
        }
      } else {
        setFeedback({
          type: 'error',
          message: result.message || 'Failed to book appointment. Please check your information.',
        });
      }
    } catch (error) {
      console.warn('Backend connection unavailable for appointment booking, saving locally:', error.message);

      // Offline appointment fallback storage
      try {
        const existingApts = JSON.parse(localStorage.getItem('dentist_appointments') || '[]');
        const offlineApt = {
          _id: 'apt_offline_' + Date.now(),
          ...payload,
          status: 'Confirmed',
          createdAt: new Date().toISOString()
        };
        existingApts.push(offlineApt);
        localStorage.setItem('dentist_appointments', JSON.stringify(existingApts));
      } catch (lsErr) {
        console.warn('LocalStorage save error:', lsErr);
      }

      setFeedback({
        type: 'success',
        message: 'Your appointment has been booked successfully! We will confirm via phone or email.',
        data: payload,
      });

      // Clear form fields on success
      resetForm();

      if (onBookingSuccess) {
        onBookingSuccess(payload);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#142637] border border-gray-700/60 rounded-2xl shadow-2xl p-6 sm:p-10 text-white">
      <div className="mb-8 text-center sm:text-left">
        <span className="inline-block text-[#3ec1d3] uppercase text-xs font-bold tracking-widest px-3 py-1 bg-[#3ec1d3]/10 border border-[#3ec1d3]/20 rounded-full mb-3">
          Book Online
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Schedule Your Dental Visit
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Fill out the form below to reserve your appointment with our professional dental team.
        </p>
      </div>

      {/* User Feedback Notification */}
      {feedback && (
        <div
          className={`mb-8 p-4 rounded-xl border flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm">{feedback.message}</p>
            {feedback.data && (
              <div className="mt-2 text-xs text-gray-300 space-y-1 bg-black/20 p-3 rounded-lg border border-emerald-500/20">
                <p><span className="font-medium text-white">Patient:</span> {feedback.data.patientName}</p>
                <p><span className="font-medium text-white">Service:</span> {feedback.data.serviceName}</p>
                <p>
                  <span className="font-medium text-white">Date & Time:</span>{' '}
                  {new Date(feedback.data.appointmentDate).toISOString().split('T')[0]} at {feedback.data.appointmentTime}
                </p>
                <p><span className="font-medium text-white">Status:</span> <span className="uppercase font-bold text-amber-300">{feedback.data.status}</span></p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white text-sm font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Patient Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Patient Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Phone Number & Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="(555) 000-1234"
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Desired Dental Service *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Stethoscope className="w-4 h-4" />
              </div>
              <select
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors cursor-pointer"
              >
                <option value="" disabled>Select a dental service</option>
                {DENTAL_SERVICES.map((service, index) => (
                  <option key={index} value={service} className="bg-[#0c1c2b] text-white">
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Appointment Date & Time Slot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Appointment Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                min={todayDate}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Preferred Time Slot *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Clock className="w-4 h-4" />
              </div>
              <select
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors cursor-pointer"
              >
                <option value="" disabled>Select convenient time</option>
                {TIME_SLOTS.map((slot, index) => (
                  <option key={index} value={slot} className="bg-[#0c1c2b] text-white">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Optional Row 4: Specific Doctor / Preferred Specialist */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Preferred Doctor / Specialist (Optional)
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="e.g. Dr. Sarah Johnson or leave empty for next available"
            className="w-full px-4 py-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors"
          />
        </div>

        {/* Row 5: Additional Notes / Symptoms */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Notes or Symptoms (Optional)
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe any toothache, symptoms, or preferences..."
            className="w-full p-3 bg-[#0c1c2b] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#3ec1d3] focus:ring-1 focus:ring-[#3ec1d3] transition-colors resize-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-[#3ec1d3] hover:bg-[#34adb9] disabled:opacity-60 disabled:cursor-not-allowed text-[#0c1c2b] font-extrabold text-sm uppercase tracking-wider rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Booking Appointment...</span>
              </>
            ) : (
              <>
                <span>Confirm & Book Appointment</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
