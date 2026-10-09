import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },

    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },

    // Target audience: 'all', 'guest', 'first_time', 'registered'
    targetUserType: {
      type: String,
      enum: ['all', 'guest', 'first_time', 'registered'],
      default: 'all',
    },

    // Applicable service IDs (empty array means applies to all services)
    applicableServiceIds: [{
      type: Number,
    }],

    minOrderAmount: {
      type: Number,
      default: 0,
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    usageLimit: {
      type: Number,
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;
