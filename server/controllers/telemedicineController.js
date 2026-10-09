import mongoose from 'mongoose';
import TelemedicineSession from '../models/TelemedicineSession.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all telemedicine sessions
// @route   GET /api/telemedicine
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const getAllSessions = async (req, res) => {
  try {
    const {
      status,
      specialistId,
      patientEmail,
      consultationType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status.toLowerCase();
    if (specialistId && mongoose.Types.ObjectId.isValid(specialistId)) {
      filter.specialistId = specialistId;
    }
    if (patientEmail) filter.patientEmail = { $regex: patientEmail, $options: 'i' };
    if (consultationType) filter.consultationType = consultationType;

    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [sessions, total] = await Promise.all([
      TelemedicineSession.find(filter)
        .populate('specialistId', 'name specialization profileImage')
        .select('-messages') // exclude chat history from list view for performance
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      TelemedicineSession.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sessions,
    });
  } catch (error) {
    console.error('getAllSessions error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single session (includes chat messages)
// @route   GET /api/telemedicine/:id
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const session = isObjectId
      ? await TelemedicineSession.findById(id).populate('specialistId', 'name specialization profileImage telemedicineLink')
      : await TelemedicineSession.findOne({ sessionId: id.toUpperCase() }).populate('specialistId', 'name specialization profileImage telemedicineLink');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Book / create a new telemedicine session
// @route   POST /api/telemedicine
// @access  Public (patients)
// ─────────────────────────────────────────────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const { specialistName, patientName, scheduledAt } = req.body;

    if (!specialistName || !specialistName.trim()) {
      return res.status(400).json({ success: false, message: 'Specialist name is required.' });
    }
    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ success: false, message: 'Patient name is required.' });
    }
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: 'Scheduled time is required.' });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid scheduled date/time.' });
    }

    // Generate a simple meeting room code
    const roomCode = `DC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const sessionData = { ...req.body, scheduledAt: parsedDate, roomCode };

    const session = await TelemedicineSession.create(sessionData);

    return res.status(201).json({
      success: true,
      message: `Telemedicine session ${session.sessionId} scheduled successfully.`,
      data: session,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update session status (activate / complete / cancel)
// @route   PATCH /api/telemedicine/:id/status
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID.' });
    }

    const { status, clinicalNotes, diagnosis, followUpRequired, followUpDate } = req.body;
    const validStatuses = ['scheduled', 'waiting', 'active', 'completed', 'cancelled', 'missed'];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = status.toLowerCase();

    // Auto-set timestamps based on status transitions
    if (status === 'active' && !session.startedAt) session.startedAt = new Date();
    if (status === 'completed' && !session.endedAt) session.endedAt = new Date();

    if (clinicalNotes !== undefined) session.clinicalNotes = clinicalNotes;
    if (diagnosis !== undefined) session.diagnosis = diagnosis;
    if (followUpRequired !== undefined) session.followUpRequired = followUpRequired;
    if (followUpDate) session.followUpDate = new Date(followUpDate);

    await session.save();

    return res.status(200).json({
      success: true,
      message: `Session status updated to '${session.status}'.`,
      data: session,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a chat message to a session
// @route   POST /api/telemedicine/:id/messages
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const addChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID.' });
    }

    const { sender, senderName, message, messageType, fileUrl } = req.body;

    if (!sender || !['doctor', 'patient', 'system'].includes(sender)) {
      return res.status(400).json({ success: false, message: "Sender must be 'doctor', 'patient', or 'system'." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const session = await TelemedicineSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.status === 'cancelled' || session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot add messages to a ${session.status} session.`,
      });
    }

    session.messages.push({ sender, senderName, message, messageType, fileUrl });
    await session.save();

    const newMessage = session.messages[session.messages.length - 1];
    return res.status(201).json({ success: true, message: 'Message sent.', data: newMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get online/available specialists for telemedicine right now
// @route   GET /api/telemedicine/available-now
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailableNow = async (req, res) => {
  try {
    // Find sessions currently in 'active' or 'waiting' state
    const activeSessions = await TelemedicineSession.find({
      status: { $in: ['active', 'waiting'] },
    })
      .populate('specialistId', 'name specialization profileImage telemedicineLink consultationFee')
      .select('specialistId specialistName consultationType status scheduledAt');

    return res.status(200).json({
      success: true,
      count: activeSessions.length,
      data: activeSessions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a session
// @route   DELETE /api/telemedicine/:id
// @access  Protected (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid session ID.' });
    }

    const deleted = await TelemedicineSession.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    return res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllSessions,
  getSessionById,
  createSession,
  updateSessionStatus,
  addChatMessage,
  getAvailableNow,
  deleteSession,
};
