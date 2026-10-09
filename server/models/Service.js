import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    // Unique human-readable or numeric ID (e.g., 105, 101, etc.)
    serviceId: {
      type: Number,
      required: [true, 'Service numeric ID is required'],
      unique: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Endodontics',
        'Cosmetic Dentistry',
        'Implantology',
        'Pediatric Dentistry',
        'Orthodontics',
        'Periodontics',
        'Oral Surgery',
        'General Dentistry',
      ],
      default: 'General Dentistry',
      index: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    fullDescription: {
      type: String,
      required: true,
      trim: true,
    },

    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },

    currency: {
      type: String,
      default: 'USD',
    },

    durationMinutes: {
      type: Number,
      default: 60,
    },

    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600&auto=format&fit=crop',
    },

    // Assigned specialist link
    assignedSpecialistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      default: null,
    },

    assignedDentistName: {
      type: String,
      default: 'DentoCare Senior Specialist',
    },

    assignedDentistRole: {
      type: String,
      default: 'Lead Dental Surgeon',
    },

    // Clinical Highlights and Treatment Steps
    procedureSteps: [{
      stepNumber: Number,
      title: String,
      description: String,
    }],

    highlights: [{
      type: String,
      trim: true,
    }],

    preparationTips: [{
      type: String,
      trim: true,
    }],

    // Service-specific promotional discount
    serviceDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    serviceDiscountReason: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    totalBookings: {
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted price
serviceSchema.virtual('formattedBasePrice').get(function () {
  return `$${this.basePrice}`;
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

export default Service;
