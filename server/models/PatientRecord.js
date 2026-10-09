import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      default: '',
      trim: true,
    },
    frequency: {
      type: String,
      default: 'Once daily',
      trim: true,
    },
    duration: {
      type: String,
      default: '5 days',
      trim: true,
    },
    prescribedDate: {
      type: Date,
      default: Date.now,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true, timestamps: false }
);

const xrayImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'X-ray report title is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'X-ray image URL or data is required'],
    },
    modality: {
      type: String,
      enum: ['OPG Panoramic', 'Bitewing', 'Periapical', 'CBCT 3D', 'Cephalometric', 'Dental Photo', 'Other'],
      default: 'Periapical',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    radiologistNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true, timestamps: false }
);

const pastTreatmentSchema = new mongoose.Schema(
  {
    treatmentDate: {
      type: Date,
      default: Date.now,
    },
    procedure: {
      type: String,
      required: [true, 'Treatment procedure is required'],
      trim: true,
    },
    toothNumber: {
      type: String,
      default: 'All / General',
      trim: true,
    },
    doctorName: {
      type: String,
      default: 'Dr. Sarah Johnson',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'In Progress', 'Scheduled'],
      default: 'Completed',
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true, timestamps: false }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    allergies: {
      type: [String],
      default: [],
    },
    conditions: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    bloodPressure: {
      type: String,
      default: '120/80 mmHg',
      trim: true,
    },
    heartRate: {
      type: String,
      default: '72 bpm',
      trim: true,
    },
    bloodSugar: {
      type: String,
      default: 'Normal',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const patientRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    patientPhone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unspecified'],
      default: 'Unspecified',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
    medicalHistory: {
      type: medicalHistorySchema,
      default: () => ({}),
    },
    prescriptions: {
      type: [prescriptionSchema],
      default: [],
    },
    xrayImages: {
      type: [xrayImageSchema],
      default: [],
    },
    pastTreatments: {
      type: [pastTreatmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias: treatmentHistory <-> pastTreatments
patientRecordSchema.virtual('treatmentHistory').get(function () {
  return this.pastTreatments;
});

patientRecordSchema.virtual('treatmentHistory').set(function (val) {
  this.pastTreatments = val;
});

// Index search fields
patientRecordSchema.index({ patientId: 1, patientName: 1, patientPhone: 1 });

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);
export default PatientRecord;
