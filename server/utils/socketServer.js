import { Server } from 'socket.io';

let ioInstance = null;

// ─────────────────────────────────────────────────────────────────────────────
// Socket.io Rooms
// ─────────────────────────────────────────────────────────────────────────────
const ROOMS = {
  ADMIN:    'admin_room',       // Admin dashboard hub
  PATIENTS: 'patients_room',    // Patient-facing updates
  DOCTORS:  'doctors_room',     // Doctor / specialist room
};

/**
 * initSocketServer
 * Attaches Socket.io to the existing HTTP server.
 * Clients connect and join role-based rooms.
 */
export const initSocketServer = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Upgrade path
    transports: ['websocket', 'polling'],
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected → ID: ${socket.id}`);

    // ── Room Subscriptions ──────────────────────────────────────────────────

    /** Admin/Doctor joins admin hub to receive real-time dashboard events */
    socket.on('join_admin_hub', (payload) => {
      socket.join(ROOMS.ADMIN);
      console.log(`👑 [Socket.io] ${socket.id} joined admin_room`);
      // Acknowledge connection to the client
      socket.emit('admin:connected', {
        message: 'Connected to Admin Hub. Real-time events active.',
        room:    ROOMS.ADMIN,
        socketId: socket.id,
        timestamp: new Date(),
      });
    });

    /** Patient joins their room to receive booking confirmations */
    socket.on('join_patient_room', ({ patientEmail } = {}) => {
      const roomName = patientEmail
        ? `patient:${patientEmail.toLowerCase()}`
        : ROOMS.PATIENTS;
      socket.join(roomName);
      console.log(`🧑‍⚕️ [Socket.io] ${socket.id} joined ${roomName}`);
    });

    /** Doctor joins their personal room */
    socket.on('join_doctor_room', ({ doctorId } = {}) => {
      if (doctorId) {
        socket.join(`doctor:${doctorId}`);
        console.log(`👨‍⚕️ [Socket.io] ${socket.id} joined doctor:${doctorId}`);
      }
    });

    // ── Client-initiated events ─────────────────────────────────────────────

    /** Admin requests an immediate analytics refresh broadcast */
    socket.on('admin:request_refresh', () => {
      socket.to(ROOMS.ADMIN).emit('admin:refresh_required', {
        requestedBy: socket.id,
        timestamp:   new Date(),
      });
    });

    // ── Disconnection ───────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.io] Client disconnected → ID: ${socket.id} | Reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`❌ [Socket.io] Socket error on ${socket.id}:`, err.message);
    });
  });

  console.log('⚡ [Socket.io] Real-time WebSocket server initialized.');
  return ioInstance;
};

// ─────────────────────────────────────────────────────────────────────────────
// Emit helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * notifyAdminDashboard
 * Emits a named event to all sockets in admin_room.
 * Falls back to global broadcast if room is empty.
 *
 * @param {string} eventName  - e.g. 'admin:appointment_booked'
 * @param {object} payload    - event-specific data
 */
export const notifyAdminDashboard = (eventName, payload = {}) => {
  if (!ioInstance) return;

  const message = { ...payload, timestamp: new Date() };
  ioInstance.to(ROOMS.ADMIN).emit(eventName, message);

  const adminCount = ioInstance.sockets.adapter?.rooms?.get(ROOMS.ADMIN)?.size || 0;
  console.log(`📡 [Socket.io] Emitted "${eventName}" → admin_room (${adminCount} client(s))`);
};

/**
 * notifyPatient
 * Emits event to a specific patient's private room.
 *
 * @param {string} patientEmail
 * @param {string} eventName
 * @param {object} payload
 */
export const notifyPatient = (patientEmail, eventName, payload = {}) => {
  if (!ioInstance || !patientEmail) return;

  const roomName = `patient:${patientEmail.toLowerCase()}`;
  ioInstance.to(roomName).emit(eventName, { ...payload, timestamp: new Date() });
  console.log(`📬 [Socket.io] Emitted "${eventName}" → ${roomName}`);
};

/**
 * broadcastGlobal
 * Emits an event to ALL connected sockets (e.g. system announcements).
 *
 * @param {string} eventName
 * @param {object} payload
 */
export const broadcastGlobal = (eventName, payload = {}) => {
  if (!ioInstance) return;
  ioInstance.emit(eventName, { ...payload, timestamp: new Date() });
  console.log(`📢 [Socket.io] Global broadcast: "${eventName}"`);
};

/** Returns the Socket.io server instance */
export const getIO = () => ioInstance;
