// backend/controllers/galleryController.js
// ─────────────────────────────────────────────────────────────────────────────
// Smile Gallery Controller: Public Frontend API + CMS Administration Logic
// Backs the "About Us → Smile Gallery" section on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
import asyncHandler from '../utils/asyncHandler.js';
import SmileGalleryCase, { GALLERY_CATEGORIES } from '../models/SmileGalleryCase.js';
import { processDentalImage, deleteCaseImages } from '../services/imageProcessingService.js';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Public API Endpoints ("About Us → Smile Gallery")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Fetch and filter approved smile transformation cases
 * @route   GET /api/gallery
 * @access  Public
 *
 * This is the primary endpoint triggered when a patient/visitor navigates to
 * "About Us → Smile Gallery" on the website.
 *
 * Query Parameters:
 *   - category: e.g. "Dental Implants", "Veneers"
 *   - search: text query searching title, description, or tags
 *   - tag: specific dental procedure tag (e.g. "porcelain")
 *   - featured: "true" to filter highlight cases
 *   - sort: "newest" (default), "popular", "duration"
 *   - page: integer (default 1)
 *   - limit: integer (default 12)
 */
export const getPublicGallery = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    tag,
    featured,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  // Enforce HIPAA & Consent filter: only approved cases with active patient consent
  const filter = {
    status: 'approved',
    'patientConsent.hasConsent': true,
  };

  // Category filter
  if (category && category !== 'All') {
    filter.category = category;
  }

  // Procedure / Tag filter
  if (tag) {
    filter.tags = tag.toLowerCase().trim();
  }

  // Featured flag filter
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  // Text search query
  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { tags: { $in: [new RegExp(term, 'i')] } },
      { 'treatmentDetails.procedures': { $in: [new RegExp(term, 'i')] } },
    ];
  }

  // Sort configuration
  let sortOption = { createdAt: -1 };
  if (sort === 'popular') {
    sortOption = { 'metrics.views': -1, 'metrics.likes': -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'featured') {
    sortOption = { isFeatured: -1, createdAt: -1 };
  }

  const currentPage = Math.max(1, parseInt(page, 10));
  const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (currentPage - 1) * pageLimit;

  // Execute query with projection excluding internal administrative notes
  const [cases, totalCases] = await Promise.all([
    SmileGalleryCase.find(filter)
      .select('-approvalWorkflow.rejectionReason -approvalWorkflow.submittedBy -patientConsent.anonymizedReference')
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    SmileGalleryCase.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCases / pageLimit);

  res.status(200).json({
    success: true,
    data: {
      cases,
      pagination: {
        totalCases,
        totalPages,
        currentPage,
        limit: pageLimit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
      filtersApplied: {
        category: category || 'All',
        search: search || null,
        tag: tag || null,
        sort,
      },
    },
  });
});

/**
 * @desc    Get detailed single case by ID or CaseID (increments view count)
 * @route   GET /api/gallery/:id
 * @access  Public
 */
export const getCaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Support MongoDB ObjectId or anonymized caseId (e.g. CASE-2026-F3A19)
  const isObjectId = mongoose.isValidObjectId(id);
  const query = isObjectId ? { _id: id } : { caseId: id };

  const galleryCase = await SmileGalleryCase.findOneAndUpdate(
    { ...query, status: 'approved' },
    { $inc: { 'metrics.views': 1 } },
    { new: true }
  ).select('-approvalWorkflow.rejectionReason -approvalWorkflow.submittedBy');

  if (!galleryCase) {
    return res.status(404).json({
      success: false,
      message: 'Smile gallery case not found or not currently published.',
    });
  }

  res.status(200).json({
    success: true,
    case: galleryCase,
  });
});

/**
 * @desc    Like / Upvote a smile transformation case
 * @route   POST /api/gallery/:id/like
 * @access  Public
 */
export const likeCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isObjectId = mongoose.isValidObjectId(id);
  const query = isObjectId ? { _id: id } : { caseId: id };

  const updatedCase = await SmileGalleryCase.findOneAndUpdate(
    { ...query, status: 'approved' },
    { $inc: { 'metrics.likes': 1 } },
    { new: true }
  ).select('caseId metrics');

  if (!updatedCase) {
    return res.status(404).json({
      success: false,
      message: 'Case not found.',
    });
  }

  res.status(200).json({
    success: true,
    likes: updatedCase.metrics.likes,
  });
});

/**
 * @desc    Get gallery category list with active published case counts
 * @route   GET /api/gallery/categories
 * @access  Public
 */
export const getGalleryCategories = asyncHandler(async (_req, res) => {
  // Aggregate count of approved cases per category
  const aggregation = await SmileGalleryCase.aggregate([
    { $match: { status: 'approved', 'patientConsent.hasConsent': true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countsMap = aggregation.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const categories = GALLERY_CATEGORIES.map((cat) => ({
    name: cat,
    count: countsMap[cat] || 0,
  }));

  const totalPublished = aggregation.reduce((sum, item) => sum + item.count, 0);

  res.status(200).json({
    success: true,
    totalPublished,
    categories,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin & Staff CMS Endpoints (Module 4: CRUD & Approval Workflow)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Create a new smile gallery case (Assistant or Lead Doctor upload)
 * @route   POST /api/gallery
 * @access  Protected (Admin, Staff, Doctor)
 */
export const createCase = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    description,
    doctorId,
    doctorName,
    doctorSpecialty,
    duration,
    teethNumbers,
    procedures,
    initialShade,
    finalShade,
    tags,
    hasConsent,
    consentScope,
    patientAgeGroup,
    patientGender,
    anonymizedConsentRef,
  } = req.body;

  // Validate required images
  if (!req.files || !req.files.beforeImage || !req.files.afterImage) {
    return res.status(400).json({
      success: false,
      message: 'Both beforeImage and afterImage photo files are required.',
    });
  }

  if (!title || !category || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title, category, and clinical description are required.',
    });
  }

  // Parse arrays if passed as JSON string or comma-separated string from multipart form
  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string' && tags.trim()
    ? tags.split(',').map((t) => t.trim().toLowerCase())
    : [];

  const parsedTeeth = Array.isArray(teethNumbers)
    ? teethNumbers
    : typeof teethNumbers === 'string' && teethNumbers.trim()
    ? teethNumbers.split(',').map((t) => t.trim())
    : [];

  const parsedProcedures = Array.isArray(procedures)
    ? procedures
    : typeof procedures === 'string' && procedures.trim()
    ? procedures.split(',').map((p) => p.trim())
    : [];

  // 1. Process Before & After images through the Sharp HIPAA/Optimization pipeline
  const [beforeProcessed, afterProcessed] = await Promise.all([
    processDentalImage(req.files.beforeImage[0].buffer, 'before'),
    processDentalImage(req.files.afterImage[0].buffer, 'after'),
  ]);

  // Determine initial workflow status:
  // Lead Doctor or Admin can immediately publish as 'approved' if consent is given;
  // Dental assistants (staff) default to 'pending_approval'
  const isLead = ['admin'].includes(req.user.role);
  const consentBool = String(hasConsent).toLowerCase() === 'true';

  let initialStatus = 'pending_approval';
  if (req.body.status && ['draft', 'pending_approval'].includes(req.body.status)) {
    initialStatus = req.body.status;
  } else if (isLead && req.body.status === 'approved' && consentBool) {
    initialStatus = 'approved';
  }

  const newCase = new SmileGalleryCase({
    title,
    category,
    description,
    doctor: doctorId && mongoose.isValidObjectId(doctorId) ? doctorId : undefined,
    doctorName: doctorName || req.user.name || 'Lead Clinic Specialist',
    doctorSpecialty: doctorSpecialty || 'Cosmetic Dentistry',
    images: {
      before: {
        thumbnail: beforeProcessed.thumbnail,
        display: beforeProcessed.display,
        full: beforeProcessed.full,
        alt: `${title} - Before treatment clinical photograph`,
        dimensions: beforeProcessed.dimensions,
      },
      after: {
        thumbnail: afterProcessed.thumbnail,
        display: afterProcessed.display,
        full: afterProcessed.full,
        alt: `${title} - After treatment clinical photograph`,
        dimensions: afterProcessed.dimensions,
      },
    },
    treatmentDetails: {
      duration: duration || 'Not specified',
      teethNumbers: parsedTeeth,
      procedures: parsedProcedures,
      initialShade: initialShade || '',
      finalShade: finalShade || '',
    },
    patientConsent: {
      hasConsent: consentBool,
      consentDate: req.body.consentDate ? new Date(req.body.consentDate) : new Date(),
      consentScope: consentScope || 'Limited Smile Only',
      anonymizedReference: anonymizedConsentRef || '',
      patientAgeGroup: patientAgeGroup || 'Unspecified',
      patientGender: patientGender || 'Undisclosed',
    },
    tags: parsedTags,
    status: initialStatus,
    approvalWorkflow: {
      submittedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
        at: new Date(),
      },
      ...(initialStatus === 'approved' && {
        reviewedBy: {
          userId: req.user._id,
          name: req.user.name,
          role: req.user.role,
          at: new Date(),
        },
        approvedAt: new Date(),
      }),
    },
    isFeatured: String(req.body.isFeatured).toLowerCase() === 'true',
  });

  await newCase.save();

  res.status(201).json({
    success: true,
    message:
      initialStatus === 'approved'
        ? 'Case published to Smile Gallery successfully.'
        : 'Case submitted successfully and is awaiting review from the lead doctor.',
    case: newCase,
  });
});

/**
 * @desc    Get all cases for Admin / CMS Dashboard (including drafts & pending)
 * @route   GET /api/gallery/admin/cases
 * @access  Protected (Admin, Staff)
 */
export const getAdminCases = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { title: { $regex: term, $options: 'i' } },
      { caseId: { $regex: term, $options: 'i' } },
      { doctorName: { $regex: term, $options: 'i' } },
    ];
  }

  const currentPage = Math.max(1, parseInt(page, 10));
  const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (currentPage - 1) * pageLimit;

  const [cases, totalCases, statusCounts] = await Promise.all([
    SmileGalleryCase.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean(),
    SmileGalleryCase.countDocuments(filter),
    SmileGalleryCase.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const summary = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    totalCases,
    totalPages: Math.ceil(totalCases / pageLimit),
    currentPage,
    summary: {
      pending: summary.pending_approval || 0,
      approved: summary.approved || 0,
      draft: summary.draft || 0,
      rejected: summary.rejected || 0,
    },
    cases,
  });
});

/**
 * @desc    Update case details and optionally replace images
 * @route   PUT /api/gallery/:id
 * @access  Protected (Admin, Staff)
 */
export const updateCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingCase = await SmileGalleryCase.findById(id);

  if (!existingCase) {
    return res.status(404).json({
      success: false,
      message: 'Case not found.',
    });
  }

  const updates = { ...req.body };

  // Handle image replacements if uploaded
  if (req.files) {
    if (req.files.beforeImage) {
      await deleteCaseImages(existingCase.images.before);
      const beforeProcessed = await processDentalImage(
        req.files.beforeImage[0].buffer,
        'before'
      );
      existingCase.images.before = {
        thumbnail: beforeProcessed.thumbnail,
        display: beforeProcessed.display,
        full: beforeProcessed.full,
        alt: `${updates.title || existingCase.title} - Before treatment`,
        dimensions: beforeProcessed.dimensions,
      };
    }

    if (req.files.afterImage) {
      await deleteCaseImages(existingCase.images.after);
      const afterProcessed = await processDentalImage(
        req.files.afterImage[0].buffer,
        'after'
      );
      existingCase.images.after = {
        thumbnail: afterProcessed.thumbnail,
        display: afterProcessed.display,
        full: afterProcessed.full,
        alt: `${updates.title || existingCase.title} - After treatment`,
        dimensions: afterProcessed.dimensions,
      };
    }
  }

  // Update scalar fields
  if (updates.title) existingCase.title = updates.title;
  if (updates.category) existingCase.category = updates.category;
  if (updates.description) existingCase.description = updates.description;
  if (updates.doctorName) existingCase.doctorName = updates.doctorName;
  if (updates.doctorSpecialty) existingCase.doctorSpecialty = updates.doctorSpecialty;
  if (updates.isFeatured !== undefined) {
    existingCase.isFeatured = String(updates.isFeatured).toLowerCase() === 'true';
  }

  // Treatment Details
  if (updates.duration) existingCase.treatmentDetails.duration = updates.duration;
  if (updates.initialShade) existingCase.treatmentDetails.initialShade = updates.initialShade;
  if (updates.finalShade) existingCase.treatmentDetails.finalShade = updates.finalShade;
  if (updates.teethNumbers) {
    existingCase.treatmentDetails.teethNumbers = Array.isArray(updates.teethNumbers)
      ? updates.teethNumbers
      : updates.teethNumbers.split(',').map((t) => t.trim());
  }
  if (updates.procedures) {
    existingCase.treatmentDetails.procedures = Array.isArray(updates.procedures)
      ? updates.procedures
      : updates.procedures.split(',').map((p) => p.trim());
  }

  // Patient Consent updates
  if (updates.hasConsent !== undefined) {
    existingCase.patientConsent.hasConsent = String(updates.hasConsent).toLowerCase() === 'true';
  }
  if (updates.consentScope) existingCase.patientConsent.consentScope = updates.consentScope;
  if (updates.patientAgeGroup) existingCase.patientConsent.patientAgeGroup = updates.patientAgeGroup;
  if (updates.patientGender) existingCase.patientConsent.patientGender = updates.patientGender;

  // Tags
  if (updates.tags) {
    existingCase.tags = Array.isArray(updates.tags)
      ? updates.tags
      : updates.tags.split(',').map((t) => t.trim().toLowerCase());
  }

  // If a staff member modifies an approved case, return it to pending_approval for re-verification
  if (req.user.role === 'staff' && existingCase.status === 'approved') {
    existingCase.status = 'pending_approval';
  }

  await existingCase.save();

  res.status(200).json({
    success: true,
    message: 'Smile gallery case updated successfully.',
    case: existingCase,
  });
});

/**
 * @desc    Approve or Reject a case (Lead Doctor / Admin Approval System)
 * @route   PATCH /api/gallery/:id/review
 * @access  Protected (Admin only)
 */
export const reviewCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be either 'approve' or 'reject'.",
    });
  }

  const galleryCase = await SmileGalleryCase.findById(id);
  if (!galleryCase) {
    return res.status(404).json({
      success: false,
      message: 'Case record not found.',
    });
  }

  if (action === 'approve') {
    // Verify HIPAA Consent
    if (!galleryCase.patientConsent?.hasConsent) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve case: Patient consent has not been verified.',
      });
    }

    galleryCase.status = 'approved';
    galleryCase.approvalWorkflow.reviewedBy = {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role,
      at: new Date(),
    };
    galleryCase.approvalWorkflow.approvedAt = new Date();
    galleryCase.approvalWorkflow.rejectionReason = undefined;
  } else {
    galleryCase.status = 'rejected';
    galleryCase.approvalWorkflow.reviewedBy = {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role,
      at: new Date(),
    };
    galleryCase.approvalWorkflow.rejectionReason = rejectionReason || 'Does not meet publication standards.';
  }

  await galleryCase.save();

  res.status(200).json({
    success: true,
    message: `Case ${action === 'approve' ? 'approved and published live' : 'rejected'}.`,
    case: galleryCase,
  });
});

/**
 * @desc    Delete a smile case and clean up storage files
 * @route   DELETE /api/gallery/:id
 * @access  Protected (Admin only)
 */
export const deleteCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const galleryCase = await SmileGalleryCase.findById(id);

  if (!galleryCase) {
    return res.status(404).json({
      success: false,
      message: 'Case not found.',
    });
  }

  // Clean up physical WebP files from disk
  await Promise.all([
    deleteCaseImages(galleryCase.images.before),
    deleteCaseImages(galleryCase.images.after),
  ]);

  await galleryCase.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Case and associated clinical images deleted permanently.',
  });
});

/**
 * @desc    Toggle Featured Case Status
 * @route   PATCH /api/gallery/:id/feature
 * @access  Protected (Admin only)
 */
export const toggleFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const galleryCase = await SmileGalleryCase.findById(id);

  if (!galleryCase) {
    return res.status(404).json({
      success: false,
      message: 'Case not found.',
    });
  }

  galleryCase.isFeatured = !galleryCase.isFeatured;
  await galleryCase.save();

  res.status(200).json({
    success: true,
    message: `Case ${galleryCase.isFeatured ? 'marked as featured' : 'removed from featured'}.`,
    isFeatured: galleryCase.isFeatured,
  });
});
