import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  stepNo: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  estimatedDuration: { type: String, default: '1 Visit' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
}, { _id: true });

const treatmentPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Treatment plan title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Orthodontics', 'Implants', 'Cleaning', 'Root Canal', 'Cosmetic', 'Pediatric', 'General', 'Periodontics', 'Prosthodontics'],
      default: 'General',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    targetAgeMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetAgeMax: {
      type: Number,
      default: 100,
      max: 120,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: function() { return this.price; }
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    insuranceCovered: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: String,
      default: '1-3 months',
      trim: true,
    },
    treatmentSteps: {
      type: [stepSchema],
      default: [],
    },
    suitableForConditions: {
      type: [String],
      default: [],
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

treatmentPlanSchema.virtual('netPayable').get(function () {
  const discountAmount = (this.price * (this.discountPercentage || 0)) / 100;
  return Math.max(0, (this.price + (this.tax || 0)) - discountAmount - (this.insuranceCovered || 0));
});

treatmentPlanSchema.index({ category: 1, price: 1, targetAgeMin: 1, targetAgeMax: 1 });
treatmentPlanSchema.index({ clicks: -1, bookingsCount: -1 });

const TreatmentPlan = mongoose.model('TreatmentPlan', treatmentPlanSchema);
export default TreatmentPlan;
