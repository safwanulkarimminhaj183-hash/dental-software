// backend/services/faqService.js
// FAQ knowledge base + keyword-matching engine for the "Patient Help" auto-reply.
//
// How it works:
//   1. Each FAQ entry has a list of trigger keywords / phrases.
//   2. getAutoReply(messageText) lowercases the incoming message and checks
//      every entry's keywords in order of priority.
//   3. The first match wins and returns { answer, matchedKeyword, category }.
//   4. If no match is found, returns null — the ticket stays open for a human.
//
// To extend: add new entries to FAQ_ENTRIES below.
// For production, consider replacing this with a vector-similarity search
// (OpenAI embeddings, pgvector, etc.) for semantic matching.

// ── FAQ knowledge base ────────────────────────────────────────────────────────
const FAQ_ENTRIES = [
  // ── Clinic hours ────────────────────────────────────────────────────────────
  {
    id: 'clinic-hours',
    category: 'general',
    priority: 1,
    keywords: [
      'opening hours', 'opening time', 'clinic hours', 'clinic time',
      'what time', 'when open', 'when are you open', 'business hours',
      'schedule', 'working hours', 'office hours',
    ],
    answer:
      'Our clinic is open **Saturday – Thursday, 9:00 AM – 8:00 PM** and **Friday 2:00 PM – 8:00 PM**. ' +
      'We are closed on public holidays. For same-day emergencies, please call us at **+880 1700-000000**.',
  },

  // ── Appointment booking ──────────────────────────────────────────────────────
  {
    id: 'book-appointment',
    category: 'appointment',
    priority: 2,
    keywords: [
      'book appointment', 'schedule appointment', 'make appointment',
      'how to book', 'how to schedule', 'want to book', 'new appointment',
      'reserve slot', 'book a slot', 'appointment booking',
    ],
    answer:
      'You can book an appointment directly on our website — click **"Book Appointment"** in the navigation menu. ' +
      'Choose your preferred doctor, select an available date and time, and confirm. ' +
      'You\'ll receive an email confirmation and reminders 24 hours and 2 hours before your visit.',
  },

  // ── Cancellation / rescheduling ──────────────────────────────────────────────
  {
    id: 'cancel-reschedule',
    category: 'appointment',
    priority: 3,
    keywords: [
      'cancel appointment', 'reschedule', 'change appointment', 'postpone',
      'move appointment', 'cancel my booking', 'change my booking',
    ],
    answer:
      'To cancel or reschedule, please log in to your patient portal and go to **My Appointments**, ' +
      'then click **Cancel** or **Reschedule**. We kindly ask for at least **24 hours notice**. ' +
      'For urgent changes, call us at **+880 1700-000000**.',
  },

  // ── Fees and pricing ─────────────────────────────────────────────────────────
  {
    id: 'fees',
    category: 'billing',
    priority: 4,
    keywords: [
      'fee', 'fees', 'cost', 'price', 'pricing', 'charges', 'how much',
      'consultation fee', 'treatment cost', 'affordable', 'rate',
    ],
    answer:
      'Our fees vary by treatment. As a general guide:\n' +
      '• **Consultation:** ৳500 – ৳800\n' +
      '• **Scaling & Polishing:** ৳1,000 – ৳2,500\n' +
      '• **Tooth Extraction:** ৳500 – ৳3,000\n' +
      '• **Root Canal Treatment:** ৳5,000 – ৳15,000\n' +
      '• **Teeth Whitening:** ৳8,000 – ৳20,000\n\n' +
      'Exact costs depend on the complexity of your case. A personalised quote will be provided after your initial consultation.',
  },

  // ── Payment methods ──────────────────────────────────────────────────────────
  {
    id: 'payment-methods',
    category: 'billing',
    priority: 5,
    keywords: [
      'payment', 'pay', 'bkash', 'nagad', 'card', 'credit card', 'debit card',
      'mobile banking', 'cash', 'how to pay', 'payment method', 'online payment',
    ],
    answer:
      'We accept the following payment methods:\n' +
      '• **bKash** and **Nagad** (mobile banking)\n' +
      '• **Credit / Debit Cards** (Visa, Mastercard)\n' +
      '• **Cash** at the clinic\n\n' +
      'Online payments can be made securely through our patient portal when settling your invoice.',
  },

  // ── Insurance ────────────────────────────────────────────────────────────────
  {
    id: 'insurance',
    category: 'billing',
    priority: 6,
    keywords: [
      'insurance', 'health insurance', 'coverage', 'insurance cover',
      'dental insurance', 'claim', 'reimbursement',
    ],
    answer:
      'We work with several major health insurance providers. Please bring your insurance card ' +
      'to your appointment and our billing team will verify your coverage. ' +
      'For a list of accepted providers, call us at **+880 1700-000000** or email **help@smiledental.com**.',
  },

  // ── Emergency dental care ────────────────────────────────────────────────────
  {
    id: 'emergency',
    category: 'general',
    priority: 7,
    keywords: [
      'emergency', 'urgent', 'severe pain', 'toothache', 'broken tooth',
      'knocked out', 'abscess', 'bleeding', 'swollen', 'dental emergency',
      'same day', 'urgent care',
    ],
    answer:
      '⚠️ **For dental emergencies**, please call us immediately at **+880 1700-000000**. ' +
      'We reserve same-day emergency slots every day. ' +
      'If you are experiencing severe pain, swelling, or uncontrolled bleeding, ' +
      'please go to the nearest emergency room or call 999 for immediate help.',
  },

  // ── Doctor / specialist information ─────────────────────────────────────────
  {
    id: 'doctors',
    category: 'general',
    priority: 8,
    keywords: [
      'doctor', 'dentist', 'specialist', 'orthodontist', 'surgeon',
      'who are your doctors', 'meet the team', 'dentist name', 'which doctor',
    ],
    answer:
      'Our team includes experienced specialists in general dentistry, orthodontics, oral surgery, ' +
      'and cosmetic dentistry. You can view detailed profiles, qualifications, and availability ' +
      'of each dentist on our **"Our Doctors"** page. We\'ll match you with the right specialist ' +
      'based on your treatment needs.',
  },

  // ── Location / directions ────────────────────────────────────────────────────
  {
    id: 'location',
    category: 'general',
    priority: 9,
    keywords: [
      'location', 'address', 'where are you', 'how to get there', 'direction',
      'find you', 'map', 'clinic address', 'situated', 'situated at',
    ],
    answer:
      'We are located at **123 Healthcare Boulevard, Suite 400, Dhaka, Bangladesh**. ' +
      'Parking is available on-site. We are accessible by bus routes 10, 22, and 45. ' +
      'Find us on Google Maps: [Smile Care Dental Clinic](https://maps.google.com).',
  },

  // ── Medical records / EHR ────────────────────────────────────────────────────
  {
    id: 'medical-records',
    category: 'medical',
    priority: 10,
    keywords: [
      'medical record', 'health record', 'dental record', 'my records',
      'x-ray', 'xray', 'prescription', 'treatment history', 'access record',
      'view my record', 'patient record',
    ],
    answer:
      'You can access your complete dental records, X-rays, prescriptions, and treatment history ' +
      'by logging in to your **Patient Portal** and navigating to **My Health Records**. ' +
      'All records are encrypted and stored securely. If you need a printed copy, please ' +
      'request it at the front desk or email **help@smiledental.com**.',
  },

  // ── Contact ──────────────────────────────────────────────────────────────────
  {
    id: 'contact',
    category: 'general',
    priority: 11,
    keywords: [
      'contact', 'phone number', 'telephone', 'email', 'reach you',
      'get in touch', 'call you', 'contact number', 'helpline',
    ],
    answer:
      'You can reach us through any of these channels:\n' +
      '📞 **Phone:** +880 1700-000000\n' +
      '📧 **Email:** help@smiledental.com\n' +
      '🌐 **Website:** www.smiledental.com\n' +
      '📍 **Address:** 123 Healthcare Boulevard, Dhaka, Bangladesh\n\n' +
      'Our support team is available **Saturday – Thursday, 9 AM – 8 PM**.',
  },

  // ── New patient / first visit ────────────────────────────────────────────────
  {
    id: 'new-patient',
    category: 'general',
    priority: 12,
    keywords: [
      'new patient', 'first visit', 'first time', 'what to bring',
      'registration', 'sign up', 'enrol', 'first appointment',
    ],
    answer:
      'Welcome! For your first visit, please:\n' +
      '1. Register online via the **"Sign Up"** button and book your appointment.\n' +
      '2. Arrive 10–15 minutes early to complete a short health questionnaire.\n' +
      '3. Bring a valid **photo ID** and your **insurance card** (if applicable).\n' +
      '4. If you have previous dental records from another clinic, bringing them is helpful but not required.',
  },
];

// ── Matching engine ───────────────────────────────────────────────────────────

/**
 * Normalize text for comparison: lowercase, remove extra whitespace and
 * common punctuation.
 */
const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * getAutoReply(messageText)
 *
 * Scans the incoming message for FAQ keyword matches.
 * Returns the first matching entry (sorted by priority) or null.
 *
 * @param {string} messageText  Raw message from the patient/guest
 * @returns {{ answer: string, matchedKeyword: string, category: string } | null}
 */
export const getAutoReply = (messageText) => {
  if (!messageText || typeof messageText !== 'string') return null;

  const normalized = normalize(messageText);

  // Sort entries by priority ascending (lower = higher priority)
  const sorted = [...FAQ_ENTRIES].sort((a, b) => a.priority - b.priority);

  for (const entry of sorted) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(normalize(keyword))) {
        return {
          answer: entry.answer,
          matchedKeyword: keyword,
          category: entry.category,
          faqId: entry.id,
        };
      }
    }
  }

  return null; // no match — route to human agent
};

/**
 * getAllFAQs()
 * Returns the full FAQ list (for an FAQ page or admin knowledge base view).
 */
export const getAllFAQs = () =>
  FAQ_ENTRIES.map(({ id, category, priority, keywords, answer }) => ({
    id,
    category,
    priority,
    triggerKeywords: keywords,
    answer,
  }));
