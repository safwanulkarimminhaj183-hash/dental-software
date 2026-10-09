import Clinic, { DEFAULT_CLINIC } from '../models/Clinic.js';

/**
 * @desc    Get Clinic Info for "About Us -> Our Clinic"
 * @route   GET /api/about/clinic
 * @access  Public
 */
export const getClinicAbout = async (req, res, next) => {
  try {
    const clinic = await Clinic.findOne();

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic information not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: clinic,
    });
  } catch (error) {
    console.error('Error in getClinicAbout:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching clinic information.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update or Upsert Clinic Information (Admin)
 * @route   PUT /api/about/clinic
 * @access  Admin / Protected
 */
export const updateClinicAbout = async (req, res, next) => {
  try {
    const {
      clinicHistory,
      doctorProfiles,
      labImages,
      workingHours,
      facilities,
      name,
      description,
      bannerImage,
      address,
      phone,
      email,
    } = req.body;

    let clinic = await Clinic.findOne();

    if (!clinic) {
      clinic = await Clinic.create({
        clinicHistory,
        doctorProfiles,
        labImages,
        workingHours,
        facilities,
        name,
        description,
        bannerImage,
        address,
        phone,
        email,
      });

      return res.status(201).json({
        success: true,
        message: 'Clinic information created successfully.',
        data: clinic,
      });
    }

    // Update existing clinic
    if (clinicHistory !== undefined) clinic.clinicHistory = clinicHistory;
    if (doctorProfiles !== undefined) clinic.doctorProfiles = doctorProfiles;
    if (labImages !== undefined) clinic.labImages = labImages;
    if (workingHours !== undefined) clinic.workingHours = workingHours;
    if (facilities !== undefined) clinic.facilities = facilities;
    if (name !== undefined) clinic.name = name;
    if (description !== undefined) clinic.description = description;
    if (bannerImage !== undefined) clinic.bannerImage = bannerImage;
    if (address !== undefined) clinic.address = address;
    if (phone !== undefined) clinic.phone = phone;
    if (email !== undefined) clinic.email = email;

    await clinic.save();

    return res.status(200).json({
      success: true,
      message: 'Clinic information updated successfully.',
      data: clinic,
    });
  } catch (error) {
    console.error('Error updating clinic information:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating clinic information.',
      error: error.message,
    });
  }
};

export default {
  getClinicAbout,
  updateClinicAbout,
};
