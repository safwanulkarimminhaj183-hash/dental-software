// backend/models/Invoice.js
import mongoose from 'mongoose';

// ── Line-item sub-schema ─────────────────────────────────────────────────────
const LineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    total: { type: Number }, // pre-computed: quantity * unitCost
  },
  { _id: false }
);

LineItemSchema.pre('validate', function () {
  this.total = this.quantity * this.unitCost;
});

// ── Invoice schema ───────────────────────────────────────────────────────────
const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      // generated in pre-save hook below (e.g. INV-20260915-00042)
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    items: [LineItemSchema],
    // Computed financial totals (set by controller before save)
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0.15 }, // 15% VAT
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    // Payment gateway details
    paymentMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'card', 'cash', 'pending'],
      default: 'pending',
    },
    transactionId: { type: String, trim: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed }, // raw gateway payload
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partially_paid', 'failed'],
      default: 'unpaid',
    },
    paidAt: { type: Date },
    // Optional: URL or filesystem path of the generated PDF receipt
    pdfUrl: { type: String },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Auto-generate invoice number ─────────────────────────────────────────────
InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ── Index for fast patient invoice lookup ────────────────────────────────────
InvoiceSchema.index({ patientId: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1 });

export default mongoose.model('Invoice', InvoiceSchema);
