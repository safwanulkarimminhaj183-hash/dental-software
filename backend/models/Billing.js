// backend/models/Billing.js
// Lightweight payment transaction record (Invoice holds the full breakdown).
// Billing is created per payment attempt; Invoice holds the line-items & PDF.
import mongoose from 'mongoose';

const BillingSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    method: {
      type: String,
      enum: ['bkash', 'nagad', 'card', 'cash'],
      required: true,
    },
    transactionId: { type: String, trim: true },
    gatewayStatus: { type: String }, // raw status returned by gateway
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date },
    failureReason: { type: String, trim: true },
    // Raw response from payment gateway for audit
    rawGatewayResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

BillingSchema.index({ patientId: 1, createdAt: -1 });
BillingSchema.index({ invoiceId: 1 });
BillingSchema.index({ transactionId: 1 }, { sparse: true });

export default mongoose.model('Billing', BillingSchema);
