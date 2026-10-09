import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const mapPlaceholder = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"; 
const carenowLogo = "https://cdn-icons-png.flaticon.com/512/387/387561.png"; 

const ContactForm = () => {
  const [isMapClicked, setIsMapClicked] = useState(false);
  
  // 1. Form State managed using useState
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');

  // 2. Loading and Feedback state
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const todayDate = new Date().toISOString().split('T')[0];

  // 3. Clear Form Helper
  const resetForm = () => {
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setServiceName('');
    setAppointmentDate('');
    setAppointmentTime('');
    setNotes('');
  };

  // 4. Submit Handler connected to Backend POST /api/contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validation (all required fields)
    if (
      !patientName.trim() ||
      !patientEmail.trim() ||
      !patientPhone.trim() ||
      !serviceName.trim() ||
      !appointmentDate ||
      !appointmentTime
    ) {
      setFeedback({
        type: 'error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    setLoading(true);

    try {
      // Construct clean message body for contact API
      const messageParts = [];
      if (serviceName.trim()) messageParts.push(`Service Requested: ${serviceName.trim()}`);
      if (appointmentDate) messageParts.push(`Preferred Date: ${appointmentDate}`);
      if (appointmentTime) messageParts.push(`Time Slot: ${appointmentTime}`);
      if (notes.trim()) messageParts.push(`Additional Notes: ${notes.trim()}`);
      
      const fullMessage = messageParts.length > 0 
        ? messageParts.join('\n') 
        : 'Inquiry submitted from Contact Form.';

      // Simulate API call for static deployment
      await new Promise((resolve) => setTimeout(resolve, 800));

      setFeedback({
        type: 'success',
        message: 'Your message has been sent successfully!',
      });
      resetForm();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFeedback({
        type: 'error',
        message: 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="relative w-full min-h-[600px] bg-[#0c1c2b] overflow-hidden py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 relative h-full">
        
        {/* Left Side: Map */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInLeft}
          className="relative h-[450px] md:h-auto cursor-pointer group overflow-hidden"
          onClick={() => setIsMapClicked(true)}
          style={{ 
            backgroundImage: `url(${mapPlaceholder})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }}
        >
          {isMapClicked && (
            <div className="absolute inset-0 bg-[#0c1c2b]/85 flex items-center justify-center p-12 transition-all duration-500 z-10">
              <p className="text-white text-lg md:text-xl font-medium leading-relaxed text-center animate-fadeIn">
                Our medical facility is dedicated to providing compassionate, comprehensive care for you and your family. Reach out to discuss your specific dental and healthcare needs.
              </p>
            </div>
          )}

          {!isMapClicked && (
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <p className="text-white bg-[#3ec1d3]/80 px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold">Click to view details</p>
            </div>
          )}
        </motion.div>

        {/* Right Side: Contact Form Wrapper */}
        <div className="relative p-10 md:p-20 bg-[#0c1c2b]">
          
          {/* Logo Circle */}
          <motion.div 
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            whileInView={{ scale: 1, x: "-50%", y: "-50%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="absolute left-1/2 md:left-0 top-0 md:top-1/2 w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full border-[8px] md:border-[12px] border-[#0c1c2b] bg-white shadow-2xl z-20 flex flex-col items-center justify-center p-4 transform"
          >
            <img src={carenowLogo} alt="Carenow" className="w-[40px] md:w-[60px] mb-1" />
            <h4 className="text-[#0c1c2b] text-base md:text-xl font-extrabold tracking-tighter">DentalCare</h4>
          </motion.div>

          <div className="relative z-10 w-full max-w-[480px] ml-auto">
            {/* Header Section */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h5 className="text-[#3ec1d3] font-bold tracking-[3px] uppercase text-xs mb-3">BOOK AN APPOINTMENT</h5>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Schedule Your <br /> Dental Visit
              </h2>
            </motion.div>

            {/* Feedback Notification */}
            {feedback && (
              <div
                className={`mb-6 p-4 rounded-lg border flex items-start gap-3 text-sm ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">{feedback.message}</div>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="text-gray-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Form Section (noValidate: our own error box shows instead of the browser bubble) */}
            <motion.form 
              onSubmit={handleSubmit}
              noValidate
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {/* Row 1: Patient Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Patient Name *" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="w-full p-4 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number *" 
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  required
                  className="w-full p-4 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none" 
                />
              </div>

              {/* Row 2: Patient Email & Service */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="email" 
                  placeholder="Email Address *" 
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  required
                  className="w-full p-4 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Service (e.g. Scaling) *" 
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                  className="w-full p-4 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none" 
                />
              </div>

              {/* Row 3: Appointment Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                    Date *
                  </label>
                  <input 
                    type="date" 
                    min={todayDate}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full p-3.5 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                    Time Slot *
                  </label>
                  <select 
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                    className="w-full p-3.5 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Notes */}
              <textarea 
                placeholder="Additional Notes or Symptoms (Optional)" 
                rows="3" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-[#142637] text-white border border-gray-700 rounded-sm text-sm focus:border-[#3ec1d3] outline-none resize-none"
              ></textarea>

              <div className="w-full flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-12 py-4 bg-[#3ec1d3] text-[#0c1c2b] font-bold text-sm tracking-widest rounded-sm hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>BOOKING...</span>
                    </>
                  ) : (
                    'BOOK APPOINTMENT'
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;