// backend/models/SmileGalleryCase.js
// ─────────────────────────────────────────────────────────────────────────────
// Module 2 & 3: Smile Gallery Case Management & HIPAA-Compliant Mongoose Schema
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose';
import crypto from 'crypto';

export const GALLERY_CATEGORIES = [
  'Teeth Whitening',
  'Dental Implants',
  'Braces',
  'Veneers',
  'Smile Makeover',
  'Crowns & Bridges',
  'Invisalign & Aligners',
  'Composite Bonding',
  'Full Mouth Rehabilitation',
  'Periodontics & Gum Contouring',
];

const ImageVariantSchema = new mongoose.Schema(
  {
    thumbnail: { type: String, required: true },
    display:   { type: String, required: true },
    full:      { type: String, required: true },
    alt:       { type: String, default: 'Clinical dental treatment case photo' },
    dimensions: {
      width:  { type: Number },
      height: { type: Number },
    },
  },
  { _id: false }
);

const PatientConsentSchema = new mongoose.Schema(
  {
    hasConsent: {
      type: Boolean,
      required: [true, 'Patient photography consent status is required'],
      default: false,
    },
    consentDate: {
      type: Date,
    },
    consentScope: {
      type: String,
      enum: ['Full Gallery & Social', 'Limited Smile Only', 'Anonymized Clinical Only'],
      default: 'Limited Smile Only',
    },
    // Cryptographic reference token to internal EHR consent form — NO patient names or MRNs
    anonymizedReference: {
      type: String,
      trim: true,
    },
    // Demographic info generalized to protect individual identity
    patientAgeGroup: {
      type: String,
      enum: ['Teen (13-19)', 'Young Adult (20-35)', 'Adult (36-50)', 'Mature Adult (51-65)', 'Senior (65+)', 'Unspecified'],
      default: 'Unspecified',
    },
    patientGender: {
      type: String,
      enum: ['Female', 'Male', 'Other', 'Undisclosed'],
      default: 'Undisclosed',
    },
  },
  { _id: false }
);

const TreatmentDetailsSchema = new mongoose.Schema(
  {
    duration: {
      type: String,
      trim: true,
      default: 'Completed in multiple visits',
    },
    teethNumbers: [{ type: String, trim: true }],
    procedures: [{ type: String, trim: true }],
    initialShade: { type: String, trim: true },
    finalShade: { type: String, trim: true },
  },
  { _id: false }
);

const ApprovalWorkflowSchema = new mongoose.Schema(
  {
    submittedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name:   { type: String, trim: true },
      role:   { type: String, trim: true },
      at:     { type: Date, default: Date.now },
    },
    reviewedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name:   { type: String, trim: true },
      role:   { type: String, trim: true },
      at:     { type: Date },
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const SmileGalleryCaseSchema = new mongoose.Schema(
  {
    // Public anonymized case identifier (e.g. CASE-2026-F3A19)
    caseId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    category: {
      type: String,
      required: [true, 'Treatment category is required'],
      enum: {
        values: GALLERY_CATEGORIES,
        message: '{VALUE} is not a recognized dental gallery category',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Clinical case description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    // Doctor attribution
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    doctorSpecialty: {
      type: String,
      trim: true,
      default: 'Cosmetic Dentist',
    },
    // HIPAA & Consent Management
    patientConsent: {
      type: PatientConsentSchema,
      required: true,
    },
    // Clinical Photography (Before & After)
    images: {
      before: { type: ImageVariantSchema, required: true },
      after:  { type: ImageVariantSchema, required: true },
    },
    treatmentDetails: {
      type: TreatmentDetailsSchema,
      default: () => ({}),
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Workflow status: Assistant uploads as 'draft' or 'pending_approval' -> Lead Doctor approves
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected'],
      default: 'pending_approval',
      index: true,
    },
    approvalWorkflow: {
      type: ApprovalWorkflowSchema,
      default: () => ({}),
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Compound & Text Indexes for optimal query performance ────────────────────
SmileGalleryCaseSchema.index({ status: 1, category: 1, createdAt: -1 });
SmileGalleryCaseSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
SmileGalleryCaseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

// ── Pre-save Hook: Generate anonymized caseId & validate consent before approval ──
SmileGalleryCaseSchema.pre('save', function (next) {
  if (!this.caseId) {
    const year = new Date().getFullYear();
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.caseId = `CASE-${year}-${token}`;
  }

  // HIPAA guard: Cannot approve without verified patient consent
  if (this.status === 'approved' && !this.patientConsent?.hasConsent) {
    return next(
      new Error('HIPAA Violation: Case cannot be approved for public gallery without verified patient consent.')
    );
  }

  next();
});

const SmileGalleryCase = mongoose.model('SmileGalleryCase', SmileGalleryCaseSchema);
export default SmileGalleryCase;
