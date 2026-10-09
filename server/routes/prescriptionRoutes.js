import express from 'express';
import {
  generatePrescription,
  downloadPrescriptionPDF,
  getPrescriptionsByDentist,
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/', generatePrescription);
router.post('/generate', generatePrescription);
router.get('/:id/pdf', downloadPrescriptionPDF);
router.get('/dentist/:dentistId', getPrescriptionsByDentist);

export default router;
