import mongoose from 'mongoose';
import SupportTicket from '../models/SupportTicket.js';

// Helper: check DB is actually connected before any query
const checkDB = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is not connected. Please ensure MongoDB is running and try again.',
    });
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Knowledge Base — auto-reply matching
// ─────────────────────────────────────────────────────────────────────────────
const FAQ_ANSWERS = [
  {
    keywords: ['hour', 'open', 'close', 'timing', 'schedule', 'time', 'when'],
    answer:
      'Our clinic is open Saturday–Thursday: 9:00 AM – 8:00 PM, and Friday: 2:00 PM – 8:00 PM. For emergencies outside these hours, please call our 24-hour helpline at +880-1800-DENTAL.',
  },
  {
    keywords: ['fee', 'cost', 'price', 'charge', 'payment', 'how much', 'rate'],
    answer:
      'Our fees vary by treatment: Consultation BDT 500, Scaling & Cleaning BDT 1,500, Tooth Filling BDT 2,000–4,000, Root Canal BDT 6,000–12,000, Implant BDT 20,000–35,000. We accept bKash, Nagad, card, and cash.',
  },
  {
    keywords: ['appointment', 'book', 'reserve', 'slot', 'available'],
    answer:
      'You can book an appointment online via our website (click "Get Appointment"), or call us at +880-1800-DENTAL. Same-day slots are often available for urgent cases.',
  },
  {
    keywords: ['insurance', 'coverage', 'claim'],
    answer:
      'We accept most major health insurance plans. Please bring your insurance card on your visit. Our billing team will process claims directly with your provider.',
  },
  {
    keywords: ['emergency', 'urgent', 'pain', 'toothache', 'broken', 'swollen'],
    answer:
      '🚨 For dental emergencies (severe pain, trauma, swelling), please call our emergency line immediately: +880-1800-DENTAL. We offer same-day emergency slots. If after hours, head to the nearest hospital.',
  },
  {
    keywords: ['location', 'address', 'where', 'direction', 'find us'],
    answer:
      'We are located at DentoCare Clinic, House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh. Parking is available. Nearest landmark: Dhanmondi Lake (500m south).',
  },
  {
    keywords: ['doctor', 'dentist', 'specialist', 'team', 'staff'],
    answer:
      'Our team includes specialists in General Dentistry, Orthodontics, Oral Surgery, Pediatric Dentistry, and Cosmetic Dentistry. All doctors are BDS/MDS qualified with 5–20 years of experience.',
  },
  {
    keywords: ['record', 'ehr', 'history', 'report', 'xray', 'x-ray', 'prescription'],
    answer:
      'Your dental records, X-rays, and prescriptions are stored securely in our Electronic Health Records system. Registered patients can request their records by visiting the clinic or calling us.',
  },
];

/**
 * Match incoming message against FAQ keywords and return best auto-reply.
 * Returns null if no match found (→ ticket stays open for human response).
 */
const getAutoReply = (subject, message) => {
  const combined = `${subject} ${message}`.toLowerCase();

  for (const faq of FAQ_ANSWERS) {
    if (faq.keywords.some((kw) => combined.includes(kw))) {
      return faq.answer;
    }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a new support ticket (Patient Help form)
// @route   POST /api/support/submit
// @access  Public — triggered when visitor submits "About Us → Patient Help" form
// ─────────────────────────────────────────────────────────────────────────────
export const submitTicket = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const {
      senderName,
      name,
      senderEmail,
      email,
      senderPhone,
      phone,
      subject,
      category,
      message,
      priority,
    } = req.body;

    // Resolve field aliases
    const resolvedName = (senderName || name || '').trim();
    const resolvedEmail = (senderEmail || email || '').trim();
    const resolvedPhone = (senderPhone || phone || '').trim();
    const resolvedMessage = (message || '').trim();
    const resolvedSubject = (subject || 'General Inquiry').trim();

    // Validation
    if (!resolvedName) {
      return res
        .status(400)
        .json({ success: false, message: 'Your name is required.' });
    }
    if (!resolvedEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'Your email address is required.' });
    }
    if (!resolvedMessage) {
      return res
        .status(400)
        .json({ success: false, message: 'Please write a message.' });
    }

    // Auto-reply logic — check FAQ match
    const autoReply = getAutoReply(resolvedSubject, resolvedMessage);
    const isAutoResolved = autoReply !== null;

    // Build initial thread
    const thread = [
      {
        sender: 'patient',
        message: resolvedMessage,
        timestamp: new Date(),
      },
    ];

    if (autoReply) {
      thread.push({
        sender: 'bot',
        message: autoReply,
        timestamp: new Date(),
      });
    }

    // Create ticket
    const ticket = await SupportTicket.create({
      senderName: resolvedName,
      senderEmail: resolvedEmail,
      senderPhone: resolvedPhone,
      subject: resolvedSubject,
      category: category || 'general',
      message: resolvedMessage,
      priority: priority || 'medium',
      status: isAutoResolved ? 'resolved' : 'open',
      autoReplySent: isAutoResolved,
      autoReplyMessage: autoReply || '',
      thread,
    });

    return res.status(201).json({
      success: true,
      message: isAutoResolved
        ? 'We found an instant answer for you! Your ticket has also been logged.'
        : 'Your message has been received. Our support team will respond within 24 hours.',
      ticketNumber: ticket.ticketNumber,
      autoReply: autoReply || null,
      data: ticket,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    console.error('submitTicket error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all support tickets (Admin dashboard)
// @route   GET /api/support/tickets
// @access  Protected (admin / receptionist)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllTickets = async (req, res) => {
  try {
    if (!checkDB(res)) return;
    const {
      status,
      category,
      priority,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { senderName: { $regex: search, $options: 'i' } },
        { senderEmail: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-thread'), // exclude heavy thread array in list view
      SupportTicket.countDocuments(filter),
    ]);

    // Summary counts by status
    const summary = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusSummary = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    summary.forEach((s) => {
      if (statusSummary.hasOwnProperty(s._id)) statusSummary[s._id] = s.count;
    });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      summary: statusSummary,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single ticket with full thread
// @route   GET /api/support/tickets/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    const ticket = isObjectId
      ? await SupportTicket.findById(id)
      : await SupportTicket.findOne({ ticketNumber: id.toUpperCase() });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    return res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin replies to a ticket
// @route   POST /api/support/tickets/:id/reply
// @access  Protected (admin / receptionist)
// ─────────────────────────────────────────────────────────────────────────────
export const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, adminNotes } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Reply message is required.' });
    }

    const ticket = mongoose.Types.ObjectId.isValid(id)
      ? await SupportTicket.findById(id)
      : await SupportTicket.findOne({ ticketNumber: id.toUpperCase() });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    ticket.thread.push({
      sender: 'admin',
      message: message.trim(),
      timestamp: new Date(),
    });

    ticket.status = 'in_progress';
    if (adminNotes) ticket.adminNotes = adminNotes;

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update ticket status
// @route   PATCH /api/support/tickets/:id/status
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const ticket = mongoose.Types.ObjectId.isValid(id)
      ? await SupportTicket.findById(id)
      : await SupportTicket.findOne({ ticketNumber: id.toUpperCase() });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to "${status}".`,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a ticket (super_admin only)
// @route   DELETE /api/support/tickets/:id
// @access  Protected (super_admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = mongoose.Types.ObjectId.isValid(id)
      ? await SupportTicket.findByIdAndDelete(id)
      : await SupportTicket.findOneAndDelete({ ticketNumber: id.toUpperCase() });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    return res.status(200).json({ success: true, message: 'Ticket deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Public FAQ endpoint — returns all FAQ entries
// @route   GET /api/support/faq
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getFAQ = (req, res) => {
  const faqs = [
    {
      question: 'What are your clinic hours?',
      answer:
        'Saturday–Thursday: 9:00 AM – 8:00 PM | Friday: 2:00 PM – 8:00 PM. Emergency hotline: +880-1800-DENTAL (24/7).',
    },
    {
      question: 'How do I book an appointment?',
      answer:
        'Click "Get Appointment" on our website, or call +880-1800-DENTAL. Same-day slots available for urgent cases.',
    },
    {
      question: 'What does a consultation cost?',
      answer:
        'Initial consultation: BDT 500. Treatment fees vary — Scaling from BDT 1,500, Fillings BDT 2,000–4,000, Root Canal BDT 6,000–12,000.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'Yes, we accept most major health insurance plans. Bring your insurance card and we will handle claims directly.',
    },
    {
      question: 'How do I access my dental records?',
      answer:
        'Registered patients can view records online in the Patient Records section, or request them at the front desk.',
    },
    {
      question: 'What should I do in a dental emergency?',
      answer:
        '🚨 Call our emergency line +880-1800-DENTAL immediately. We offer same-day emergency slots. After hours, go to the nearest hospital ER.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept bKash, Nagad, Visa/Mastercard, bank transfer, and cash. Invoice download is available after each visit.',
    },
    {
      question: 'Where is the clinic located?',
      answer:
        'House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh. 500m south of Dhanmondi Lake. Parking available.',
    },
  ];

  return res.status(200).json({ success: true, count: faqs.length, data: faqs });
};

export default {
  submitTicket,
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
  getFAQ,
};
