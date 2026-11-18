const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'SYSTEM',
  relatedDonation = null,
  relatedRequest = null,
}) => {
  try {
    if (!recipient) return null;
    return await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      relatedDonation,
      relatedRequest,
    });
  } catch (error) {
    console.error(`[NotificationHelper] Failed to create notification: ${error.message}`);
    return null;
  }
};

module.exports = { createNotification };
