const Request = require('../models/Request');
const Donation = require('../models/Donation');
const Task = require('../models/Task');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a food request
// @route   POST /api/requests
// @access  Private (Recipient, Admin)
const createRequest = async (req, res, next) => {
  try {
    const { donationId, requestedQuantity, peopleToFeed, deliveryAddress, deliveryInstructions } = req.body;

    const donation = await Donation.findById(donationId).populate('donor');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: `This donation is no longer available (current status: ${donation.status})`,
      });
    }

    if (donation.isExpired()) {
      donation.status = 'EXPIRED';
      await donation.save();
      return res.status(400).json({
        success: false,
        message: 'This donation has already expired',
      });
    }

    const availableQty = donation.quantity - donation.claimedQuantity;
    if (Number(requestedQuantity) > availableQty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${requestedQuantity}) exceeds available quantity (${availableQty})`,
      });
    }

    // Check if recipient already has an active pending request for this donation
    const existing = await Request.findOne({
      donation: donationId,
      recipient: req.user._id,
      status: { $in: ['PENDING', 'ACCEPTED', 'ASSIGNED'] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this donation',
      });
    }

    // Create Request
    const request = await Request.create({
      donation: donationId,
      recipient: req.user._id,
      requestedQuantity: Number(requestedQuantity),
      peopleToFeed: Number(peopleToFeed) || 1,
      deliveryAddress: deliveryAddress || req.user.address || 'Address provided at pickup',
      deliveryInstructions: deliveryInstructions || '',
      status: 'PENDING',
    });

    // Update donation status to REQUESTED
    donation.status = 'REQUESTED';
    donation.claimedQuantity = Number(requestedQuantity);
    donation.activeRequest = request._id;
    donation.statusHistory.push({
      status: 'REQUESTED',
      changedBy: req.user._id,
      note: `Requested by ${req.user.name} (${requestedQuantity} ${donation.unit})`,
      timestamp: new Date(),
    });
    await donation.save();

    // Notify Donor
    await createNotification({
      recipient: donation.donor._id,
      sender: req.user._id,
      title: 'New Food Request Received',
      message: `${req.user.name} (${req.user.organizationName || 'Recipient'}) requested ${requestedQuantity} ${donation.unit} of "${donation.title}".`,
      type: 'REQUEST_RECEIVED',
      relatedDonation: donation._id,
      relatedRequest: request._id,
    });

    await request.populate('donation');
    await request.populate('recipient', 'name organizationName phone email address');

    res.status(201).json({
      success: true,
      message: 'Donation requested successfully. Waiting for donor confirmation.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests made by current recipient
// @route   GET /api/requests/my-requests
// @access  Private (Recipient, Admin)
const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({ recipient: req.user._id })
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName phone email address' },
      })
      .populate('assignedVolunteer', 'name phone email availabilityStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming requests for donor's donations
// @route   GET /api/requests/incoming
// @access  Private (Donor, Admin)
const getIncomingRequests = async (req, res, next) => {
  try {
    // Find donor's donations
    const myDonations = await Donation.find({ donor: req.user._id }).select('_id');
    const donationIds = myDonations.map((d) => d._id);

    const requests = await Request.find({ donation: { $in: donationIds } })
      .populate('donation')
      .populate('recipient', 'name organizationName phone email address')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request details
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate({
        path: 'donation',
        populate: { path: 'donor', select: 'name organizationName phone email address' },
      })
      .populate('recipient', 'name organizationName phone email address')
      .populate('assignedVolunteer', 'name phone email availabilityStatus');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor updates request status (accept or reject)
// @route   PUT /api/requests/:id/status
// @access  Private (Donor, Admin)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, donorNotes } = req.body; // 'ACCEPTED' or 'REJECTED'

    const request = await Request.findById(req.params.id)
      .populate({ path: 'donation', populate: { path: 'donor' } })
      .populate('recipient');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const donation = request.donation;

    // Check ownership
    if (donation.donor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the food donor can accept or reject this request.',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status.toLowerCase()}`,
      });
    }

    if (status === 'ACCEPTED') {
      request.status = 'ACCEPTED';
      request.donorNotes = donorNotes || '';
      await request.save();

      donation.status = 'ACCEPTED';
      donation.statusHistory.push({
        status: 'ACCEPTED',
        changedBy: req.user._id,
        note: `Donor approved request for ${request.recipient.name}`,
        timestamp: new Date(),
      });
      await donation.save();

      // Automatically generate Delivery Task for volunteers
      await Task.create({
        donation: donation._id,
        request: request._id,
        pickupAddress: donation.pickupAddress,
        deliveryAddress: request.deliveryAddress || request.recipient.address || 'Address provided at pickup',
        status: 'ASSIGNED',
        notes: `Pickup from ${donation.donor.name} -> Deliver to ${request.recipient.name}. ${donorNotes || ''}`,
        donorContact: {
          name: donation.donor.name,
          phone: donation.donor.phone,
        },
        recipientContact: {
          name: request.recipient.name,
          phone: request.recipient.phone,
        },
      });

      // Notify Recipient
      await createNotification({
        recipient: request.recipient._id,
        sender: req.user._id,
        title: 'Request Accepted! 🎉',
        message: `Your request for "${donation.title}" was accepted! Delivery task has been assigned for pickup.`,
        type: 'REQUEST_ACCEPTED',
        relatedDonation: donation._id,
        relatedRequest: request._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Request accepted successfully. Delivery task has been created.',
        request,
      });
    } else if (status === 'REJECTED') {
      request.status = 'REJECTED';
      request.donorNotes = donorNotes || '';
      await request.save();

      // Release donation back to AVAILABLE
      donation.status = 'AVAILABLE';
      donation.claimedQuantity = 0;
      donation.activeRequest = null;
      donation.statusHistory.push({
        status: 'AVAILABLE',
        changedBy: req.user._id,
        note: `Donor declined request from ${request.recipient.name}. Released back to available.`,
        timestamp: new Date(),
      });
      await donation.save();

      // Notify Recipient
      await createNotification({
        recipient: request.recipient._id,
        sender: req.user._id,
        title: 'Request Declined',
        message: `Your request for "${donation.title}" was declined by the donor. Reason: ${donorNotes || 'Not specified'}`,
        type: 'REQUEST_REJECTED',
        relatedDonation: donation._id,
        relatedRequest: request._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Request rejected. Donation returned to available pool.',
        request,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update. Must be ACCEPTED or REJECTED.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Recipient cancels their request
// @route   PUT /api/requests/:id/cancel
// @access  Private (Recipient, Admin)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate('donation');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
    }

    if (!['PENDING', 'ACCEPTED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status.toLowerCase()}`,
      });
    }

    request.status = 'CANCELLED';
    await request.save();

    // Cancel related delivery task if exists
    await Task.updateMany({ request: request._id }, { status: 'CANCELLED' });

    // Release donation back
    if (request.donation) {
      const donation = await Donation.findById(request.donation._id);
      if (donation && donation.status !== 'DELIVERED') {
        donation.status = 'AVAILABLE';
        donation.claimedQuantity = 0;
        donation.activeRequest = null;
        donation.statusHistory.push({
          status: 'AVAILABLE',
          changedBy: req.user._id,
          note: 'Request cancelled by recipient. Food released to available pool.',
          timestamp: new Date(),
        });
        await donation.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest,
};
