import mongoose from 'mongoose';

const serviceAnalyticsSchema = new mongoose.Schema(
  {
    serviceId: {
      type: Number,
      required: true,
      index: true,
    },

    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: '',
    },

    userType: {
      type: String,
      enum: ['authenticated', 'guest'],
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    userEmail: {
      type: String,
      default: null,
    },

    guestSessionId: {
      type: String,
      default: null,
      index: true,
    },

    ipAddress: {
      type: String,
      default: 'Unknown',
    },

    userAgent: {
      type: String,
      default: '',
    },

    referrer: {
      type: String,
      default: '',
    },

    appliedDiscount: {
      type: Object,
      default: null,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for marketing retargeting queries
serviceAnalyticsSchema.index({ serviceId: 1, timestamp: -1 });
serviceAnalyticsSchema.index({ guestSessionId: 1, serviceId: 1 });

const ServiceAnalytics =
  mongoose.models.ServiceAnalytics ||
  mongoose.model('ServiceAnalytics', serviceAnalyticsSchema);

export default ServiceAnalytics;
