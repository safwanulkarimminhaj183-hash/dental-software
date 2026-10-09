import express from 'express';
import {
  getAllPatientRecords,
  getPatientRecordById,
  createPatientRecord,
  updatePatientRecord,
  deletePatientRecord,
  addPrescription,
  addXrayImage,
  addPastTreatment,
} from '../controllers/patientRecordController.js';

const router = express.Router();

// Primary CRUD routes
router.get('/', getAllPatientRecords);
router.post('/', createPatientRecord);

router.get('/:id', getPatientRecordById);
router.put('/:id', updatePatientRecord);
router.delete('/:id', deletePatientRecord);

// Direct sub-document endpoints
router.post('/:id/prescriptions', addPrescription);
router.post('/:id/xrays', addXrayImage);
router.post('/:id/treatments', addPastTreatment);

export default router;
