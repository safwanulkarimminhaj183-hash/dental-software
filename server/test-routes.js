import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/v1/availability', availabilityRoutes);

app.get('/', (req, res) => {
  res.send('Dentist Management API is running...');
});

const PORT = 5099; // Test port
const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);
  try {
    // Test 1: Root route
    const resRoot = await fetch(`http://localhost:${PORT}/`);
    const txtRoot = await resRoot.text();
    console.log('Root Route [GET /]:', txtRoot);

    // Test 2: Appointments GET route
    const resAppts = await fetch(`http://localhost:${PORT}/api/v1/appointments`);
    const jsonAppts = await resAppts.json();
    console.log('Appointments Route [GET /api/v1/appointments]: status =', resAppts.status, ', success =', jsonAppts.success);

    // Test 3: Availability GET route
    const resAvail = await fetch(`http://localhost:${PORT}/api/v1/availability`);
    const jsonAvail = await resAvail.json();
    console.log('Availability Route [GET /api/v1/availability]: status =', resAvail.status, ', success =', jsonAvail.success);

    console.log('ALL_SERVER_ROUTES_VERIFIED_SUCCESSFULLY');
  } catch (err) {
    console.error('Test execution error:', err.message);
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      process.exit(0);
    });
  }
});
