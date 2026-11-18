const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Distribution = require('../models/Distribution');

const News = require('../models/News');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

/**
 * GET /api/ngo/impact/stats
 * Returns aggregated impact statistics.
 */
exports.getImpactStats = async (req, res) => {
  try {
    // Total food collected (kg) – sum of donation amountKg/quantity or distribution quantityKg
    const foodAgg = await Donation.aggregate([
      { $group: { _id: null, totalKg: { $sum: { $ifNull: ['$amountKg', '$quantity'] } } } },
    ]);
    let totalFoodKg = foodAgg[0]?.totalKg || 0;
    if (totalFoodKg === 0) {
      const distKgAgg = await Distribution.aggregate([
        { $group: { _id: null, totalKg: { $sum: '$quantityKg' } } },
      ]);
      totalFoodKg = distKgAgg[0]?.totalKg || 0;
    }

    // Meals distributed – sum of distribution.mealsServed
    const mealsAgg = await Distribution.aggregate([
      { $group: { _id: null, totalMeals: { $sum: '$mealsServed' } } },
    ]);
    const mealsDistributed = mealsAgg[0]?.totalMeals || 0;

    // People served – sum of distribution.peopleServed
    const peopleAgg = await Distribution.aggregate([
      { $group: { _id: null, totalPeople: { $sum: '$peopleServed' } } },
    ]);
    const peopleServed = peopleAgg[0]?.totalPeople || 0;

    // Completed distributions – count of distributions with status "completed"
    const completedCount = await Distribution.countDocuments({ status: 'completed' });

    res.json({
      totalFoodKg,
      mealsDistributed,
      peopleServed,
      completedDistributions: completedCount,
    });
  } catch (err) {
    console.error('Impact stats error:', err);
    res.status(500).json({ message: 'Server error while fetching impact stats' });
  }
};

/**
 * GET /api/ngo/impact/distributions
 * Returns recent distribution records.
 */
exports.getDistributions = async (req, res) => {
  try {
    const records = await Distribution.find()
      .populate('food') // assumes a reference field named `food`
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(records);
  } catch (err) {
    console.error('Distributions error:', err);
    res.status(500).json({ message: 'Server error while fetching distributions' });
  }
};

/**
 * GET /api/ngo/impact/news
 * Public endpoint – returns latest news items.
 */
exports.getNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.json(news);
  } catch (err) {
    console.error('News error:', err);
    res.status(500).json({ message: 'Server error while fetching news' });
  }
};

/**
 * GET /api/ngo/impact/events
 * Returns upcoming and past events.
 */
exports.getEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find()
      .sort({ date: 1 })
      .lean();
    const upcoming = events.filter(e => new Date(e.date) >= now);
    const past = events.filter(e => new Date(e.date) < now);
    res.json({ upcoming, past });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

/**
 * POST /api/ngo/impact/events/:id/register
 * Register the authenticated user for an event.
 */
exports.registerEvent = async (req, res) => {
  const userId = req.user.id; // auth middleware attaches user
  const eventId = req.params.id;
  try {
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check duplicate registration
    const existing = await EventRegistration.findOne({ event: eventId, user: userId });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });

    // Create registration
    await EventRegistration.create({ event: eventId, user: userId, registeredAt: new Date() });

    // Optionally increment counter on Event (denormalized)
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationsCount: 1 } });

    res.json({ message: 'Successfully registered' });
  } catch (err) {
    console.error('Event registration error:', err);
    res.status(500).json({ message: 'Server error while registering for event' });
  }
};
