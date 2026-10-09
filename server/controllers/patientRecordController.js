import mongoose from 'mongoose';
import PatientRecord from '../models/PatientRecord.js';

// Realistic sample seed data to populate initial records if database is empty
const INITIAL_DEMO_RECORDS = [
  {
    patientId: 'PAT-1042',
    patientName: 'Sarah Jenkins',
    patientEmail: 'sarah.jenkins@example.com',
    patientPhone: '+1 (512) 489-3291',
    dateOfBirth: new Date('1990-04-14'),
    gender: 'Female',
    bloodGroup: 'O+',
    emergencyContact: 'Mark Jenkins (Husband) - 512-489-3290',
    medicalHistory: {
      allergies: ['Penicillin', 'Latex'],
      conditions: ['Mild Asthma', 'Seasonal Rhinitis'],
      currentMedications: ['Albuterol Inhaler (PRN)', 'Cetirizine 10mg'],
      bloodPressure: '118/76 mmHg',
      heartRate: '70 bpm',
      bloodSugar: '92 mg/dL (Fasting)',
      notes: 'Patient experiences dental anxiety. Premedication with nitrous oxide is recommended for extensive restorations.',
    },
    prescriptions: [
      {
        medicineName: 'Amoxicillin / Clavulanate (Augmentin)',
        dosage: '875mg / 125mg',
        frequency: 'Twice daily (q12h) with food',
        duration: '7 days',
        prescribedDate: new Date('2026-08-15'),
        instructions: 'Take with a large glass of water. Complete the entire course even if symptoms subside.',
      },
      {
        medicineName: 'Ibuprofen',
        dosage: '600mg',
        frequency: 'Every 6-8 hours as needed',
        duration: '4 days',
        prescribedDate: new Date('2026-08-15'),
        instructions: 'Take with food or milk to prevent gastric distress. Max 2400mg daily.',
      },
      {
        medicineName: 'Chlorhexidine Gluconate 0.12% Oral Rinse',
        dosage: '15 mL rinse',
        frequency: 'Twice daily after brushing',
        duration: '14 days',
        prescribedDate: new Date('2026-08-10'),
        instructions: 'Swish vigorously for 30 seconds then spit. Do not eat or drink for 30 minutes post rinse.',
      },
    ],
    xrayImages: [
      {
        title: 'Full Mouth Panoramic Radiograph (OPG)',
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
        modality: 'OPG Panoramic',
        date: new Date('2026-08-01'),
        radiologistNotes: 'Normal mandibular and maxillary anatomy. Periapical radiolucency observed around root apex of tooth #19. Bilateral impacted third molars.',
      },
      {
        title: 'Periapical View - Tooth #19 Mandibular First Molar',
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80',
        modality: 'Periapical',
        date: new Date('2026-08-15'),
        radiologistNotes: 'Deep occlusal decay encroaching upon the coronal pulp chamber. Furcation area appears intact.',
      },
      {
        title: 'Bite-wing Right Premolar / Molar Projection',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
        modality: 'Bitewing',
        date: new Date('2026-07-12'),
        radiologistNotes: 'Interproximal bone levels normal with crestal cortical integrity preserved. No secondary caries around existing amalgam fillings.',
      },
    ],
    pastTreatments: [
      {
        treatmentDate: new Date('2026-08-15'),
        procedure: 'Endodontic Therapy (Root Canal Treatment - Phase 1)',
        toothNumber: '#19 Lower Left First Molar',
        doctorName: 'Dr. Sarah Johnson',
        status: 'Completed',
        cost: 950,
        notes: 'Access cavity prepared. 3 canals negotiated (MB, ML, D) and shaped to Protaper Gold F2. Calcium hydroxide medicament placed and sealed with Cavit.',
      },
      {
        treatmentDate: new Date('2026-07-20'),
        procedure: 'Ultrasonic Scaling and Root Planing',
        toothNumber: 'Full Mouth (4 Quadrants)',
        doctorName: 'Dr. Michael Chen',
        status: 'Completed',
        cost: 320,
        notes: 'Moderate subgingival calculus removed. Gingival tissues responded with mild bleeding on probing. Good oral hygiene instructions reinforced.',
      },
      {
        treatmentDate: new Date('2026-09-12'),
        procedure: 'Permanent Zirconia Crown Placement',
        toothNumber: '#19 Lower Left First Molar',
        doctorName: 'Dr. Sarah Johnson',
        status: 'Scheduled',
        cost: 800,
        notes: 'Scheduled for post-endodontic final core buildup and monolithic zirconia crown cementation.',
      },
    ],
  },
  {
    patientId: 'PAT-1088',
    patientName: 'David Rodriguez',
    patientEmail: 'david.r@example.com',
    patientPhone: '+1 (512) 651-9043',
    dateOfBirth: new Date('1984-11-22'),
    gender: 'Male',
    bloodGroup: 'A+',
    emergencyContact: 'Elena Rodriguez (Wife) - 512-651-9044',
    medicalHistory: {
      allergies: ['Sulfa Drugs'],
      conditions: ['Hypertension (Stage 1 - controlled)'],
      currentMedications: ['Lisinopril 10mg daily'],
      bloodPressure: '128/82 mmHg',
      heartRate: '74 bpm',
      bloodSugar: '105 mg/dL',
      notes: 'No contraindications for local epinephrine anesthetic (2% Lidocaine with 1:100k epi max 2 carpules).',
    },
    prescriptions: [
      {
        medicineName: 'Ketorolac Tromethamine',
        dosage: '10mg',
        frequency: 'Every 6 hours PRN pain',
        duration: '3 days',
        prescribedDate: new Date('2026-08-28'),
        instructions: 'Do not exceed 5 days total treatment.',
      },
    ],
    xrayImages: [
      {
        title: '3D CBCT Implant Assessment Scan',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80',
        modality: 'CBCT 3D',
        date: new Date('2026-08-20'),
        radiologistNotes: 'Adequate vertical bone height (13.4mm) and crestal width (7.1mm) at site #30. Inferior alveolar canal safely positioned 4.2mm below planned fixture.',
      },
    ],
    pastTreatments: [
      {
        treatmentDate: new Date('2026-08-28'),
        procedure: 'Titanium Dental Implant Placement (Fixture #30)',
        toothNumber: '#30 Lower Right Molar',
        doctorName: 'Dr. Emily Watson',
        status: 'Completed',
        cost: 1850,
        notes: 'Straumann SLA 4.1x10mm implant fixture placed with 35 Ncm torque. Healing abutment torqued to 15 Ncm. 4-0 Vicryl sutures placed.',
      },
      {
        treatmentDate: new Date('2026-05-14'),
        procedure: 'Direct Composite Restoration',
        toothNumber: '#14 Upper Left First Molar',
        doctorName: 'Dr. Sarah Johnson',
        status: 'Completed',
        cost: 240,
        notes: 'Class II MO composite restoration using Filtek Supreme A2. Perfect contact point established.',
      },
    ],
  },
  {
    patientId: 'PAT-1105',
    patientName: 'Jessica Miller',
    patientEmail: 'jess.miller@example.com',
    patientPhone: '+1 (512) 773-1182',
    dateOfBirth: new Date('1997-02-18'),
    gender: 'Female',
    bloodGroup: 'B+',
    emergencyContact: 'Robert Miller (Father) - 512-773-1180',
    medicalHistory: {
      allergies: ['None known'],
      conditions: ['None'],
      currentMedications: ['Multivitamins'],
      bloodPressure: '112/70 mmHg',
      heartRate: '68 bpm',
      bloodSugar: '88 mg/dL',
      notes: 'Interested in cosmetic smile makeover and orthodontic aligners.',
    },
    prescriptions: [
      {
        medicineName: 'Opalescence 15% Carbamide Peroxide Bleaching Gel',
        dosage: '1 syringe application',
        frequency: 'Nightly wear for 4 hours',
        duration: '10 days',
        prescribedDate: new Date('2026-09-02'),
        instructions: 'Wipe excess gel from gingiva with cotton roll. Discontinue if extreme sensitivity occurs.',
      },
    ],
    xrayImages: [
      {
        title: 'Lateral Cephalometric Radiograph',
        imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
        modality: 'Cephalometric',
        date: new Date('2026-09-01'),
        radiologistNotes: 'Class I skeletal base. Mild maxillary anterior crowding and 2mm overjet.',
      },
    ],
    pastTreatments: [
      {
        treatmentDate: new Date('2026-09-02'),
        procedure: 'In-Office Zoom Laser Teeth Whitening',
        toothNumber: 'Full Anterior (Upper & Lower 6-6)',
        doctorName: 'Dr. Sarah Johnson',
        status: 'Completed',
        cost: 450,
        notes: 'Three 15-minute cycles with 25% hydrogen peroxide gel. Shade improved from Vita A3 to B1. Neutral fluoride gel applied.',
      },
    ],
  },
];

// Helper to seed initial sample records if none exist
const seedInitialRecordsIfEmpty = async () => {
  try {
    const count = await PatientRecord.countDocuments();
    if (count === 0) {
      await PatientRecord.insertMany(INITIAL_DEMO_RECORDS);
      console.log('Seeded initial patient records for EMR/EHR.');
    }
  } catch (error) {
    console.warn('Could not auto-seed patient records:', error.message);
  }
};

// @desc    Get all patient records (with optional search filter)
// @route   GET /api/v1/patient-records
// @access  Public / Staff / Protected
export const getAllPatientRecords = async (req, res) => {
  try {
    await seedInitialRecordsIfEmpty();

    const { search, bloodGroup, gender } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const term = search.trim();
      query.$or = [
        { patientName: { $regex: term, $options: 'i' } },
        { patientId: { $regex: term, $options: 'i' } },
        { patientPhone: { $regex: term, $options: 'i' } },
        { patientEmail: { $regex: term, $options: 'i' } },
      ];
    }

    if (bloodGroup && bloodGroup !== 'all') {
      query.bloodGroup = bloodGroup;
    }

    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    const records = await PatientRecord.find(query).sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching patient records',
    });
  }
};

// @desc    Get single patient record by MongoDB _id or patientId (e.g. PAT-1042)
// @route   GET /api/v1/patient-records/:id
// @access  Public / Staff / Protected
export const getPatientRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    let record = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      record = await PatientRecord.findById(id);
    }

    if (!record) {
      record = await PatientRecord.findOne({ patientId: id.toUpperCase() });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Patient record with identifier '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching patient record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching patient record',
    });
  }
};

// @desc    Create a new patient record
// @route   POST /api/v1/patient-records
// @access  Public / Staff / Protected
export const createPatientRecord = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      name,
      patientEmail,
      email,
      patientPhone,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      medicalHistory,
      prescriptions,
      xrayImages,
      pastTreatments,
      treatmentHistory,
    } = req.body;

    const resolvedName = (patientName || name || '').trim();
    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: 'Patient name is required.',
      });
    }

    // Auto-generate clean unique patientId if not explicitly provided
    let resolvedPatientId = (patientId || '').trim().toUpperCase();
    if (!resolvedPatientId) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      resolvedPatientId = `PAT-${randomSuffix}`;
      // Ensure uniqueness
      const existing = await PatientRecord.findOne({ patientId: resolvedPatientId });
      if (existing) {
        resolvedPatientId = `PAT-${Date.now().toString().slice(-4)}`;
      }
    } else {
      const existing = await PatientRecord.findOne({ patientId: resolvedPatientId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Patient ID '${resolvedPatientId}' already exists. Please choose a unique ID.`,
        });
      }
    }

    // Process medical history
    const resolvedMedicalHistory = {
      allergies: Array.isArray(medicalHistory?.allergies) ? medicalHistory.allergies : [],
      conditions: Array.isArray(medicalHistory?.conditions) ? medicalHistory.conditions : [],
      currentMedications: Array.isArray(medicalHistory?.currentMedications) ? medicalHistory.currentMedications : [],
      bloodPressure: medicalHistory?.bloodPressure || '120/80 mmHg',
      heartRate: medicalHistory?.heartRate || '72 bpm',
      bloodSugar: medicalHistory?.bloodSugar || 'Normal',
      notes: medicalHistory?.notes || '',
    };

    const newRecord = await PatientRecord.create({
      patientId: resolvedPatientId,
      patientName: resolvedName,
      patientEmail: (patientEmail || email || '').trim(),
      patientPhone: (patientPhone || phone || '').trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || 'Unspecified',
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: (emergencyContact || '').trim(),
      medicalHistory: resolvedMedicalHistory,
      prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
      xrayImages: Array.isArray(xrayImages) ? xrayImages : [],
      pastTreatments: Array.isArray(pastTreatments || treatmentHistory) ? (pastTreatments || treatmentHistory) : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Patient record created successfully.',
      data: newRecord,
    });
  } catch (error) {
    console.error('Error creating patient record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating patient record',
    });
  }
};

// @desc    Update an entire patient record or specific fields
// @route   PUT /api/v1/patient-records/:id
// @access  Public / Staff / Protected
export const updatePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    let filter = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter = { _id: id };
    } else {
      filter = { patientId: id.toUpperCase() };
    }

    const updates = { ...req.body };

    // Support alias treatmentHistory -> pastTreatments
    if (updates.treatmentHistory && !updates.pastTreatments) {
      updates.pastTreatments = updates.treatmentHistory;
    }

    // Do not allow overwriting _id
    delete updates._id;

    const updatedRecord = await PatientRecord.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: `Patient record with identifier '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient record updated successfully.',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating patient record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating patient record',
    });
  }
};

// @desc    Delete a patient record
// @route   DELETE /api/v1/patient-records/:id
// @access  Public / Staff / Protected
export const deletePatientRecord = async (req, res) => {
  try {
    const { id } = req.params;

    let filter = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter = { _id: id };
    } else {
      filter = { patientId: id.toUpperCase() };
    }

    const deleted = await PatientRecord.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Patient record with identifier '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Patient record for '${deleted.patientName}' (${deleted.patientId}) deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting patient record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting patient record',
    });
  }
};

// @desc    Append a prescription to a patient record
// @route   POST /api/v1/patient-records/:id/prescriptions
export const addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicineName, dosage, frequency, duration, instructions } = req.body;

    if (!medicineName || !medicineName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required.',
      });
    }

    let filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { patientId: id.toUpperCase() };

    const record = await PatientRecord.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const newPrescription = {
      medicineName: medicineName.trim(),
      dosage: (dosage || '').trim(),
      frequency: (frequency || 'Once daily').trim(),
      duration: (duration || '5 days').trim(),
      prescribedDate: new Date(),
      instructions: (instructions || '').trim(),
    };

    record.prescriptions.unshift(newPrescription);
    await record.save();

    return res.status(201).json({
      success: true,
      message: 'Prescription added successfully.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Append an X-ray report and image to a patient record
// @route   POST /api/v1/patient-records/:id/xrays
export const addXrayImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, modality, radiologistNotes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'X-ray title is required.',
      });
    }

    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'X-ray image URL or file data is required.',
      });
    }

    let filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { patientId: id.toUpperCase() };

    const record = await PatientRecord.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const newXray = {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      modality: modality || 'Periapical',
      date: new Date(),
      radiologistNotes: (radiologistNotes || '').trim(),
    };

    record.xrayImages.unshift(newXray);
    await record.save();

    return res.status(201).json({
      success: true,
      message: 'X-ray report saved successfully.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Append a past dental treatment procedure to a patient record
// @route   POST /api/v1/patient-records/:id/treatments
export const addPastTreatment = async (req, res) => {
  try {
    const { id } = req.params;
    const { procedure, toothNumber, doctorName, status, cost, notes, treatmentDate } = req.body;

    if (!procedure || !procedure.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Procedure name is required.',
      });
    }

    let filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { patientId: id.toUpperCase() };

    const record = await PatientRecord.findOne(filter);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const newTreatment = {
      treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date(),
      procedure: procedure.trim(),
      toothNumber: (toothNumber || 'All / General').trim(),
      doctorName: (doctorName || 'Dr. Sarah Johnson').trim(),
      status: status || 'Completed',
      cost: Number(cost) || 0,
      notes: (notes || '').trim(),
    };

    record.pastTreatments.unshift(newTreatment);
    await record.save();

    return res.status(201).json({
      success: true,
      message: 'Treatment record added successfully.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllPatientRecords,
  getPatientRecordById,
  createPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
  addPrescription,
  addXrayImage,
  addPastTreatment,
};
