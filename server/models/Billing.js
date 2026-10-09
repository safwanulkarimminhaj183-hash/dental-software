import mongoose from 'mongoose';

// Individual line item (procedure + fee)
const billingItemSchema = new mongoose.Schema(
  {
    procedure: {
      type: String,
      required: [true, 'Procedure name is required'],
      trim: true,
    },
    toothNumber: {
      type: String,
      default: 'General',
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true, timestamps: false }
);

// Virtual: line total after discount
billingItemSchema.virtual('lineTotal').get(function () {
  const gross = this.unitPrice * this.quantity;
  return gross - (gross * this.discount) / 100;
});

const billingSchema = new mongoose.Schema(
  {
    // ─── Invoice Identity ────────────────────────────────────────────────────────
    invoiceNumber: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ─── Patient Reference ───────────────────────────────────────────────────────
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientId: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
    },
    patientEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    patientPhone: {
      type: String,
      default: '',
      trim: true,
    },

    // ─── Specialist / Doctor Reference ──────────────────────────────────────────
    specialistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialist',
      default: null,
    },
    specialistName: {
      type: String,
      default: 'General Dentist',
      trim: true,
    },

    // ─── Appointment Reference (optional) ───────────────────────────────────────
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },

    // ─── Line Items / Procedures ─────────────────────────────────────────────────
    items: {
      type: [billingItemSchema],
      default: [],
    },

    // ─── Totals ───────────────────────────────────────────────────────────────────
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0, // percentage e.g. 5 means 5%
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Payment ─────────────────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded', 'waived'],
      default: 'unpaid',
      lowercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'insurance', 'online', 'other'],
      default: 'cash',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    insuranceCoverage: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Invoice Date ─────────────────────────────────────────────────────────────
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate invoice number before first save
// Uses timestamp + random suffix — no DB query needed, avoids buffering timeout
billingSchema.pre('save', function () {
  if (!this.invoiceNumber) {
    const year = new Date().getFullYear();
    const ts = Date.now().toString().slice(-5);
    const rand = Math.floor(10 + Math.random() * 90);
    this.invoiceNumber = `INV-${year}-${ts}${rand}`;
  }

  // Recompute totals from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const gross = item.unitPrice * item.quantity;
      return sum + (gross - (gross * item.discount) / 100);
    }, 0);
  }
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount - (this.insuranceCoverage || 0);
  this.dueAmount = Math.max(0, this.totalAmount - (this.paidAmount || 0));

  if (this.dueAmount <= 0 && this.totalAmount > 0) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0 && this.dueAmount > 0) {
    this.paymentStatus = 'partial';
  }
});

// Indexes (invoiceNumber এর ডুপ্লিকেট ইনডেক্স রিমুভ করা হয়েছে)
billingSchema.index({ patientId: 1, paymentStatus: 1 });
billingSchema.index({ specialistId: 1, invoiceDate: -1 });

const Billing = mongoose.model('Billing', billingSchema);
export default Billing;