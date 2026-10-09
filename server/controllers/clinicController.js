import mongoose from 'mongoose';
import Clinic, { DEFAULT_CLINIC } from '../models/Clinic.js';

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

const ALLOWED_FIELDS = [
  'name',
  'description',
  'bannerImage',
  'features',
  'openingHours',
  'address',
  'mapLink',
  'phone',
  'email',
];

function pickClinicFields(body = {}) {
  const payload = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  if (payload.features && !Array.isArray(payload.features)) {
    payload.features = String(payload.features)
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  }
  return payload;
}

export async function ensureClinicDocument() {
  let clinic = await Clinic.findOne().sort({ createdAt: 1 });
  if (!clinic) {
    clinic = await Clinic.create(DEFAULT_CLINIC);
  }
  return clinic;
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get clinic details (About Us → Our Clinic)
// @route   GET /api/clinic-info
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getClinicInfo = async (req, res) => {
  try {
    if (!checkDB(res)) return;

    const clinic = await ensureClinicDocument();
    return res.status(200).json({ success: true, data: clinic });
  } catch (error) {
    console.error('getClinicInfo error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create clinic profile if none exists
// @route   POST /api/clinic-info  |  POST /api/admin/clinic-info
// @access  Protected (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const createClinicInfo = async (req, res) => {
  try {
    if (!checkDB(res)) return;

    const existing = await Clinic.findOne();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Clinic information already exists. Use PUT to update it.',
        data: existing,
      });
    }

    const payload = pickClinicFields(req.body);
    if (!payload.name || !String(payload.name).trim()) {
      return res.status(400).json({ success: false, message: 'Clinic name is required.' });
    }
    if (!payload.description || !String(payload.description).trim()) {
      return res.status(400).json({ success: false, message: 'Clinic description is required.' });
    }

    const clinic = await Clinic.create({ ...DEFAULT_CLINIC, ...payload });
    return res.status(201).json({
      success: true,
      message: 'Clinic information created.',
      data: clinic,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    console.error('createClinicInfo error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update (or upsert) clinic information
// @route   PUT /api/clinic-info  |  PUT /api/admin/clinic-info
// @access  Protected (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const updateClinicInfo = async (req, res) => {
  try {
    if (!checkDB(res)) return;

    const payload = pickClinicFields(req.body);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No clinic fields provided to update.',
      });
    }

    let clinic = await Clinic.findOne();
    if (!clinic) {
      if (!payload.name || !payload.description) {
        return res.status(400).json({
          success: false,
          message: 'name and description are required when creating clinic information.',
        });
      }
      clinic = await Clinic.create({ ...DEFAULT_CLINIC, ...payload });
      return res.status(201).json({
        success: true,
        message: 'Clinic information created.',
        data: clinic,
      });
    }

    Object.assign(clinic, payload);
    await clinic.save();

    return res.status(200).json({
      success: true,
      message: 'Clinic information updated.',
      data: clinic,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    console.error('updateClinicInfo error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getClinicInfo,
  createClinicInfo,
  updateClinicInfo,
  ensureClinicDocument,
};
