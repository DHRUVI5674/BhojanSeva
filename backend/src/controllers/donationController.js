const Donation = require('../models/Donation');
const Request = require('../models/Request');
const { createNotification } = require('../utils/notificationHelper');

// Helper to auto-expire past donations
const autoExpireDonations = async () => {
  try {
    const now = new Date();
    await Donation.updateMany(
      {
        status: { $in: ['AVAILABLE', 'REQUESTED'] },
        expiryTime: { $lt: now },
      },
      {
        $set: { status: 'EXPIRED' },
        $push: {
          statusHistory: {
            status: 'EXPIRED',
            note: 'Donation passed expiry time automatically',
            timestamp: now,
          },
        },
      }
    );
  } catch (err) {
    console.error('Error auto-expiring donations:', err.message);
  }
};

// @desc    Create a food donation
// @route   POST /api/donations
// @access  Private (Donor, Admin)
const createDonation = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      images,
      quantity,
      unit,
      peopleServed,
      preparationTime,
      expiryTime,
      isVegetarian,
      allergens,
      pickupAddress,
      coordinates,
      pickupInstructions,
    } = req.body;

    const donationData = {
      title,
      description: description || '',
      category: category || 'cooked_meals',
      images: images || [],
      quantity: Number(quantity),
      unit: unit || 'servings',
      peopleServed: Number(peopleServed) || 1,
      preparationTime: preparationTime ? new Date(preparationTime) : new Date(),
      expiryTime: new Date(expiryTime),
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true,
      allergens: allergens || [],
      pickupAddress,
      pickupInstructions: pickupInstructions || '',
      donor: req.user._id,
      status: 'AVAILABLE',
      statusHistory: [
        {
          status: 'AVAILABLE',
          changedBy: req.user._id,
          note: 'Donation listed and available for requests',
          timestamp: new Date(),
        },
      ],
    };

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      donationData.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    } else if (req.user.location && req.user.location.coordinates?.length === 2) {
      donationData.location = req.user.location;
    }

    const donation = await Donation.create(donationData);
    await donation.populate('donor', 'name organizationName phone email address');

    res.status(201).json({
      success: true,
      message: 'Food donation posted successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get / Browse donations (with search, category, status, geo)
// @route   GET /api/donations
// @access  Public / Authenticated
const getDonations = async (req, res, next) => {
  try {
    await autoExpireDonations();

    const {
      status,
      category,
      isVegetarian,
      search,
      lat,
      lng,
      maxDistance = 50000, // 50km default
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // By default for recipients/public: show AVAILABLE
    if (status) {
      query.status = status;
    } else {
      query.status = 'AVAILABLE';
    }

    if (category) {
      query.category = category;
    }

    if (isVegetarian !== undefined) {
      query.isVegetarian = isVegetarian === 'true' || isVegetarian === true;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }, { pickupAddress: regex }];
    }

    // Geo query if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance, 10),
        },
      };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Donation.countDocuments(query);

    const donations = await Donation.find(query)
      .populate('donor', 'name organizationName phone email address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)) || 1,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donation details by ID
// @route   GET /api/donations/:id
// @access  Public / Authenticated
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name organizationName phone email address')
      .populate('activeRequest')
      .populate('assignedVolunteer', 'name phone email availabilityStatus');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own donations
// @route   GET /api/donations/my-donations
// @access  Private (Donor, Admin)
const getMyDonations = async (req, res, next) => {
  try {
    await autoExpireDonations();

    const donations = await Donation.find({ donor: req.user._id })
      .populate('activeRequest')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food donation
// @route   PUT /api/donations/:id
// @access  Private (Donor, Admin)
const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Only donor who created it or admin can update
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this donation' });
    }

    if (donation.status !== 'AVAILABLE' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a donation with status '${donation.status}'`,
      });
    }

    const updatable = [
      'title',
      'description',
      'category',
      'quantity',
      'unit',
      'peopleServed',
      'expiryTime',
      'isVegetarian',
      'allergens',
      'pickupAddress',
      'pickupInstructions',
      'images',
    ];

    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        donation[key] = req.body[key];
      }
    }

    if (req.body.coordinates && Array.isArray(req.body.coordinates)) {
      donation.location = {
        type: 'Point',
        coordinates: [Number(req.body.coordinates[0]), Number(req.body.coordinates[1])],
      };
    }

    await donation.save();
    await donation.populate('donor', 'name organizationName phone email address');

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel donation
// @route   PUT /api/donations/:id/cancel
// @access  Private (Donor, Admin)
const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this donation' });
    }

    if (['DELIVERED', 'CANCELLED'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Donation is already ${donation.status.toLowerCase()}`,
      });
    }

    donation.status = 'CANCELLED';
    donation.statusHistory.push({
      status: 'CANCELLED',
      changedBy: req.user._id,
      note: req.body.reason || 'Cancelled by donor',
      timestamp: new Date(),
    });

    await donation.save();

    // Cancel pending/accepted requests if any
    if (donation.activeRequest) {
      await Request.findByIdAndUpdate(donation.activeRequest, {
        status: 'CANCELLED',
        donorNotes: 'Donation was cancelled by donor',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  getMyDonations,
  updateDonation,
  cancelDonation,
  autoExpireDonations,
};
