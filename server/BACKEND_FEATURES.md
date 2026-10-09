# DentoCare Backend Features - Complete Implementation

## ১. Audience-Based (রোগীর ধরণ অনুযায়ী সেবা)

### ✅ ডেটাবেজ মডেল (Database Model)
**File:** `server/models/Patient.js`

```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  isNewPatient: Boolean (default: true),
  medicalHistory: String,
  allergies: String,
  previousAppointments: [ObjectId ref: 'Appointment'],
  registeredAt: Date
}
```

### ✅ API এন্ডপয়েন্ট (Routes)
**File:** `server/routes/patientRoutes.js`

#### POST `/api/patients/register`
- নতুন রোগী রেজিস্ট্রেশন
- মেডিকেল হিস্ট্রি সেভ
- অ্যালার্জি সেভ
- `isNewPatient: true` সেট হয়
- **Advanced Features:**
  - Rate Limiting (bookingLimiter)
  - Activity Tracking
  - Winston Logging
  - Duplicate Email Check

#### POST `/api/patients/login`
- ইমেইল দিয়ে লগইন
- পূর্ববর্তী অ্যাপয়েন্টমেন্ট হিস্ট্রি পপুলেট
- `isNewPatient: false` সেট হয় (প্রথম লগইনে)
- **Advanced Features:**
  - Rate Limiting (bookingLimiter)
  - Activity Tracking
  - Winston Logging

#### GET `/api/patients/:id`
- রোগী প্রোফাইল দেখা
- অ্যাপয়েন্টমেন্ট হিস্ট্রি পপুলেট
- **Advanced Features:**
  - Redis Caching (30 min TTL)
  - Optional Authentication
  - Winston Logging

#### GET `/api/patients?isNew=true/false`
- নতুন/পুরাতন রোগী ফিল্টার
- **Advanced Features:**
  - Redis Caching (10 min TTL)
  - Optional Authentication
  - Winston Logging

#### PUT `/api/patients/:id`
- রোগী প্রোফাইল আপডেট
- **Advanced Features:**
  - Cache Invalidation
  - Optional Authentication
  - Winston Logging

---

## ২. Service Focus (চিকিৎসার ক্যাটাগরি)

### ✅ ডেটাবেজ মডেল (Database Model)
**File:** `server/models/Service.js`

```javascript
{
  serviceId: Number (required, unique),
  slug: String (required, unique),
  name: String (required),
  category: String (required, enum: [
    'Endodontics',
    'Cosmetic Dentistry',
    'Implantology',
    'Pediatric Dentistry',
    'Orthodontics',
    'Periodontics',
    'Oral Surgery',
    'General Dentistry'
  ]),
  shortDescription: String (required),
  fullDescription: String (required),
  basePrice: Number (required),
  currency: String (default: 'USD'),
  durationMinutes: Number (default: 60),
  imageUrl: String,
  assignedSpecialistId: ObjectId ref: 'Specialist',
  assignedDentistName: String,
  assignedDentistRole: String,
  procedureSteps: Array,
  highlights: Array,
  preparationTips: Array,
  serviceDiscountPercent: Number,
  serviceDiscountReason: String,
  isActive: Boolean (default: true),
  totalBookings: Number (default: 0),
  viewCount: Number (default: 0)
}
```

### ✅ API এন্ডপয়েন্ট (Routes)
**File:** `server/routes/serviceFocusRoutes.js`

#### GET `/api/service-focus/categories`
- সব ক্যাটাগরির লিস্ট
- **Advanced Features:**
  - Redis Caching (1 hour TTL)
  - Optional Authentication
  - Activity Tracking (view_category)
  - Winston Logging
  - Rate Limiting

#### GET `/api/service-focus?category=Cosmetic&search=...`
- ক্যাটাগরি দিয়ে ফিল্টার
- সার্চ করা
- **Advanced Features:**
  - Redis Caching (30 min TTL)
  - Optional Authentication
  - Activity Tracking (view_service)
  - Winston Logging
  - Rate Limiting

#### GET `/api/service-focus/:id`
- নির্দিষ্ট সার্ভিস দেখা
- View Count ইনক্রিমেন্ট
- **Advanced Features:**
  - Redis Caching (1 hour TTL)
  - Optional Authentication
  - Activity Tracking (view_service)
  - Winston Logging
  - Rate Limiting

---

## ৩. Multi-Location (একাধিক চেম্বার বা শাখা)

### ✅ ডেটাবেজ মডেল (Database Models)

#### Branch Model
**File:** `server/models/Branch.js`

```javascript
{
  name: String (required),
  address: String (required),
  city: String (required),
  phone: String (required),
  email: String,
  openingHours: String (default: 'Mon-Fri 9AM-6PM'),
  isActive: Boolean (default: true)
}
```

#### Doctor Model
**File:** `server/models/Doctor.js`

```javascript
{
  name: String (required),
  specialty: String (required, enum: [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Cosmetic Dentistry',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Implantology'
  ]),
  phone: String,
  email: String,
  branch: ObjectId ref: 'Branch' (required),
  experience: Number (default: 0),
  isAvailable: Boolean (default: true),
  profileImage: String
}
```

### ✅ API এন্ডপয়েন্ট (Routes)
**File:** `server/routes/branchRoutes.js`

#### GET `/api/branches`
- সব শাখার লিস্ট
- **Advanced Features:**
  - Redis Caching (1 hour TTL)
  - Optional Authentication
  - Activity Tracking (view_branch)
  - Winston Logging
  - Rate Limiting

#### GET `/api/branches/:id`
- নির্দিষ্ট শাখা দেখা
- **Advanced Features:**
  - Redis Caching (1 hour TTL)
  - Optional Authentication
  - Activity Tracking (view_branch)
  - Winston Logging
  - Rate Limiting

#### POST `/api/branches`
- নতুন শাখা তৈরি
- **Advanced Features:**
  - Cache Invalidation
  - Activity Tracking (register)
  - Winston Logging
  - Rate Limiting

#### GET `/api/branches/:id/doctors`
- নির্দিষ্ট শাখার ডাক্তারদের লিস্ট
- Doctor-Branch Relationship (Populate)
- **Advanced Features:**
  - Redis Caching (30 min TTL)
  - Optional Authentication
  - Activity Tracking (view_doctor)
  - Winston Logging
  - Rate Limiting

---

## ৪. Urgency-Based (জরুরি ও নিয়মিত অ্যাপয়েন্টমেন্ট)

### ✅ ডেটাবেজ মডেল (Database Model)
**File:** `server/models/UrgentAppointment.js`

```javascript
{
  patientName: String (required),
  patientPhone: String (required),
  patientEmail: String,
  doctorId: ObjectId ref: 'Doctor',
  branchId: ObjectId ref: 'Branch',
  date: Date (required),
  timeSlot: String (required),
  type: String (enum: ['Routine', 'Emergency'], default: 'Routine'),
  status: String (enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending'),
  symptomDescription: String,
  urgencyLevel: String (enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium'),
  notificationSent: Boolean (default: false)
}
```

### ✅ API এন্ডপয়েন্ট (Routes)
**File:** `server/routes/urgentAppointmentRoutes.js`

#### POST `/api/urgent-appointments`
- অ্যাপয়েন্টমেন্ট বুক করা
- **Special Backend Logic (Emergency):**
  - যদি `type: 'Emergency'` হয়:
    - `urgencyLevel` সেট হয় 'High' বা উচ্চতর
    - `notificationSent: true` সেট হয়
    - ইমিডিয়েট অ্যালার্ট ট্রিগার হয় (Console + Winston Log)
    - SMS/Email নোটিফিকেশন প্রস্তুত (নোডেমেইল ব্যবহার করে)
- **Advanced Features:**
  - Strict Rate Limiting (bookingLimiter - 10 req/15min)
  - Optional Authentication
  - Activity Tracking (book_appointment / emergency_request)
  - Winston Logging (Emergency Alert logged separately)
  - Emergency Alert Console Output

#### GET `/api/urgent-appointments/emergency`
- শুধু জরুরি অ্যাপয়েন্টমেন্ট দেখা
- Doctor & Branch Populate
- **Advanced Features:**
  - Optional Authentication
  - Winston Logging

#### GET `/api/urgent-appointments?type=...&status=...`
- সব অ্যাপয়েন্টমেন্ট ফিল্টার করে দেখা
- Doctor & Branch Populate
- **Advanced Features:**
  - Optional Authentication
  - Winston Logging

#### PATCH `/api/urgent-appointments/:id/status`
- অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট
- **Advanced Features:**
  - Optional Authentication
  - Winston Logging

---

## 🚀 Advanced Backend Features

### ১. JWT Authentication Middleware
**File:** `server/middleware/auth.js`

- `authenticateToken` - JWT টোকেন ভেরিফিকেশন (Required)
- `optionalAuth` - অপশনাল অথেন্টিকেশন (Optional)
- `generateToken` - JWT টোকেন জেনারেট

### ২. Request Validation Middleware
**File:** `server/middleware/validators.js`

- Contact Form Validation
- Appointment Booking Validation
- Custom Error Handling

### ৩. Redis Caching System
**File:** `server/utils/cache.js`

- `initRedis` - Redis ক্লায়েন্ট ইনিশিয়ালাইজ
- `cacheGet` - ক্যাশ থেকে ডেটা নেওয়া
- `cacheSet` - ক্যাশে ডেটা সেভ (TTL সহ)
- `cacheDelete` - ক্যাশ ডিলিট
- `cacheClearPattern` - প্যাটার্ন দিয়ে ক্যাশ ক্লিয়ার
- **Fallback Mode:** Redis না থাকলে MongoDB সরাসরি ব্যবহার হবে

### ৪. Logging System (Winston)
**File:** `server/utils/logger.js`

- সব লগ `logs/combined.log` এ সেভ
- এরর লগ `logs/error.log` এ সেভ
- ডেভেলপমেন্ট মোডে কনসোলেও দেখাবে
- JSON ফরম্যাটে লগ
- Timestamp সহ লগ

### ৫. Rate Limiting
**File:** `server/middleware/security.js`

- `apiLimiter` - ১০০ রিকোয়েস্ট/১৫ মিনিট (General API)
- `bookingLimiter` - ১০ রিকোয়েস্ট/১৫ মিনিট (Booking Routes)
- DDOS Protection
- Rate Limit Headers

### ৬. User Activity Tracking
**File:** `server/middleware/activityTracker.js`
**Model:** `server/models/UserActivity.js`

- ইউজার অ্যাক্টিভিটি ট্র্যাক (MongoDB)
- অ্যাকশন টাইপ:
  - `view_service`
  - `view_category`
  - `search_service`
  - `book_appointment`
  - `emergency_request`
  - `register`
  - `login`
  - `view_branch`
  - `view_doctor`
- ট্র্যাক করা ডেটা:
  - userId, email
  - ipAddress
  - userAgent
  - action
  - metadata (method, path, query, body)
- Winston Logging

### ৭. Security Middleware
**File:** `server/middleware/security.js`

- Helmet Security Headers
- NoSQL Injection Protection (express-mongo-sanitize)
- Data Sanitization

---

## 📊 Database Schema Relationships

```
Patient {
  previousAppointments: [Appointment] (ref)
}

Branch {
  _id
  name, address, city, phone
}

Doctor {
  branch: Branch (ref)
  name, specialty, experience
}

UrgentAppointment {
  doctorId: Doctor (ref)
  branchId: Branch (ref)
  type: Routine/Emergency
  status: Pending/Confirmed/Completed/Cancelled
  urgencyLevel: Low/Medium/High/Critical
  notificationSent: Boolean
}

Service {
  assignedSpecialistId: Specialist (ref)
  category: Enum
  basePrice, durationMinutes
}

UserActivity {
  userId: User (ref)
  email
  ipAddress
  action: Enum
  metadata: Mixed
}
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGO_URI=mongodb://127.0.0.1:27017/dentist_db
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
LOG_LEVEL=info
NODE_ENV=development
```

---

## 🚀 Server Startup

The server automatically:
1. Connects to MongoDB
2. Initializes Redis (fallback mode if unavailable)
3. Seeds treatment plans
4. Starts notification worker
5. Initializes Winston logger
6. Starts Socket.io server

---

## 📝 API Response Format

All APIs return:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {...},
  "total": number,
  "cached": true/false (for cached responses)
}
```

---

## ✅ Summary

All 4 main features are fully implemented with advanced backend capabilities:

1. ✅ **Audience-Based** - Patient registration, login, profile management with caching & logging
2. ✅ **Service Focus** - Dynamic service filtering by category with caching & activity tracking
3. ✅ **Multi-Location** - Branch & Doctor management with relationship & caching
4. ✅ **Urgency-Based** - Emergency/Routine appointments with immediate notification logic

Plus advanced features:
- ✅ JWT Authentication
- ✅ Redis Caching
- ✅ Winston Logging
- ✅ Rate Limiting
- ✅ User Activity Tracking
- ✅ Request Validation
- ✅ Security Headers
- ✅ NoSQL Injection Protection
