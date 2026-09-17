// backend/models/EHR.js
// EHR is a thin aggregation view model — it re-exports MedicalHistory
// and adds a convenience static method to fetch the full record bundle
// (patient demographics + full medical history) in one call.
// This keeps backward-compat with existing ehrController imports.
import mongoose from 'mongoose';
import fieldEncryption from 'mongoose-field-encryption';

const EHRSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
    },
    // ── Stored as encrypted JSON strings ─────────────────────────────────────
    dentalHistory: { type: String, default: '' },          // encrypted
    xrayUrlsEncrypted: { type: String, default: '[]' },    // encrypted JSON array of URL strings
    prescriptionsEncrypted: { type: String, default: '[]' }, // encrypted JSON array of {medication,...}
    // ── Plain treatment log entries ───────────────────────────────────────────
    treatmentLogs: [
      {
        date: { type: Date, default: Date.now },
        procedure: { type: String, required: true, trim: true },
        tooth: { type: String, trim: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        description: { type: String, trim: true },
        followUpDate: { type: Date },
      },
    ],
    allergies: [{ type: String, trim: true }],
    bloodGroup: { type: String },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Field-level encryption ────────────────────────────────────────────────────
EHRSchema.plugin(fieldEncryption, {
  fields: ['dentalHistory', 'xrayUrlsEncrypted', 'prescriptionsEncrypted'],
  secret: process.env.ENCRYPTION_KEY || 'CHANGE_THIS_32_CHAR_KEY_IN_PROD!!',
  saltGenerator: (secret) => secret.slice(0, 16),
});

// ── Virtuals: expose plain arrays to controllers ─────────────────────────────
EHRSchema.virtual('xrayUrls')
  .get(function () {
    try { return JSON.parse(this.xrayUrlsEncrypted || '[]'); } catch { return []; }
  })
  .set(function (arr) {
    this.xrayUrlsEncrypted = JSON.stringify(arr);
  });

EHRSchema.virtual('prescriptions')
  .get(function () {
    try { return JSON.parse(this.prescriptionsEncrypted || '[]'); } catch { return []; }
  })
  .set(function (arr) {
    this.prescriptionsEncrypted = JSON.stringify(arr);
  });

export default mongoose.model('EHR', EHRSchema);
