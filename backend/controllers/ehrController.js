// backend/controllers/ehrController.js
import asyncHandler from '../utils/asyncHandler.js';
import EHR from '../models/EHR.js';
import Patient from '../models/Patient.js';
import mongoose from 'mongoose';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Serialize arrays through the encrypted string fields so the plugin
 * encrypts them before saving.
 */
const applyEncryptedArrays = (doc, xrayUrls, prescriptions) => {
  if (Array.isArray(xrayUrls)) doc.xrayUrls = xrayUrls;       // triggers virtual setter
  if (Array.isArray(prescriptions)) doc.prescriptions = prescriptions;
};

/**
 * Build the safe response payload — expose virtual arrays, hide raw
 * encrypted strings.
 */
const buildEHRResponse = (ehr) => {
  const obj = ehr.toObject({ virtuals: true });
  delete obj.xrayUrlsEncrypted;
  delete obj.prescriptionsEncrypted;
  return obj;
};

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc   Retrieve full EHR record for a patient
 * @route  GET /api/patients/:id/records
 * @access Protected — patient (own records) or staff/admin
 */
export const getPatientRecords = asyncHandler(async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
  }

  const [patient, ehr] = await Promise.all([
    Patient.findById(patientId).select('-passwordHash').lean(),
    EHR.findOne({ patientId }),
  ]);

  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  res.json({
    success: true,
    patient,
    medicalHistory: ehr ? buildEHRResponse(ehr) : null,
  });
});

/**
 * @desc   Create or update a patient's EHR
 * @route  POST /api/patients/records
 * @access Protected (staff, admin)
 *
 * Body: { patientId, dentalHistory?, xrayUrls?, prescriptions?, treatmentLogs?,
 *         allergies?, bloodGroup?, notes? }
 */
export const upsertPatientRecords = asyncHandler(async (req, res) => {
  const {
    patientId,
    dentalHistory,
    xrayUrls,
    prescriptions,
    treatmentLogs,
    allergies,
    bloodGroup,
    notes,
  } = req.body;

  if (!patientId) {
    return res.status(400).json({ success: false, message: 'patientId is required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ success: false, message: 'Invalid patientId.' });
  }

  const patientExists = await Patient.exists({ _id: patientId });
  if (!patientExists) {
    return res.status(404).json({ success: false, message: 'Patient not found.' });
  }

  // Find or initialise the EHR document
  let ehr = await EHR.findOne({ patientId });
  const isNew = !ehr;

  if (!ehr) ehr = new EHR({ patientId });

  // Apply plain fields
  if (dentalHistory !== undefined) ehr.dentalHistory = dentalHistory;
  if (allergies !== undefined) ehr.allergies = allergies;
  if (bloodGroup !== undefined) ehr.bloodGroup = bloodGroup;
  if (notes !== undefined) ehr.notes = notes;
  if (treatmentLogs !== undefined) ehr.treatmentLogs = treatmentLogs;

  // Apply encrypted array fields via virtuals
  applyEncryptedArrays(ehr, xrayUrls, prescriptions);

  await ehr.save();

  res.status(isNew ? 201 : 200).json({
    success: true,
    message: isNew ? 'EHR record created.' : 'EHR record updated.',
    medicalHistory: buildEHRResponse(ehr),
  });
});

/**
 * @desc   Append a new treatment log entry to an existing EHR
 * @route  POST /api/patients/:id/records/treatment-log
 * @access Protected (staff, admin)
 */
export const addTreatmentLog = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  const { date, procedure, tooth, performedBy, description, followUpDate } = req.body;

  if (!procedure) {
    return res.status(400).json({ success: false, message: 'procedure is required.' });
  }

  let ehr = await EHR.findOne({ patientId });
  if (!ehr) {
    ehr = new EHR({ patientId });
  }

  ehr.treatmentLogs.push({ date, procedure, tooth, performedBy, description, followUpDate });
  await ehr.save();

  res.status(201).json({
    success: true,
    message: 'Treatment log added.',
    treatmentLogs: ehr.treatmentLogs,
  });
});

/**
 * @desc   Get all EHR patients list (admin dashboard)
 * @route  GET /api/patients
 * @access Protected (admin, staff)
 */
export const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Patient.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    patients,
  });
});
