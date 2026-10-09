import mongoose from 'mongoose';
import Service from '../models/Service.js';
import Specialist from '../models/Specialist.js';
import Availability from '../models/Availability.js';
import Appointment from '../models/Appointment.js';
import PromoCode from '../models/PromoCode.js';
import ServiceAnalytics from '../models/ServiceAnalytics.js';

// ─── Helper: Non-blocking Background Analytics Logger ────────────────────────
/**
 * Records service click events into the database without delaying or blocking
 * the client HTTP response.
 */
const logServiceClickAsync = (service, req, discountInfo) => {
  setImmediate(async () => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || req.headers['referrer'] || '';

      await ServiceAnalytics.create({
        serviceId: service.serviceId,
        serviceName: service.name,
        category: service.category,
        userType: req.isGuest ? 'guest' : 'authenticated',
        userId: req.user ? req.user._id : null,
        userEmail: req.user ? req.user.email : null,
        guestSessionId: req.guestSessionId || null,
        ipAddress: typeof ip === 'string' ? ip : String(ip),
        userAgent,
        referrer,
        appliedDiscount: discountInfo || null,
        timestamp: new Date(),
      });

      // Increment view count in Service collection
      await Service.updateOne(
        { _id: service._id },
        { $inc: { viewCount: 1 } }
      );
    } catch (err) {
      console.warn('⚠️ Non-blocking service analytics logging failed:', err.message);
    }
  });
};

// ─── Helper: Compute Dynamic Appointment Slots ───────────────────────────────
const getAvailableSlotsForDentist = async (dentistName, daysAhead = 7) => {
  const result = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();

  // 1. Check if specific availability is configured in database
  const dbAvailabilities = await Availability.find({
    doctorName: { $regex: new RegExp(dentistName.split(' ')[0] || dentistName, 'i') },
    isAvailable: true,
  });

  const availabilityMap = {};
  dbAvailabilities.forEach((a) => {
    availabilityMap[a.day] = a.timeSlots;
  });

  // Default time slot template if none custom configured
  const defaultSlots = ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM', '04:30 PM'];

  for (let i = 1; i <= daysAhead; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);

    const dayName = daysOfWeek[slotDate.getDay()];
    // Skip Sundays for clinic operations
    if (dayName === 'Sunday') continue;

    const formattedDate = slotDate.toISOString().split('T')[0];
    const candidateSlots = availabilityMap[dayName] && availabilityMap[dayName].length > 0
      ? [...availabilityMap[dayName]]
      : [...defaultSlots];

    // Find any already booked appointments for this doctor on this day
    const bookedAppointments = await Appointment.find({
      doctorName: { $regex: new RegExp(dentistName.split(' ')[0] || dentistName, 'i') },
      appointmentDate: {
        $gte: new Date(`${formattedDate}T00:00:00.000Z`),
        $lte: new Date(`${formattedDate}T23:59:59.999Z`),
      },
      status: { $in: ['pending', 'confirmed'] },
    }).select('appointmentTime');

    const bookedTimes = new Set(bookedAppointments.map((b) => b.appointmentTime));
    const availableTimes = candidateSlots.filter((time) => !bookedTimes.has(time));

    if (availableTimes.length > 0) {
      result.push({
        date: formattedDate,
        day: dayName,
        availableCount: availableTimes.length,
        slots: availableTimes,
      });
    }
  }

  return result;
};

// ─── Helper: Evaluate Discounts and Promo Codes ──────────────────────────────
const evaluateServiceDiscounts = async (service, req) => {
  let discountPercent = service.serviceDiscountPercent || 0;
  let discountReason  = service.serviceDiscountReason || '';
  let promoCodeApplied = null;
  let discountAmount = 0;

  // 1. Check for active Promo Codes matching this user type or service ID
  const now = new Date();
  const query = {
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { applicableServiceIds: { $size: 0 } }, // Applies to all services
      { applicableServiceIds: service.serviceId },
    ],
  };

  // If user is guest vs authenticated, look for audience promotions
  if (req.isGuest) {
    query.targetUserType = { $in: ['all', 'guest', 'first_time'] };
  } else {
    query.targetUserType = { $in: ['all', 'registered'] };
  }

  const bestPromo = await PromoCode.findOne(query).sort({ discountValue: -1 });

  if (bestPromo) {
    if (bestPromo.discountType === 'percentage') {
      if (bestPromo.discountValue > discountPercent) {
        discountPercent = bestPromo.discountValue;
        discountReason = bestPromo.description;
        promoCodeApplied = bestPromo.code;
      }
    } else if (bestPromo.discountType === 'fixed') {
      discountAmount = Math.min(service.basePrice, bestPromo.discountValue);
      discountReason = bestPromo.description;
      promoCodeApplied = bestPromo.code;
    }
  }

  // Calculate percentage discount amount if not fixed
  if (discountPercent > 0 && discountAmount === 0) {
    discountAmount = Number(((service.basePrice * discountPercent) / 100).toFixed(2));
  }

  const finalPrice = Math.max(0, Number((service.basePrice - discountAmount).toFixed(2)));

  return {
    basePrice: service.basePrice,
    currency: service.currency || 'USD',
    hasDiscount: discountAmount > 0,
    discountPercent,
    discountAmount,
    finalPrice,
    promoCodeApplied,
    discountReason: discountReason || (discountAmount > 0 ? 'Special Online Clinic Offer' : null),
    savingsText: discountAmount > 0 ? `Save $${discountAmount} with promotional rate` : null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc   Get comprehensive Service Details Flow
 * @route  GET /api/services/:id
 * @route  GET /api/v1/services/:id
 * @access Public (with optionalAuth identifying guest vs user)
 */
export const getServiceDetails = async (req, res) => {
  try {
    const rawId = req.params.id || req.query.service_id;

    if (!rawId) {
      return res.status(400).json({
        success: false,
        message: 'Service identifier is required in route parameter or query.',
      });
    }

    // Build flexible query supporting: numeric serviceId (e.g. 105), slug (e.g. "root-canal"), or Mongo ObjectId
    let query;
    if (!isNaN(Number(rawId))) {
      query = { serviceId: Number(rawId), isActive: true };
    } else if (mongoose.Types.ObjectId.isValid(rawId)) {
      query = { _id: rawId, isActive: true };
    } else {
      query = { slug: rawId.toLowerCase().trim(), isActive: true };
    }

    // ─── 1. Query Service from Database ───────────────────────────────────────
    const service = await Service.findOne(query);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'SERVICE_NOT_FOUND',
        message: `Service with ID or slug "${rawId}" was not found or is currently inactive.`,
        availableServicesUrl: '/api/services',
      });
    }

    // ─── 2. Fetch Assigned Specialist Details ────────────────────────────────
    let dentistInfo = {
      name: service.assignedDentistName || 'Dr. DentoCare Specialist',
      role: service.assignedDentistRole || 'Senior Dental Practitioner',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
      rating: 4.9,
      experienceYears: 12,
      degrees: ['BDS', 'DDS'],
      chamber: 'DentoCare Main Clinic - Austin, TX',
      phone: '+1-512-205-1826',
    };

    if (service.assignedSpecialistId) {
      const specialistDoc = await Specialist.findById(service.assignedSpecialistId);
      if (specialistDoc) {
        dentistInfo = {
          id: specialistDoc._id,
          name: specialistDoc.name,
          slug: specialistDoc.slug,
          role: specialistDoc.specialization,
          profileImage: specialistDoc.profileImage || dentistInfo.profileImage,
          rating: specialistDoc.rating || 4.9,
          experienceYears: specialistDoc.experienceYears || 10,
          degrees: specialistDoc.degrees?.map((d) => d.degree) || ['BDS', 'MDS'],
          chamber: specialistDoc.chambers?.[0]?.name || 'DentoCare Main Clinic',
          phone: specialistDoc.phone || '+1-512-205-1826',
          bio: specialistDoc.bio,
        };
      }
    } else {
      // Lookup specialist by category match if specific ID wasn't linked
      const matchedSpecialist = await Specialist.findOne({
        $or: [
          { name: { $regex: new RegExp(service.assignedDentistName.split(' ')[0], 'i') } },
          { specialization: { $regex: new RegExp(service.category, 'i') } },
        ],
      });

      if (matchedSpecialist) {
        dentistInfo = {
          id: matchedSpecialist._id,
          name: matchedSpecialist.name,
          slug: matchedSpecialist.slug,
          role: matchedSpecialist.specialization,
          profileImage: matchedSpecialist.profileImage || dentistInfo.profileImage,
          rating: matchedSpecialist.rating || 4.9,
          experienceYears: matchedSpecialist.experienceYears || 12,
          degrees: matchedSpecialist.degrees?.map((d) => d.degree) || ['BDS', 'MDS'],
          chamber: matchedSpecialist.chambers?.[0]?.name || 'DentoCare Main Clinic',
          phone: matchedSpecialist.phone || '+1-512-205-1826',
        };
      }
    }

    // ─── 3. Query Available Appointment Slots ────────────────────────────────
    const availableSlots = await getAvailableSlotsForDentist(dentistInfo.name, 7);

    // ─── 4. Evaluate Discounts & Promo Codes ─────────────────────────────────
    const pricing = await evaluateServiceDiscounts(service, req);

    // ─── 5. Non-Blocking Analytics Logging (Async / Background) ──────────────
    logServiceClickAsync(service, req, pricing);

    // ─── 6. Response Generation ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      userContext: {
        isGuest: req.isGuest,
        userType: req.userType || (req.isGuest ? 'guest' : 'authenticated'),
        userId: req.user?._id || null,
        userName: req.user?.name || (req.isGuest ? 'Guest Visitor' : null),
        guestSessionId: req.guestSessionId || null,
      },
      data: {
        service: {
          id: service.serviceId,
          slug: service.slug,
          name: service.name,
          category: service.category,
          shortDescription: service.shortDescription,
          fullDescription: service.fullDescription,
          durationMinutes: service.durationMinutes,
          imageUrl: service.imageUrl,
          highlights: service.highlights || [],
          procedureSteps: service.procedureSteps || [],
          preparationTips: service.preparationTips || [],
          pricing,
        },
        assignedDentist: dentistInfo,
        availableSlots,
        bookingAction: {
          ctaText: `Book ${service.name}`,
          targetUrl: `/book?service=${encodeURIComponent(service.name)}&serviceId=${service.serviceId}&dentist=${encodeURIComponent(dentistInfo.name)}`,
          instantBookingAvailable: availableSlots.length > 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ getServiceDetails controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message || 'An unexpected error occurred while fetching service details.',
    });
  }
};

/**
 * @desc   Get all active dental services with summaries
 * @route  GET /api/services
 * @access Public
 */
export const getAllServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category.toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter).sort({ serviceId: 1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get Service Click Analytics Summary (Admin / Marketing)
 * @route  GET /api/services/analytics/summary
 * @access Protected (Admin only)
 */
export const getServiceAnalyticsSummary = async (req, res) => {
  try {
    const totalClicks = await ServiceAnalytics.countDocuments();
    const clicksByService = await ServiceAnalytics.aggregate([
      { $group: { _id: '$serviceName', serviceId: { $first: '$serviceId' }, totalClicks: { $sum: 1 } } },
      { $sort: { totalClicks: -1 } },
    ]);
    const clicksByUserType = await ServiceAnalytics.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } },
    ]);

    const recentLogs = await ServiceAnalytics.find()
      .sort({ timestamp: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: {
        totalClicks,
        clicksByService,
        clicksByUserType,
        recentLogs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getServiceDetails,
  getAllServices,
  getServiceAnalyticsSummary,
};
