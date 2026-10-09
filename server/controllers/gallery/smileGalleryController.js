import mongoose from 'mongoose';
import SmileCase from '../../models/gallery/SmileCase.js';
import { deleteImageFiles } from '../../middlewares/galleryUpload.js';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API — triggered when "About Us → Smile Gallery" is accessed
// No auth required. Returns only status:'approved' cases.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc   Get all approved gallery cases (public-facing gallery page)
 * @route  GET /api/gallery
 * @access Public
 *
 * Query params:
 *   category  — filter by treatment category (e.g. "Dental Implants")
 *   tags      — comma-separated tag filter
 *   featured  — "true" to get only featured cases
 *   page      — pagination (default 1)
 *   limit     — results per page (default 12)
 *   sort      — "newest" | "oldest" | "popular" (default "newest")
 */
export const getPublicGallery = async (req, res) => {
  try {
    const {
      category,
      tags,
      featured,
      page  = 1,
      limit = 12,
      sort  = 'newest',
    } = req.query;

    // Only approved cases are visible publicly
    const filter = { status: 'approved' };

    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (tags) {
      const tagArr = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagArr.length) filter.tags = { $in: tagArr };
    }

    const sortMap = {
      newest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      popular: { viewCount: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const skip = (Number(page) - 1) * Number(limit);

    const [cases, total] = await Promise.all([
      SmileCase.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
        // Never expose originalFilename or uploadedBy details publicly
        .select('-beforeImage.originalFilename -afterImage.originalFilename -uploadedBy -uploadedByRole -rejectionReason -adminNotes'),
      SmileCase.countDocuments(filter),
    ]);

    // Available categories count for filter tabs on frontend
    const categoryCounts = await SmileCase.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      count:   cases.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      categories: categoryCounts,
      data:    cases,
    });
  } catch (err) {
    console.error('getPublicGallery error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get single approved case (public)
 * @route  GET /api/gallery/:id
 * @access Public
 */
export const getPublicCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, status: 'approved' }
      : { caseId: id.toUpperCase(), status: 'approved' };

    const smileCase = await SmileCase.findOne(query)
      .select('-beforeImage.originalFilename -afterImage.originalFilename -uploadedBy -uploadedByRole');

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Increment view count (fire-and-forget)
    SmileCase.findByIdAndUpdate(smileCase._id, { $inc: { viewCount: 1 } }).exec();

    return res.status(200).json({ success: true, data: smileCase });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CMS — protected routes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc   Get all cases with full details (admin dashboard)
 * @route  GET /api/gallery/admin/cases
 * @access Protected (super_admin, doctor, receptionist)
 */
export const adminGetAllCases = async (req, res) => {
  try {
    const {
      status,
      category,
      uploadedBy,
      search,
      page  = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status)     filter.status   = status;
    if (category)   filter.category = category;
    if (uploadedBy) filter.uploadedBy = { $regex: uploadedBy, $options: 'i' };
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { doctorName:  { $regex: search, $options: 'i' } },
        { caseId:      { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [cases, total] = await Promise.all([
      SmileCase.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('specialistId', 'name specialization profileImage'),
      SmileCase.countDocuments(filter),
    ]);

    // Status summary for dashboard widgets
    const statusSummary = await SmileCase.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const summary = { pending: 0, approved: 0, rejected: 0, archived: 0 };
    statusSummary.forEach((s) => { if (s._id in summary) summary[s._id] = s.count; });

    return res.status(200).json({
      success: true,
      count:  cases.length,
      total,
      page:   Number(page),
      pages:  Math.ceil(total / Number(limit)),
      summary,
      data:   cases,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new smile case with image upload
 * @route  POST /api/gallery/admin/cases
 * @access Protected (super_admin, receptionist, doctor)
 *
 * Images are processed by galleryMulter + processGalleryImages middleware
 * before this controller runs. Results sit in req.processedImages.
 */
export const createCase = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      doctorName,
      specialistId,
      patientAge,
      patientGender,
      treatmentDuration,
      procedureDetails,
      tags,
      isBefore_After,
      isFeatured,
      displayOrder,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    // Parse tags — accept comma string or JSON array
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Determine approval status based on uploader role
    // Doctors and super_admin get auto-approved; receptionist gets 'pending'
    const uploaderRole = req.user?.role || 'receptionist';
    const autoApprove  = ['super_admin', 'doctor'].includes(uploaderRole);

    const caseData = {
      title:            title.trim(),
      description:      description?.trim() || '',
      category,
      doctorName:       doctorName?.trim() || 'DentoCare Specialist',
      specialistId:     specialistId || null,
      patientAge:       patientAge   ? Number(patientAge)  : null,
      patientGender:    patientGender || 'Unspecified',
      treatmentDuration: treatmentDuration?.trim() || '',
      procedureDetails: procedureDetails?.trim() || '',
      tags:             parsedTags,
      isBefore_After:   isBefore_After !== 'false',
      isFeatured:       isFeatured === 'true' || isFeatured === true,
      displayOrder:     displayOrder ? Number(displayOrder) : 0,
      uploadedBy:       req.user?.name || 'Staff',
      uploadedByRole:   uploaderRole,
      status:           autoApprove ? 'approved' : 'pending',
      approvedBy:       autoApprove ? req.user?.name : null,
      approvedAt:       autoApprove ? new Date()    : null,
    };

    // Attach processed image metadata from middleware
    if (req.processedImages?.beforeImage) {
      caseData.beforeImage = req.processedImages.beforeImage;
    }
    if (req.processedImages?.afterImage) {
      caseData.afterImage = req.processedImages.afterImage;
    }

    const newCase = await SmileCase.create(caseData);

    return res.status(201).json({
      success: true,
      message: autoApprove
        ? `Case "${newCase.title}" created and published.`
        : `Case "${newCase.title}" submitted for doctor approval.`,
      data: newCase,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: msgs.join('; ') });
    }
    console.error('createCase error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update case details (no image re-upload — use separate endpoint)
 * @route  PUT /api/gallery/admin/cases/:id
 * @access Protected
 */
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findById(id)
      : await SmileCase.findOne({ caseId: id.toUpperCase() });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Parse tags if provided
    if (req.body.tags && typeof req.body.tags === 'string') {
      try { req.body.tags = JSON.parse(req.body.tags); }
      catch { req.body.tags = req.body.tags.split(',').map((t) => t.trim()); }
    }

    // Prevent overwriting approval fields directly through this endpoint
    delete req.body.status;
    delete req.body.approvedBy;
    delete req.body.approvedAt;
    delete req.body.caseId;

    Object.assign(existing, req.body);
    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Case updated successfully.',
      data:    existing,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Replace images on an existing case
 * @route  PATCH /api/gallery/admin/cases/:id/images
 * @access Protected (super_admin, doctor)
 */
export const replaceCaseImages = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findById(id)
      : await SmileCase.findOne({ caseId: id.toUpperCase() });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    if (req.processedImages?.beforeImage) {
      deleteImageFiles(existing.beforeImage);   // remove old files
      existing.beforeImage = req.processedImages.beforeImage;
    }
    if (req.processedImages?.afterImage) {
      deleteImageFiles(existing.afterImage);
      existing.afterImage = req.processedImages.afterImage;
    }

    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Images replaced and reprocessed successfully.',
      data:    existing,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Approve a pending case (lead doctor / super_admin action)
 * @route  PATCH /api/gallery/admin/cases/:id/approve
 * @access Protected (super_admin, doctor)
 */
export const approveCase = async (req, res) => {
  try {
    const { id } = req.params;

    const smileCase = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findById(id)
      : await SmileCase.findOne({ caseId: id.toUpperCase() });

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    if (smileCase.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Case is already approved.' });
    }

    smileCase.status     = 'approved';
    smileCase.approvedBy = req.user?.name || 'Lead Doctor';
    smileCase.approvedAt = new Date();
    smileCase.rejectionReason = '';
    await smileCase.save();

    return res.status(200).json({
      success: true,
      message: `Case "${smileCase.title}" is now live on the gallery.`,
      data:    smileCase,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Reject a pending case with reason
 * @route  PATCH /api/gallery/admin/cases/:id/reject
 * @access Protected (super_admin, doctor)
 */
export const rejectCase = async (req, res) => {
  try {
    const { id }     = req.params;
    const { reason } = req.body;

    const smileCase = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findById(id)
      : await SmileCase.findOne({ caseId: id.toUpperCase() });

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    smileCase.status          = 'rejected';
    smileCase.rejectionReason = reason?.trim() || 'No reason provided.';
    smileCase.approvedBy      = null;
    smileCase.approvedAt      = null;
    await smileCase.save();

    return res.status(200).json({
      success: true,
      message: 'Case rejected.',
      data:    smileCase,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Archive a case (soft delete — hidden from gallery but not deleted from DB)
 * @route  PATCH /api/gallery/admin/cases/:id/archive
 * @access Protected
 */
export const archiveCase = async (req, res) => {
  try {
    const { id } = req.params;

    const smileCase = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findByIdAndUpdate(id, { status: 'archived' }, { new: true })
      : await SmileCase.findOneAndUpdate({ caseId: id.toUpperCase() }, { status: 'archived' }, { new: true });

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    return res.status(200).json({ success: true, message: 'Case archived.', data: smileCase });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Hard delete a case and its image files
 * @route  DELETE /api/gallery/admin/cases/:id
 * @access Protected (super_admin only)
 */
export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const smileCase = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findByIdAndDelete(id)
      : await SmileCase.findOneAndDelete({ caseId: id.toUpperCase() });

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    // Delete all image files from disk
    deleteImageFiles(smileCase.beforeImage);
    deleteImageFiles(smileCase.afterImage);

    return res.status(200).json({ success: true, message: `Case "${smileCase.title}" permanently deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Toggle isFeatured flag
 * @route  PATCH /api/gallery/admin/cases/:id/feature
 * @access Protected (super_admin, doctor)
 */
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const smileCase = mongoose.Types.ObjectId.isValid(id)
      ? await SmileCase.findById(id)
      : await SmileCase.findOne({ caseId: id.toUpperCase() });

    if (!smileCase) {
      return res.status(404).json({ success: false, message: 'Case not found.' });
    }

    smileCase.isFeatured = !smileCase.isFeatured;
    await smileCase.save();

    return res.status(200).json({
      success: true,
      message: `Case ${smileCase.isFeatured ? 'marked as featured' : 'removed from featured'}.`,
      data:    smileCase,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getPublicGallery,
  getPublicCaseById,
  adminGetAllCases,
  createCase,
  updateCase,
  replaceCaseImages,
  approveCase,
  rejectCase,
  archiveCase,
  deleteCase,
  toggleFeatured,
};
