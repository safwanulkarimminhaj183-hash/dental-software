// backend/controllers/supportController.js
// Backs the "About Us → Patient Help" section.
// Handles ticket submission from the help form, auto-reply for FAQs,
// admin ticket management, and real-time Socket.io routing.

import asyncHandler from '../utils/asyncHandler.js';
import SupportTicket from '../models/SupportTicket.js';
import { getAutoReply } from '../services/faqService.js';
import mongoose from 'mongoose';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Emit a new ticket / new message to admin room via Socket.io if available. */
const emitToAdmin = (req, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to('admin-room').emit(event, payload);
};

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc   Submit a new support ticket from the "Patient Help" form
 * @route  POST /api/support/submit
 * @access Public (guests) or Protected (authenticated patients)
 *
 * This is the primary endpoint triggered when a user clicks
 * "About Us → Patient Help" on the frontend and submits the inquiry form.
 *
 * Body: { subject, message, category?, guestName?, guestEmail?, guestPhone? }
 *
 * Behaviour:
 *  1. Creates the ticket with the patient's first message.
 *  2. Checks the message against the FAQ knowledge base.
 *  3. If an FAQ match is found, appends an instant auto-reply and marks
 *     autoReplyTriggered = true.
 *  4. Emits a Socket.io event to the admin dashboard room.
 *  5. Returns the ticket (with auto-reply included) to the frontend.
 */
export const submitTicket = asyncHandler(async (req, res) => {
  const { subject, message, category, guestName, guestEmail, guestPhone } = req.body;

  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'subject and message are required.',
    });
  }

  // If authenticated, use user identity; otherwise require guest details
  const isGuest = !req.user;
  if (isGuest && !guestEmail) {
    return res.status(400).json({
      success: false,
      message: 'guestEmail is required for unauthenticated submissions.',
    });
  }

  const senderName = req.user
    ? req.user.name || `${req.user.firstName ?? ''} ${req.user.lastName ?? ''}`.trim()
    : guestName || 'Guest';

  // Build the initial message from the patient/guest
  const firstMessage = {
    sender: 'patient',
    senderName,
    text: message,
    readByAdmin: false,
    readByPatient: true,
  };

  const ticketData = {
    patientId: req.user ? req.user._id : null,
    guestName: isGuest ? guestName : undefined,
    guestEmail: isGuest ? guestEmail : undefined,
    guestPhone: isGuest ? guestPhone : undefined,
    subject,
    category: category || 'general',
    messages: [firstMessage],
    status: 'open',
  };

  const ticket = await SupportTicket.create(ticketData);

  // ── FAQ auto-reply check ────────────────────────────────────────────────
  const autoReply = getAutoReply(message);
  if (autoReply) {
    ticket.messages.push({
      sender: 'system',
      senderName: 'Smile Care Bot',
      text: autoReply.answer,
      isAutoReply: true,
      readByAdmin: true,
      readByPatient: false,
    });
    ticket.autoReplyTriggered = true;
    ticket.autoReplyKeyword = autoReply.matchedKeyword;
    await ticket.save();
  }

  // ── Real-time notification to admin dashboard ───────────────────────────
  emitToAdmin(req, 'support:new-ticket', {
    ticketId: ticket._id,
    subject: ticket.subject,
    senderName,
    category: ticket.category,
    createdAt: ticket.createdAt,
    autoReplied: ticket.autoReplyTriggered,
  });

  res.status(201).json({
    success: true,
    message: 'Your message has been received. Our team will respond shortly.',
    ticketId: ticket._id,
    autoReplied: ticket.autoReplyTriggered,
    // Return auto-reply text to the frontend so it can display instantly
    autoReplyMessage: autoReply ? autoReply.answer : null,
    ticket,
  });
});

/**
 * @desc   Get all support tickets (admin dashboard)
 * @route  GET /api/support/tickets
 * @access Protected (admin, staff)
 *
 * Query params: status, category, page, limit, search
 */
export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 20, search } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ subject: regex }, { guestName: regex }, { guestEmail: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('patientId', 'firstName lastName email phone')
      .populate('assignedTo', 'name email')
      .lean(),
    SupportTicket.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    tickets,
  });
});

/**
 * @desc   Get a single ticket by ID (full thread)
 * @route  GET /api/support/tickets/:id
 * @access Protected (admin/staff, or owning patient)
 */
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('patientId', 'firstName lastName email phone')
    .populate('assignedTo', 'name email');

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  const isAdmin = ['admin', 'staff'].includes(req.user?.role);
  const isOwner = ticket.patientId?._id?.toString() === req.user?._id?.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  // Mark messages as read
  if (isAdmin) {
    ticket.messages.forEach((m) => { m.readByAdmin = true; });
  } else {
    ticket.messages.forEach((m) => { m.readByPatient = true; });
  }
  await ticket.save();

  res.json({ success: true, ticket });
});

/**
 * @desc   Reply to an existing ticket
 * @route  POST /api/support/tickets/:id/reply
 * @access Protected (admin/staff to reply as admin; patient for own ticket)
 *
 * Body: { message }
 */
export const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'message is required.' });
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  if (['resolved', 'closed'].includes(ticket.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot reply to a resolved or closed ticket.',
    });
  }

  const isAdmin = ['admin', 'staff'].includes(req.user.role);
  const sender = isAdmin ? 'admin' : 'patient';
  const senderName = req.user.name || req.user.email;

  ticket.messages.push({
    sender,
    senderName,
    text: message,
    readByAdmin: isAdmin,
    readByPatient: !isAdmin,
  });

  if (isAdmin && ticket.status === 'open') {
    ticket.status = 'in_progress';
  }

  await ticket.save();

  // Real-time push to the relevant room
  const io = req.app.get('io');
  if (io) {
    const roomEvent = isAdmin ? `ticket:${ticket._id}` : 'support:new-reply';
    io.to(roomEvent).emit('support:message', {
      ticketId: ticket._id,
      sender,
      senderName,
      text: message,
      isAdmin,
    });
  }

  res.json({ success: true, message: 'Reply sent.', ticket });
});

/**
 * @desc   Update ticket status (admin only)
 * @route  PATCH /api/support/tickets/:id/status
 * @access Protected (admin, staff)
 *
 * Body: { status: 'open' | 'in_progress' | 'resolved' | 'closed', assignedTo? }
 */
export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, assignedTo } = req.body;
  const allowed = ['open', 'in_progress', 'resolved', 'closed'];

  if (status && !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${allowed.join(', ')}.`,
    });
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  if (status) ticket.status = status;
  if (status === 'resolved') ticket.resolvedAt = new Date();
  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
    ticket.assignedTo = assignedTo;
  }

  await ticket.save();

  emitToAdmin(req, 'support:ticket-updated', {
    ticketId: ticket._id,
    status: ticket.status,
    assignedTo: ticket.assignedTo,
  });

  res.json({ success: true, message: 'Ticket updated.', ticket });
});

/**
 * @desc   Get tickets submitted by the authenticated patient
 * @route  GET /api/support/my-tickets
 * @access Protected (patient)
 */
export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ patientId: req.user._id })
    .sort({ updatedAt: -1 })
    .lean();

  res.json({ success: true, count: tickets.length, tickets });
});
