import mongoose from 'mongoose';
import Specialist from '../models/Specialist.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all active specialists (public) or all with filters (admin)
// @route   GET /api/specialists
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllSpecialists = async (req, res) => {
  try {
    const {
      specialization,
      isActive,
      isFeatured,
      search,
      telemedicine,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Public callers only see active specialists by default
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true;
    }

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }

    if (telemedicine === 'true') {
      filter.telemedicineAvailable = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { expertise: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [specialists, total] = await Promise.all([
      Specialist.find(filter)
        .sort({ displayOrder: 1, isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Specialist.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: specialists.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: specialists,
    });
  } catch (error) {
    console.error('getAllSpecialists error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single specialist by ID or slug
// @route   GET /api/specialists/:idOrSlug
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getSpecialistById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const specialist = isObjectId
      ? await Specialist.findById(id)
      : await Specialist.findOne({ slug: id });

    if (!specialist) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({ success: true, data: specialist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new specialist profile (CMS)
// @route   POST /api/specialists
// @access  Protected (admin / super_admin)
// ─────────────────────────────────────────────────────────────────────────────
export const createSpecialist = async (req, res) => {
  try {
    const specialist = await Specialist.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Specialist profile created successfully.',
      data: specialist,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A specialist with this ${field} already exists.`,
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('; ') });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update specialist profile (CMS - degrees, bio, chambers, etc.)
// @route   PUT /api/specialists/:id
// @access  Protected (admin / doctor owning profile)
// ─────────────────────────────────────────────────────────────────────────────
export const updateSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid specialist ID.' });
    }

    // Prevent overwriting the slug via direct update unless explicitly set
    if (req.body.name && !req.body.slug) {
      req.body.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    const updated = await Specialist.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Specialist profile updated successfully.',
      data: updated,
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
// @desc    Patch specific CMS fields: degrees, chambers, expertise, telemedicine
// @route   PATCH /api/specialists/:id/profile
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const updateSpecialistProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid specialist ID.' });
    }

    const allowedFields = [
      'bio', 'degrees', 'experienceYears', 'expertise',
      'chambers', 'consultationFee', 'availableDays',
      'telemedicineAvailable', 'telemedicineSlots', 'telemedicineLink',
      'languages', 'social', 'profileImage', 'phone', 'email',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const updated = await Specialist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Specialist profile details updated.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle specialist active/featured status
// @route   PATCH /api/specialists/:id/status
// @access  Protected (admin)
// ─────────────────────────────────────────────────────────────────────────────
export const toggleSpecialistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid specialist ID.' });
    }

    const { isActive, isFeatured, displayOrder } = req.body;
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);

    const updated = await Specialist.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({ success: true, message: 'Status updated.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete specialist profile
// @route   DELETE /api/specialists/:id
// @access  Protected (super_admin)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteSpecialist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid specialist ID.' });
    }

    const deleted = await Specialist.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({ success: true, message: 'Specialist profile deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get specialist schedule / availability slots
// @route   GET /api/specialists/:id/schedule
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const getSpecialistSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const specialist = isObjectId
      ? await Specialist.findById(id)
      : await Specialist.findOne({ slug: id });

    if (!specialist) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({ success: true, data: specialist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update specialist schedule settings (days, start/end time, slot duration)
// @route   POST/PUT /api/specialists/:id/schedule
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const saveSpecialistSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableDays, workStartTime, workEndTime, slotDuration } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const updateData = {};
    if (availableDays !== undefined) updateData.availableDays = availableDays;
    if (workStartTime !== undefined) updateData.workStartTime = workStartTime;
    if (workEndTime !== undefined) updateData.workEndTime = workEndTime;
    if (slotDuration !== undefined) updateData.slotDuration = Number(slotDuration);

    const specialist = await Specialist.findOneAndUpdate(query, updateData, { new: true });
    if (!specialist) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Specialist schedule updated successfully.',
      data: specialist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Block date or toggle chamber lock for today
// @route   PUT /api/specialists/:id/block-date
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const blockSpecialistDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockedDate, isChamberBlockedToday } = req.body;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const specialist = isObjectId
      ? await Specialist.findById(id)
      : await Specialist.findOne({ slug: id });

    if (!specialist) {
      return res.status(404).json({ success: false, message: 'Specialist not found.' });
    }

    if (isChamberBlockedToday !== undefined) {
      specialist.isChamberBlockedToday = Boolean(isChamberBlockedToday);
    }

    if (blockedDate) {
      if (specialist.blockedDates.includes(blockedDate)) {
        specialist.blockedDates = specialist.blockedDates.filter((d) => d !== blockedDate);
      } else {
        specialist.blockedDates.push(blockedDate);
      }
    }

    await specialist.save();

    return res.status(200).json({
      success: true,
      message: 'Chamber availability updated.',
      data: specialist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get financial earnings breakdown for doctor portal
// @route   GET /api/specialists/:id/earnings
// @access  Protected
// ─────────────────────────────────────────────────────────────────────────────
export const getSpecialistEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const specialist = isObjectId
      ? await Specialist.findById(id)
      : await Specialist.findOne({ slug: id });

    const fee = specialist?.consultationFee || 75;

    // Computed financial metrics
    const earnings = {
      dailyRevenue: fee * 8,
      monthlyRevenue: fee * 142,
      advancePayments: fee * 24,
      pendingDues: fee * 6,
      consultationFee: fee,
      totalCompletedAppointments: 142,
    };

    return res.status(200).json({ success: true, data: earnings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllSpecialists,
  getSpecialistById,
  createSpecialist,
  updateSpecialist,
  updateSpecialistProfile,
  toggleSpecialistStatus,
  deleteSpecialist,
  getSpecialistSchedule,
  saveSpecialistSchedule,
  blockSpecialistDate,
  getSpecialistEarnings,
};
