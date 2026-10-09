import mongoose from 'mongoose';

// Chamber/clinic location sub-schema
const chamberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    schedule: { type: String, default: '', trim: true }, // e.g. "Mon–Wed: 9AM–1PM"
  },
  { _id: true, timestamps: false }
);

// Education/degree sub-schema
const degreeSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true, trim: true },   // e.g. "BDS", "MDS"
    institution: { type: String, default: '', trim: true },
    passingYear: { type: Number, default: null },
  },
  { _id: true, timestamps: false }
);

// Telemedicine consultation slot sub-schema (embedded in specialist)
const consultationSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, trim: true }, // "09:00 AM"
    endTime: { type: String, trim: true },   // "11:00 AM"
  },
  { _id: false }
);

const specialistSchema = new mongoose.Schema(
  {
    // ─── Identity ───────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Specialist name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    },

    // ─── Professional Details ────────────────────────────────────────────────────
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    degrees: {
      type: [degreeSchema],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalPatients: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Expertise / Procedures handled ─────────────────────────────────────────
    expertise: {
      type: [String],
      default: [],
    },

    // ─── Chamber / Clinic Locations ──────────────────────────────────────────────
    chambers: {
      type: [chamberSchema],
      default: [],
    },

    // ─── Availability / Schedule ─────────────────────────────────────────────────
    availableDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slotDuration: {
      type: Number,
      default: 15,
      enum: [15, 20, 30, 45, 60],
    },
    workStartTime: {
      type: String,
      default: '16:00',
    },
    workEndTime: {
      type: String,
      default: '20:00',
    },
    blockedDates: {
      type: [String],
      default: [],
    },
    isChamberBlockedToday: {
      type: Boolean,
      default: false,
    },
    consultationFee: {
      type: Number,
      default: 50,
      min: 0,
    },

    // ─── Telemedicine ─────────────────────────────────────────────────────────────
    telemedicineAvailable: {
      type: Boolean,
      default: false,
    },
    telemedicineSlots: {
      type: [consultationSlotSchema],
      default: [],
    },
    telemedicineLink: {
      type: String,
      default: '',
    },

    // ─── Social Links ─────────────────────────────────────────────────────────────
    social: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },

    // ─── CMS Status ──────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from name before saving
specialistSchema.pre('save', function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});

// Indexes (slug-এর ডুপ্লিকেট ইনডেক্স এখানে রিমুভ করা হয়েছে)
specialistSchema.index({ specialization: 1, isActive: 1 });
specialistSchema.index({ displayOrder: 1 });

const Specialist = mongoose.model('Specialist', specialistSchema);
export default Specialist;