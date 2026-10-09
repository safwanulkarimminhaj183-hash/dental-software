import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Ticket,
  Shield,
  HeartHandshake,
  CalendarCheck,
  FileText,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// ─── FAQ accordion item ──────────────────────────────────────────────────────
const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-[#f0f9fa] transition-colors text-left group"
    >
      <span className="font-semibold text-[#0e2a47] text-sm md:text-base pr-4 group-hover:text-[#3ec1d3] transition-colors">
        {question}
      </span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-[#3ec1d3] shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
      )}
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <div className="px-6 py-4 bg-[#f8fdfe] border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="text-2xl font-extrabold text-[#0e2a47]">{value}</div>
    <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
  </div>
);

// ─── Category option ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'billing', label: 'Billing & Payment' },
  { value: 'medical_records', label: 'Medical Records' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
const PatientHelp = () => {
  // FAQ state
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [faqLoading, setFaqLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, message, ticketNumber, autoReply }

  // Fetch FAQ from backend
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/support/faq`);
        const data = await res.json();
        if (data.success) setFaqs(data.data);
      } catch {
        // fallback — keep empty, FAQ section stays hidden gracefully
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.senderName.trim() || !form.senderEmail.trim() || !form.message.trim()) {
      setFeedback({ type: 'error', message: 'Name, email, and message are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/support/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message,
          ticketNumber: data.ticketNumber,
          autoReply: data.autoReply,
        });
        setForm({
          senderName: '',
          senderEmail: '',
          senderPhone: '',
          subject: '',
          category: 'general',
          message: '',
        });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Submission failed. Please try again.' });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Cannot reach the server. Please check your connection or try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  return (
    <div className="min-h-screen bg-[#f7fbfc]">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0e2a47] overflow-hidden pt-20 pb-24 px-6">
        {/* decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full bg-[#3ec1d3]/10 pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[240px] h-[240px] rounded-full bg-[#3ec1d3]/8 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#3ec1d3]/15 border border-[#3ec1d3]/30 rounded-full px-4 py-2 mb-6"
          >
            <HeartHandshake className="w-4 h-4 text-[#3ec1d3]" />
            <span className="text-[#3ec1d3] text-xs font-bold tracking-widest uppercase">
              About Us — Patient Help Center
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5"
          >
            We're Here to <span className="text-[#3ec1d3]">Help You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Have a question, concern, or need help? Browse our frequently asked
            questions or send us a message — our support team responds within 24
            hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#contact-form"
              className="bg-[#3ec1d3] hover:bg-[#34adb9] text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg text-sm"
            >
              Send a Message
            </a>
            <a
              href="#faq"
              className="border border-[#3ec1d3]/50 hover:border-[#3ec1d3] text-[#3ec1d3] font-bold px-8 py-3 rounded-lg transition-all text-sm"
            >
              Browse FAQs
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Stats ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-10 mb-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Clock, value: '< 24h', label: 'Avg. Response Time', color: 'bg-[#3ec1d3]' },
            { icon: Ticket, value: '24/7', label: 'Emergency Helpline', color: 'bg-[#0e2a47]' },
            { icon: Shield, value: '100%', label: 'Secure & Private', color: 'bg-emerald-500' },
            { icon: HeartHandshake, value: '5,000+', label: 'Patients Helped', color: 'bg-violet-500' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ── LEFT: FAQ + Quick Contact ──────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-10">

          {/* FAQ Section */}
          <motion.section
            id="faq"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="text-[#3ec1d3] text-xs font-bold tracking-widest uppercase">
                Quick Answers
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e2a47] mt-1">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Most patient queries are answered instantly below.
              </p>
            </motion.div>

            {faqLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#3ec1d3] animate-spin" />
              </div>
            ) : faqs.length > 0 ? (
              <motion.div variants={stagger}>
                {faqs.map((faq, idx) => (
                  <motion.div key={idx} variants={fadeUp}>
                    <FAQItem
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFaq === idx}
                      onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-gray-400 text-sm py-6 text-center">
                FAQs could not be loaded. Please contact us directly.
              </p>
            )}
          </motion.section>

          {/* Clinic Info Cards */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="text-[#3ec1d3] text-xs font-bold tracking-widest uppercase">
                Contact Info
              </span>
              <h2 className="text-2xl font-extrabold text-[#0e2a47] mt-1">
                Reach Us Directly
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Phone,
                  title: 'Phone & Emergency',
                  lines: ['+880-1800-DENTAL', 'Emergency: 24/7 Hotline'],
                  color: 'text-[#3ec1d3]',
                  bg: 'bg-[#3ec1d3]/10',
                },
                {
                  icon: Mail,
                  title: 'Email Support',
                  lines: ['support@dentocare.com', 'admin@dentocare.com'],
                  color: 'text-violet-500',
                  bg: 'bg-violet-50',
                },
                {
                  icon: MapPin,
                  title: 'Clinic Location',
                  lines: ['House 12, Road 5, Dhanmondi', 'Dhaka 1205, Bangladesh'],
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50',
                },
                {
                  icon: Clock,
                  title: 'Clinic Hours',
                  lines: ['Sat–Thu: 9:00 AM – 8:00 PM', 'Fri: 2:00 PM – 8:00 PM'],
                  color: 'text-amber-500',
                  bg: 'bg-amber-50',
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-[#0e2a47] text-sm mb-1">{card.title}</p>
                    {card.lines.map((l, j) => (
                      <p key={j} className="text-gray-500 text-xs leading-relaxed">{l}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Quick Links */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="text-[#3ec1d3] text-xs font-bold tracking-widest uppercase">
                Patient Services
              </span>
              <h2 className="text-2xl font-extrabold text-[#0e2a47] mt-1">
                Quick Access
              </h2>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: CalendarCheck, label: 'Book Appointment', to: '/book', color: 'bg-[#3ec1d3]' },
                { icon: FileText, label: 'My Health Records', to: '/patient-records', color: 'bg-[#0e2a47]' },
                { icon: Zap, label: 'Treatment Plans', to: '/treatment-plans', color: 'bg-violet-500' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:shadow-md hover:border-[#3ec1d3]/40 transition-all group"
                  >
                    <div className={`w-9 h-9 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#0e2a47] group-hover:text-[#3ec1d3] transition-colors">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </div>

        {/* ── RIGHT: Support Ticket Form ─────────────────────────────────── */}
        <motion.section
          id="contact-form"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-2"
        >
          <div className="bg-[#0e2a47] rounded-3xl p-8 shadow-2xl sticky top-24">
            {/* Form header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#3ec1d3] rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg leading-tight">
                  Send Us a Message
                </h3>
                <p className="text-gray-400 text-xs">We reply within 24 hours</p>
              </div>
            </div>

            {/* Feedback banner */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-5 rounded-xl p-4 border text-sm ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{feedback.message}</p>
                      {feedback.ticketNumber && (
                        <p className="mt-1 text-xs opacity-80">
                          Ticket: <span className="font-bold">{feedback.ticketNumber}</span>
                        </p>
                      )}
                      {feedback.autoReply && (
                        <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/10">
                          <p className="text-[11px] font-bold uppercase tracking-wider mb-1 text-[#3ec1d3]">
                            ⚡ Instant Answer
                          </p>
                          <p className="text-xs text-gray-200 leading-relaxed">{feedback.autoReply}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setFeedback(null)}
                      className="text-gray-400 hover:text-white text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={form.senderName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={form.senderEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={form.senderPhone}
                  onChange={handleChange}
                  placeholder="+880 ..."
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none transition-colors cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Question about my bill"
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Your Message *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your question or concern in detail..."
                  rows={4}
                  required
                  className="w-full bg-[#142637] border border-gray-700 text-white text-sm rounded-lg px-4 py-3 focus:border-[#3ec1d3] focus:outline-none placeholder-gray-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#3ec1d3] hover:bg-[#34adb9] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-500 leading-relaxed">
                <HelpCircle className="w-3 h-3 inline mr-1" />
                FAQ questions get an instant automated reply. Other queries are
                handled by our team within 24 hours.
              </p>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default PatientHelp;
