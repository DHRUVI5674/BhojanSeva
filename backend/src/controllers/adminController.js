const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Task = require('../models/Task');

// @desc    Get complete platform dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalRecipients,
      totalVolunteers,
      totalDonations,
      activeDonations,
      deliveredDonations,
      totalRequests,
      deliveredTasks,
      recentDonations,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'recipient' }),
      User.countDocuments({ role: 'volunteer' }),
      Donation.countDocuments(),
      Donation.countDocuments({
        status: { $in: ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP'] },
      }),
      Donation.countDocuments({ status: 'DELIVERED' }),
      Request.countDocuments(),
      Task.countDocuments({ status: 'DELIVERED' }),
      Donation.find().populate('donor', 'name organizationName').sort({ createdAt: -1 }).limit(5),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
    ]);

    // Calculate estimated people fed from delivered donations
    const peopleFedAggregation = await Donation.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, totalPeople: { $sum: '$peopleServed' } } },
    ]);
    const totalPeopleFed = peopleFedAggregation[0]?.totalPeople || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalRecipients,
        totalVolunteers,
        totalDonations,
        activeDonations,
        deliveredDonations,
        totalRequests,
        deliveredTasks,
        totalPeopleFed,
      },
      recentDonations,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search and role filter)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { organizationName: regex }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate, deactivate, verify)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, isVerified, role } = req.body;
    const updates = {};

    if (isActive !== undefined) updates.isActive = isActive;
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (role !== undefined) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donations for admin
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getAllDonations = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .populate('donor', 'name email phone organizationName')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all volunteers
// @route   GET /api/admin/volunteers
// @access  Private (Admin)
const getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllDonations,
  getAllVolunteers,
};
