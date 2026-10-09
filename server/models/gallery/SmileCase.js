import mongoose from 'mongoose';

/**
 * Image Variant Sub-Schema
 * Stores optimized, watermarked WebP paths and metadata.
 * Stripped of all EXIF metadata and original patient identifiers (HIPAA compliant).
 */
const imageVariantSchema = new mongoose.Schema(
  {
    processedFilename: { type: String, required: true },
    processedUrl:      { type: String, required: true }, // Max 1200x900 watermarked WebP
    thumbnailFilename: { type: String, required: true },
    thumbnailUrl:      { type: String, required: true }, // 480x360 WebP
    originalFilename:  { type: String, select: false },   // Private file reference, never exposed in public API
    width:             { type: Number },
    height:            { type: Number },
    sizeBytes:         { type: Number },
    format:            { type: String, default: 'webp' },
    hasWatermark:      { type: Boolean, default: true },
  },
  { _id: false }
);

/**
 * SmileCase Schema
 * Handles treatment categorization, HIPAA-compliant metadata linking,
 * multi-tier approval workflow (Assistant -> Lead Doctor), and watermarked gallery assets.
 */
const smileCaseSchema = new mongoose.Schema(
  {
    // Unique Anonymized Clinical Case ID (e.g. SC-839210) - HIPAA compliant
    caseId: {
      type: String,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // ─── Treatment Categorization ──────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Treatment category is required'],
      enum: {
        values: [
          'Teeth Whitening',
          'Dental Implants',
          'Braces',
          'Veneers',
          'Crowns & Bridges',
          'Root Canal',
          'Smile Makeover',
          'Cosmetic Dentistry',
          'General',
        ],
        message: '{VALUE} is not a supported dental category',
      },
      index: true,
    },

    // ─── Metadata Linking (Non-PII Clinical Info) ─────────────────────────────
    doctorName: {
      type: String,
      required: [true, 'Attending doctor or specialist name is required'],
      trim: true,
    },

    specialistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      default: null,
    },

    // De-identified clinical demographics
    patientAge: {
      type: Number,
      min: [1, 'Age must be positive'],
      max: [120, 'Invalid age'],
    },

    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unspecified'],
      default: 'Unspecified',
    },

    treatmentDuration: {
      type: String,
      trim: true,
    },

    procedureDetails: {
      type: String,
      trim: true,
    },

    tags: [{
      type: String,
      trim: true,
    }],

    // ─── Image Assets (Before & After) ────────────────────────────────────────
    isBefore_After: {
      type: Boolean,
      default: true,
    },

    beforeImage: {
      type: imageVariantSchema,
      required: false,
    },

    afterImage: {
      type: imageVariantSchema,
      required: false,
    },

    // Single display image fallback (if not before/after pair)
    displayImage: {
      type: imageVariantSchema,
      required: false,
    },

    // ─── Content Management & Multi-Tier Approval Workflow ───────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archived', 'Pending', 'Approved', 'Rejected'],
      default: 'pending',
      index: true,
    },

    uploadedBy: {
      type: String,
      default: 'Staff',
    },

    uploadedByRole: {
      type: String,
      enum: ['assistant', 'receptionist', 'doctor', 'super_admin', 'Assistant', 'Doctor', 'Admin'],
      default: 'assistant',
    },

    approvedBy: {
      type: String,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },

    adminNotes: {
      type: String,
      trim: true,
      select: false,
    },

    // ─── Display & Engagement ────────────────────────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-generate unique HIPAA-safe Case ID if not present
smileCaseSchema.pre('save', function (next) {
  if (!this.caseId) {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    this.caseId = `SC-${randomSixDigits}`;
  }
  next();
});

// Composite index for fast public gallery queries
smileCaseSchema.index({ status: 1, category: 1, createdAt: -1 });
smileCaseSchema.index({ status: 1, isFeatured: 1 });

const SmileCase = mongoose.models.SmileCase || mongoose.model('SmileCase', smileCaseSchema);

export default SmileCase;