# Backend Project Structure

```
server/
├─ config/               # Environment and DB configuration
│   ├─ env.js            # Loads .env variables
│   └─ db.js             # Mongoose connection logic
├─ middleware/           # Express middlewares
│   ├─ authMiddleware.js # JWT authentication
│   ├─ errorHandler.js   # Central error handling
│   ├─ sanitize.js       # mongo-sanitize + helmet
│   └─ rateLimiter.js    # express-rate-limit
├─ models/               # Mongoose schemas
│   ├─ User.js
│   ├─ DoctorAvailability.js
│   ├─ Appointment.js
│   ├─ PatientProfile.js
│   ├─ MedicalHistory.js
│   ├─ Invoice.js
│   └─ SupportTicket.js
├─ controllers/          # Business logic
│   ├─ authController.js
│   ├─ appointmentController.js
│   ├─ ehrController.js
│   ├─ billingController.js
│   └─ supportController.js
├─ routes/               # Express routers
│   ├─ authRoutes.js
│   ├─ appointmentRoutes.js
│   ├─ ehrRoutes.js
│   ├─ billingRoutes.js
│   └─ supportRoutes.js
├─ services/             # Background services & integrations
│   ├─ reminderService.js
│   └─ paymentGateway.js
├─ tests/                # Jest/Supertest tests
│   ├─ appointment.test.js
│   └─ auth.test.js
├─ index.js              # Application entry point
└─ package.json          # Dependencies & scripts
```

## Setup
1. Copy the `.env.example` to `.env` and fill in values.
2. Run `npm install` inside `server/`.
3. Start dev server: `npm run dev`.
4. Run tests: `npm test`.

## Environment Variables (`.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/dentist
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
EMAIL_SERVICE=sendgrid   # or twilio, mailgun, etc.
EMAIL_API_KEY=...
SMS_SERVICE=twilio       # or other provider
SMS_API_KEY=...
```

Feel free to adjust the configuration as needed.
