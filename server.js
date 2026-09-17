// server.js — Main entry point for the Smile Care Dental Clinic backend.
//
// ─────────────────────────────────────────────────────────────────────────────
// Module map (all under backend/):
//
//  config/db.js              — Mongoose connection
//  middlewares/
//    sanitizeMiddleware.js   — helmet, cors, mongoSanitize, xss-clean
//    rateLimiter.js          — global + per-route rate limiters
//    authMiddleware.js       — JWT protect / optionalAuth / generateToken
//    roleMiddleware.js       — authorize(roles) / ownerOrAdmin
//    auditLogger.js          — HIPAA audit logging per sensitive route
//    errorHandler.js         — notFound + central error handler
//  models/                   — All Mongoose schemas
//  controllers/              — Business logic (one file per module)
//  routes/
//    authRoutes.js           — /api/auth
//    appointmentRoutes.js    — /api/appointments
//    ehrRoutes.js            — /api/patients
//    billingRoutes.js        — /api/payments + /api/invoices
//    supportRoutes.js        — /api/support  ← "About Us → Patient Help"
//  services/
//    paymentService.js       — bKash / Nagad / Stripe adapters
//    faqService.js           — FAQ keyword-match engine (auto-reply)
//    notificationService.js  — Nodemailer email + Twilio SMS adapters
//    reminderService.js      — Cron jobs: 24h email + 2h SMS reminders
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import morgan from 'morgan';

import { connectDB, disconnectDB } from './backend/config/db.js';
import { securityMiddlewares } from './backend/middlewares/sanitizeMiddleware.js';
import { globalLimiter } from './backend/middlewares/rateLimiter.js';
import { notFound, errorHandler } from './backend/middlewares/errorHandler.js';
import { startReminderService } from './backend/services/reminderService.js';
import { getAllFAQs } from './backend/services/faqService.js';

// ── Route modules ─────────────────────────────────────────────────────────────
import authRoutes from './backend/routes/authRoutes.js';
import appointmentRoutes from './backend/routes/appointmentRoutes.js';
import ehrRoutes from './backend/routes/ehrRoutes.js';
import billingRoutes from './backend/routes/billingRoutes.js';
import supportRoutes from './backend/routes/supportRoutes.js';
import galleryRoutes from './backend/routes/galleryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// App + HTTP server
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

// ─────────────────────────────────────────────────────────────────────────────
// Socket.io — real-time live chat for admin dashboard and Patient Help tickets
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible inside controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Admin staff join the admin room to receive all ticket notifications
  socket.on('join:admin', () => {
    socket.join('admin-room');
    console.log(`[Socket.io] Socket ${socket.id} joined admin-room`);
  });

  // Patients/guests join a room keyed to their ticket id so they receive replies
  socket.on('join:ticket', (ticketId) => {
    if (ticketId) {
      socket.join(`ticket:${ticketId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined ticket:${ticketId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Global middleware stack
// ─────────────────────────────────────────────────────────────────────────────

// Security: helmet + cors + mongoSanitize + xss-clean (must come first)
app.use(...securityMiddlewares);

// HTTP request logger — 'combined' in prod, 'dev' locally
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter — 200 req / 15 min per IP
app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// Health-check endpoint (no auth, no rate-limit — used by load balancers)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

// Module 0 — Authentication
// POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
app.use('/api/auth', authRoutes);

// Module 1 — Appointment Booking Management
// POST /api/appointments/book
// GET  /api/appointments/available-slots?doctorId=&date=
// GET  /api/appointments/my
// PATCH /api/appointments/:id/cancel
// GET  /api/appointments/all  (admin)
app.use('/api/appointments', appointmentRoutes);

// Module 2 — Electronic Health Records (EHR)
// GET  /api/patients                          (admin)
// GET  /api/patients/:id/records
// POST /api/patients/records
// POST /api/patients/:id/records/treatment-log
app.use('/api/patients', ehrRoutes);

// Module 3 — Billing & Payments
// POST /api/payments/initiate
// GET  /api/invoices
// GET  /api/invoices/my
// GET  /api/invoices/:id
// GET  /api/invoices/:id/download
app.use('/api', billingRoutes);

// Module 4 — Live Chat / Patient Help (About Us → Patient Help)
// POST /api/support/submit              ← primary Patient Help form endpoint
// GET  /api/support/my-tickets
// GET  /api/support/tickets             (admin)
// GET  /api/support/tickets/:id
// POST /api/support/tickets/:id/reply
// PATCH /api/support/tickets/:id/status (admin)
app.use('/api/support', supportRoutes);

// Static folder for processed WebP dental photography
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Public FAQ endpoint (powers the FAQ section of the frontend) ──────────────
// GET /api/faq — returns all FAQ entries; no auth required
app.get('/api/faq', (_req, res) => {
  res.json({ success: true, faqs: getAllFAQs() });
});

// Module 5 — Smile Gallery & Case Management (About Us → Smile Gallery)
// GET   /api/gallery               ← primary endpoint for "About Us → Smile Gallery"
// GET   /api/gallery/categories    ← category filter tabs & counts
// GET   /api/gallery/:id           ← single case detail & auto view increment
// POST  /api/gallery/:id/like      ← like smile case
// POST  /api/gallery               ← CMS case upload (assistant/doctor)
// GET   /api/gallery/admin/cases   ← CMS case management list
// PUT   /api/gallery/:id           ← CMS case update
// PATCH /api/gallery/:id/review    ← Lead doctor approval/rejection
// DELETE /api/gallery/:id          ← CMS case deletion
app.use('/api/gallery', galleryRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Error handling (must be AFTER all routes)
// ─────────────────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap: DB → Server → Background services
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP + Socket.io server
  httpServer.listen(PORT, () => {
    console.log(`\n🦷 Smile Care Dental Backend`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   HTTP        : http://localhost:${PORT}`);
    console.log(`   Health      : http://localhost:${PORT}/health`);
    console.log(`   Socket.io   : ws://localhost:${PORT}\n`);
    console.log(`   Routes:`);
    console.log(`     Auth        → /api/auth`);
    console.log(`     Appointments→ /api/appointments`);
    console.log(`     EHR/Patients→ /api/patients`);
    console.log(`     Billing     → /api/payments  /api/invoices`);
    console.log(`     Patient Help→ /api/support   (About Us → Patient Help)`);
    console.log(`     Smile Gallery→ /api/gallery   (About Us → Smile Gallery)\n`);
  });

  // 3. Start cron-based reminder service (24h email + 2h SMS)
  startReminderService();
};

start().catch((err) => {
  console.error('[Fatal] Server startup failed:', err);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully…`);
  httpServer.close(async () => {
    await disconnectDB();
    console.log('[Server] Shutdown complete.');
    process.exit(0);
  });
  // Force-kill if still alive after 10 s
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections — log and exit cleanly
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled Rejection:', reason);
  process.exit(1);
});

export default app;
