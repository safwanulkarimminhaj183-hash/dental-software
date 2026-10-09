import { queries } from '../config/db.js';

// @desc    Create dentist availability
// @route   POST /api/v1/availability
// @access  Protected (Admin/Doctor)
export const createAvailability = async (req, res) => {
  try {
    const { doctorName, day, timeSlots, isAvailable } = req.body;

    if (!doctorName || !day || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide doctorName, day (Monday-Sunday), and timeSlots (array).' 
      });
    }

    const newAvailability = await queries.createAvailability({
      doctorName,
      day,
      timeSlots,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({
      success: true,
      message: 'Dentist availability created successfully',
      data: newAvailability
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dentist availabilities (supports dynamic filtering)
// @route   GET /api/v1/availability
// @access  Public
export const getAllAvailabilities = async (req, res) => {
  try {
    const { doctorName, day, isAvailable } = req.query;
    const filter = {};

    if (doctorName) filter.doctorName = { $regex: doctorName, $options: 'i' };
    if (day) filter.day = day;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const availabilities = await queries.getAllAvailabilities(filter);
    res.status(200).json({
      success: true,
      count: availabilities.length,
      data: availabilities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single availability by ID
// @route   GET /api/v1/availability/:id
// @access  Public
export const getAvailabilityById = async (req, res) => {
  try {
    const availability = await queries.getAvailabilityById(req.params.id);
    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability record not found' });
    }
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dentist availability
// @route   PUT /api/v1/availability/:id
// @access  Protected (Admin/Doctor)
export const updateAvailability = async (req, res) => {
  try {
    const updated = await queries.updateAvailability(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Availability record not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete dentist availability
// @route   DELETE /api/v1/availability/:id
// @access  Protected (Admin/Doctor)
export const deleteAvailability = async (req, res) => {
  try {
    const deleted = await queries.deleteAvailability(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Availability record not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Availability record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability
};
