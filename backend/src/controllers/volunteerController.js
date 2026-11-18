const Task = require('../models/Task');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all available delivery tasks ready for volunteers
// @route   GET /api/volunteer/available-tasks
// @access  Private (Volunteer, Admin)
const getAvailableTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      status: 'ASSIGNED',
      volunteer: null,
    })
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name phone organizationName address' },
      })
      .populate('request')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer's assigned tasks
// @route   GET /api/volunteer/my-tasks
// @access  Private (Volunteer, Admin)
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ volunteer: req.user._id })
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name phone organizationName address' },
      })
      .populate({
        path: 'request',
        populate: { path: 'recipient', select: 'name phone organizationName address' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Volunteer accepts an open task
// @route   PUT /api/volunteer/tasks/:id/accept
// @access  Private (Volunteer, Admin)
const acceptTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({ path: 'donation', populate: { path: 'donor' } })
      .populate({ path: 'request', populate: { path: 'recipient' } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Delivery task not found' });
    }

    if (task.volunteer && task.volunteer.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This task has already been claimed by another volunteer.',
      });
    }

    task.volunteer = req.user._id;
    task.status = 'ACCEPTED';
    await task.save();

    // Update donation status to ASSIGNED
    const donation = task.donation;
    donation.status = 'ASSIGNED';
    donation.assignedVolunteer = req.user._id;
    donation.statusHistory.push({
      status: 'ASSIGNED',
      changedBy: req.user._id,
      note: `Volunteer ${req.user.name} accepted pickup assignment`,
      timestamp: new Date(),
    });
    await donation.save();

    // Update request
    const request = task.request;
    request.status = 'ASSIGNED';
    request.assignedVolunteer = req.user._id;
    await request.save();

    // Notify Donor
    await createNotification({
      recipient: donation.donor._id,
      sender: req.user._id,
      title: 'Volunteer Assigned for Pickup',
      message: `${req.user.name} will pick up "${donation.title}". Phone: ${req.user.phone}`,
      type: 'TASK_ASSIGNED',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    // Notify Recipient
    await createNotification({
      recipient: request.recipient._id,
      sender: req.user._id,
      title: 'Volunteer On the Way!',
      message: `${req.user.name} is handling your food delivery. Phone: ${req.user.phone}`,
      type: 'TASK_ASSIGNED',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'You have accepted this delivery task.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Volunteer confirms pickup of food from donor
// @route   PUT /api/volunteer/tasks/:id/pickup
// @access  Private (Volunteer, Admin)
const confirmPickup = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({ path: 'donation', populate: { path: 'donor' } })
      .populate({ path: 'request', populate: { path: 'recipient' } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.volunteer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You are not assigned to this task.' });
    }

    task.status = 'PICKED_UP';
    task.pickupTime = new Date();
    await task.save();

    const donation = task.donation;
    donation.status = 'PICKED_UP';
    donation.statusHistory.push({
      status: 'PICKED_UP',
      changedBy: req.user._id,
      note: `Food picked up from donor by ${req.user.name}`,
      timestamp: new Date(),
    });
    await donation.save();

    const request = task.request;
    request.status = 'PICKED_UP';
    await request.save();

    // Notify Recipient
    await createNotification({
      recipient: request.recipient._id,
      sender: req.user._id,
      title: 'Food Picked Up — In Transit 🚚',
      message: `${req.user.name} has picked up "${donation.title}" and is delivering it to you.`,
      type: 'PICKED_UP',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    // Notify Donor
    await createNotification({
      recipient: donation.donor._id,
      sender: req.user._id,
      title: 'Pickup Completed',
      message: `${req.user.name} has picked up the food from your location. Thank you!`,
      type: 'PICKED_UP',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Pickup confirmed successfully. In transit to recipient.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Volunteer confirms delivery of food to recipient
// @route   PUT /api/volunteer/tasks/:id/deliver
// @access  Private (Volunteer, Admin)
const confirmDelivery = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({ path: 'donation', populate: { path: 'donor' } })
      .populate({ path: 'request', populate: { path: 'recipient' } });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.volunteer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. You are not assigned to this task.' });
    }

    task.status = 'DELIVERED';
    task.deliveredTime = new Date();
    await task.save();

    const donation = task.donation;
    donation.status = 'DELIVERED';
    donation.statusHistory.push({
      status: 'DELIVERED',
      changedBy: req.user._id,
      note: `Food delivered to recipient by ${req.user.name}. Service complete!`,
      timestamp: new Date(),
    });
    await donation.save();

    const request = task.request;
    request.status = 'DELIVERED';
    await request.save();

    // Notify Recipient
    await createNotification({
      recipient: request.recipient._id,
      sender: req.user._id,
      title: 'Food Delivered! 🍽️',
      message: `Your food delivery for "${donation.title}" is complete. Thank you for using BhojanSeva!`,
      type: 'DELIVERED',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    // Notify Donor
    await createNotification({
      recipient: donation.donor._id,
      sender: req.user._id,
      title: 'Donation Delivered Successfully! ❤️',
      message: `Your donation of "${donation.title}" has reached ${request.recipient.name}. You fed ${donation.peopleServed} people!`,
      type: 'DELIVERED',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully! Thank you for your service.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer dashboard stats
// @route   GET /api/volunteer/stats
// @access  Private (Volunteer, Admin)
const getVolunteerStats = async (req, res, next) => {
  try {
    const volunteerId = req.user._id;

    const [totalCompleted, pendingTasks, availableCount] = await Promise.all([
      Task.countDocuments({ volunteer: volunteerId, status: 'DELIVERED' }),
      Task.countDocuments({
        volunteer: volunteerId,
        status: { $in: ['ACCEPTED', 'PICKED_UP'] },
      }),
      Task.countDocuments({ status: 'ASSIGNED', volunteer: null }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCompleted,
        pendingTasks,
        availableCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableTasks,
  getMyTasks,
  acceptTask,
  confirmPickup,
  confirmDelivery,
  getVolunteerStats,
};
