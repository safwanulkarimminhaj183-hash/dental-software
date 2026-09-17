// backend/models/MedicalHistory.js
// Linked 1-to-1 with a Patient; holds the full dental/medical record.
// Sensitive arrays (xrayUrls, prescriptions) are encrypted at the field level
// using mongoose-field-encryption (AES-256-CBC under the hood).
import mongoose from 'mongoose';
import fieldEncryption from 'mongoose-field-encryption';

// ── Prescription entry ───────────────────────────────────────────────────────
const PrescriptionSchema = new mongoose.Schema(
  {
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    prescribedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

// ── Treatment log entry ──────────────────────────────────────────────────────
const TreatmentLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    procedure: { type: String, required: true, trim: true },
    tooth: { type: String, trim: true }, // e.g. "upper-left-molar"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    description: { type: String, trim: true },
    followUpDate: { type: Date },
  },
  { _id: true }
);

// ── Main Medical History schema ──────────────────────────────────────────────
const MedicalHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true, // one record per patient
    },
    // General dental history narrative (free text, stored encrypted)
    dentalHistory: {
      type: String,
      trim: true,
    },
    // Comma/JSON-serialised list of X-ray URLs — encrypted at rest
    xrayUrlsEncrypted: {
      type: String, // serialised JSON array, then encrypted
      default: '[]',
    },
    // Embedded prescription sub-documents — stored as encrypted JSON string
    prescriptionsEncrypted: {
      type: String, // serialised JSON array of PrescriptionSchema objects
      default: '[]',
    },
    // Treatment logs — plain text (less sensitive, but auditable)
    treatmentLogs: [TreatmentLogSchema],
    // Blood group, allergies (may already be on Patient, mirrored here for EHR completeness)
    bloodGroup: { type: String },
    allergies: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Field-level encryption ────────────────────────────────────────────────────
// Encrypts the two sensitive string fields before saving to MongoDB.
// The encryption key MUST be set in .env as ENCRYPTION_KEY (exactly 32 chars for AES-256).
MedicalHistorySchema.plugin(fieldEncryption, {
  fields: ['dentalHistory', 'xrayUrlsEncrypted', 'prescriptionsEncrypted'],
  secret: process.env.ENCRYPTION_KEY || 'CHANGE_THIS_32_CHAR_KEY_IN_PROD!!',
  // saltGenerator returns a deterministic 16-byte salt from the secret
  saltGenerator: (secret) => secret.slice(0, 16),
});

// ── Virtual helpers to work with plain arrays ────────────────────────────────
MedicalHistorySchema.virtual('xrayUrls')
  .get(function () {
    try { return JSON.parse(this.xrayUrlsEncrypted || '[]'); } catch { return []; }
  })
  .set(function (arr) {
    this.xrayUrlsEncrypted = JSON.stringify(arr);
  });

MedicalHistorySchema.virtual('prescriptions')
  .get(function () {
    try { return JSON.parse(this.prescriptionsEncrypted || '[]'); } catch { return []; }
  })
  .set(function (arr) {
    this.prescriptionsEncrypted = JSON.stringify(arr);
  });

export default mongoose.model('MedicalHistory', MedicalHistorySchema);
