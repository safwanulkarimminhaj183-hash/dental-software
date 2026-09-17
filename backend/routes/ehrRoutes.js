// backend/routes/ehrRoutes.js
import express from 'express';
import {
  getPatientRecords,
  upsertPatientRecords,
  addTreatmentLog,
  getAllPatients,
} from '../controllers/ehrController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize, ownerOrAdmin } from '../middlewares/roleMiddleware.js';
import { auditLogger } from '../middlewares/auditLogger.js';

const router = express.Router();

// All EHR routes require authentication
router.use(protect);

// ── Patient record access ─────────────────────────────────────────────────────

/**
 * GET /api/patients
 * Paginated list of all patients. Admin/staff only.
 * Query: search, page, limit
 */
router.get(
  '/',
  authorize('admin', 'staff'),
  auditLogger('LIST_ALL_PATIENTS'),
  getAllPatients
);

/**
 * GET /api/patients/:id/records
 * Full EHR record (demographics + medical history) for one patient.
 * Patient can access own records; admin/staff can access any.
 * Audit-logged for HIPAA compliance.
 */
router.get(
  '/:id/records',
  ownerOrAdmin,
  auditLogger('READ_EHR'),
  getPatientRecords
);

/**
 * POST /api/patients/records
 * Create or update a patient's EHR. Staff/admin only.
 * Body: { patientId, dentalHistory?, xrayUrls?, prescriptions?,
 *         treatmentLogs?, allergies?, bloodGroup?, notes? }
 * Sensitive fields (xrayUrls, prescriptions, dentalHistory) are encrypted
 * at the field level before persisting.
 */
router.post(
  '/records',
  authorize('admin', 'staff'),
  auditLogger('UPSERT_EHR'),
  upsertPatientRecords
);

/**
 * POST /api/patients/:id/records/treatment-log
 * Append a single treatment log entry. Staff/admin only.
 * Body: { procedure, date?, tooth?, performedBy?, description?, followUpDate? }
 */
router.post(
  '/:id/records/treatment-log',
  authorize('admin', 'staff'),
  auditLogger('ADD_TREATMENT_LOG'),
  addTreatmentLog
);

export default router;
