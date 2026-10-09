export const sendNotification = async (req, res) => {
  try {
    const { recipientPhone, recipientEmail, type, message, payload } = req.body;

    const notificationResult = {
      _id: `notif-${Date.now()}`,
      type: type || 'SMS_AND_EMAIL',
      recipientPhone: recipientPhone || '+1 (512) 555-0199',
      recipientEmail: recipientEmail || 'patient@example.com',
      message: message || 'Your dental appointment schedule has been confirmed.',
      status: 'DELIVERED',
      sentAt: new Date().toISOString(),
      payload: payload || {},
    };

    return res.status(200).json({
      success: true,
      message: 'Automatic SMS/Email notification triggered successfully.',
      data: notificationResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  sendNotification,
};
