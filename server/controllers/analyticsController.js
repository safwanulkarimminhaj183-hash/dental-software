import Contact from '../models/Contact.js';
import Appointment from '../models/Appointment.js';

/**
 * @desc    Get Admin Dashboard Analytics & Chart Data
 * @route   GET /api/analytics
 * @access  Admin / Protected
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Core Summary Metrics
    const [
      totalContacts,
      unreadContacts,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'Unread' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: { $in: ['Pending', 'pending'] } }),
      Appointment.countDocuments({ status: { $in: ['Approved', 'confirmed', 'Replied'] } }),
      Appointment.countDocuments({ status: { $in: ['Completed', 'completed'] } }),
    ]);

    // 2. Department-wise Appointment Distribution (For Doughnut/Pie Charts)
    const departmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$department', '$serviceName'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          department: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 3. Monthly Trends for Current Year (For Bar/Line Charts)
    const currentYear = new Date().getFullYear();
    const monthlyTrends = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$appointmentDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Status Breakdown
    const statusStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 5. Recent 5 Submissions for Dashboard Widgets
    const [recentContacts, recentAppointments] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).limit(5),
      Appointment.find().sort({ createdAt: -1 }).limit(5),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalContacts,
          unreadContacts,
          totalAppointments,
          pendingAppointments,
          approvedAppointments,
          completedAppointments,
        },
        departmentStats,
        monthlyTrends,
        statusStats,
        recentContacts,
        recentAppointments,
      },
    });
  } catch (error) {
    console.error('❌ Error in getDashboardAnalytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary.',
    });
  }
};

export default {
  getDashboardAnalytics,
};
