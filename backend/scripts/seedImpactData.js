const mongoose = require('mongoose');
const News = require('../src/models/News');
const Event = require('../src/models/Event');
const Distribution = require('../src/models/Distribution');
const Donation = require('../src/models/Donation');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bhojanseva';

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Find or create a donor user for donations
    let donor = await User.findOne({ role: 'donor' });
    if (!donor) {
      donor = await User.create({
        name: 'Grand Bhagwati Banquet',
        email: 'donor_seed@bhojanseva.org',
        password: 'Password@123',
        phone: '9825012345',
        role: 'donor',
        organizationName: 'Grand Bhagwati Hospitality',
        address: 'SG Highway, Ahmedabad',
        location: { type: 'Point', coordinates: [72.5085, 23.037] },
        isActive: true,
        isVerified: true,
      });
      console.log('Created sample donor user.');
    }

    // 2. Create sample donations if needed
    console.log('Seeding donations...');
    const donationDocs = await Donation.create([
      {
        donor: donor._id,
        title: 'Dal Makhani & Jeera Rice (Fresh Catering)',
        description: 'Prepared for a banquet lunch, hygienically packed in insulated warm containers.',
        category: 'cooked_meals',
        quantity: 45,
        unit: 'kg',
        peopleServed: 90,
        expiryTime: new Date(Date.now() + 8 * 3600000),
        isVegetarian: true,
        pickupAddress: 'Grand Bhagwati, SG Highway, Ahmedabad',
        location: { type: 'Point', coordinates: [72.5085, 23.037] },
        status: 'DELIVERED',
        images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'],
      },
      {
        donor: donor._id,
        title: 'Mixed Vegetable Curry & 200 Wholewheat Rotis',
        description: 'Nutritious lunch cooked at wedding reception, packed with foil wraps.',
        category: 'cooked_meals',
        quantity: 35,
        unit: 'kg',
        peopleServed: 70,
        expiryTime: new Date(Date.now() + 6 * 3600000),
        isVegetarian: true,
        pickupAddress: 'Shubham Party Plot, Sindhu Bhavan Road, Ahmedabad',
        location: { type: 'Point', coordinates: [72.5042, 23.0451] },
        status: 'DELIVERED',
        images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'],
      },
      {
        donor: donor._id,
        title: 'Artisan Bakery Bread, Croissants & Tea Cakes',
        description: 'Same-day unconsumed bakery items from premium bakehouse in sealed boxes.',
        category: 'bakery_items',
        quantity: 25,
        unit: 'kg',
        peopleServed: 50,
        expiryTime: new Date(Date.now() + 24 * 3600000),
        isVegetarian: true,
        pickupAddress: 'Artisan Oven, CG Road, Navrangpura, Ahmedabad',
        location: { type: 'Point', coordinates: [72.5568, 23.0338] },
        status: 'DELIVERED',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'],
      },
      {
        donor: donor._id,
        title: 'Organic Khichdi & Gujrati Kadhi Cauldrons',
        description: 'Nutritious wholesome community feast leftovers, temperature monitored.',
        category: 'cooked_meals',
        quantity: 60,
        unit: 'kg',
        peopleServed: 120,
        expiryTime: new Date(Date.now() + 10 * 3600000),
        isVegetarian: true,
        pickupAddress: 'Community Hall, Naranpura, Ahmedabad',
        location: { type: 'Point', coordinates: [72.5412, 23.0567] },
        status: 'DELIVERED',
        images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80'],
      },
    ]);
    console.log(`Created ${donationDocs.length} sample donations.`);

    // 3. Clear and seed Distributions
    console.log('Seeding Distributions...');
    await Distribution.deleteMany({});
    const distributions = [
      {
        food: donationDocs[0]._id,
        quantityKg: 45,
        mealsServed: 90,
        peopleServed: 90,
        status: 'completed',
        location: 'Maninagar Shelter Cluster, Ahmedabad',
        recipient: 'Asha Deep Bal Care Ashram',
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        food: donationDocs[1]._id,
        quantityKg: 35,
        mealsServed: 70,
        peopleServed: 70,
        status: 'completed',
        location: 'Kalupur Night Shelter, Old Ahmedabad',
        recipient: 'Seva Sankalp Welfare Trust',
        createdAt: new Date(Date.now() - 14 * 3600000),
      },
      {
        food: donationDocs[2]._id,
        quantityKg: 25,
        mealsServed: 50,
        peopleServed: 50,
        status: 'completed',
        location: 'Vastrapur Slum Rehabilitation Area',
        recipient: 'Pratham Bal Vikas NGO',
        createdAt: new Date(Date.now() - 28 * 3600000),
      },
      {
        food: donationDocs[3]._id,
        quantityKg: 60,
        mealsServed: 120,
        peopleServed: 120,
        status: 'completed',
        location: 'Sabarmati Riverside Community Settlement',
        recipient: 'Shree Krishna Annakshetra',
        createdAt: new Date(Date.now() - 48 * 3600000),
      },
      {
        food: donationDocs[0]._id,
        quantityKg: 30,
        mealsServed: 60,
        peopleServed: 60,
        status: 'completed',
        location: 'Civil Hospital Attendant Shelter, Asarwa',
        recipient: 'Jan Seva Mandal Shelter',
        createdAt: new Date(Date.now() - 72 * 3600000),
      },
      {
        food: donationDocs[1]._id,
        quantityKg: 40,
        mealsServed: 80,
        peopleServed: 80,
        status: 'completed',
        location: 'Odhav Industrial Labour Colony',
        recipient: 'Shramik Kalyan Mitra Mandal',
        createdAt: new Date(Date.now() - 96 * 3600000),
      },
    ];
    await Distribution.insertMany(distributions);
    console.log(`Seeded ${distributions.length} distributions.`);

    // 4. Clear and seed News
    console.log('Seeding News...');
    await News.deleteMany({});
    const newsItems = [
      {
        title: 'Over 1,200 kg of Surplus Food Rescued Across Ahmedabad During Diwali',
        body: 'Through coordinated volunteer teams and real-time pickup alerts, BhojanSeva successfully diverted festive banquet surplus from 32 catering halls to 14 registered night shelters, feeding over 2,400 vulnerable citizens.',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        title: '15 Local Bakeries Partner with BhojanSeva for Daily Morning Bread Runs',
        body: 'Under the new Morning Bread Circle program, unsold day-end bread, buns, and healthy baked goods are gathered every evening at 9 PM and provided hot for breakfast to children at grassroots shelters.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        title: 'Zero-Waste Wedding Drive Delivers 850 Fresh Meals to Shanti Nagar',
        body: 'A family hosting a wedding at SG Highway partnered with BhojanSeva to package unserved buffet food. Within 45 minutes of the event ending, volunteer drivers transported warm meals to the Shanti Nagar relief kitchen.',
        imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 8 * 86400000),
      },
      {
        title: 'Youth Volunteer Spotlight: How University Students Lead Weekend Food Drops',
        body: 'Over 60 student volunteers across Gujarat University have formed rapid-response delivery squads, cutting response times from donor alert to distribution from 2 hours down to 40 minutes.',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 12 * 86400000),
      },
    ];
    await News.insertMany(newsItems);
    console.log(`Seeded ${newsItems.length} news stories.`);

    // 5. Clear and seed Events
    console.log('Seeding Events...');
    await Event.deleteMany({});
    const now = new Date();
    const eventItems = [
      {
        title: 'Weekend Ration Packaging & Nutrition Kit Drive',
        description: 'Join hands with volunteers to sort, hygienically pack, and assemble 500 dry ration kits containing lentils, rice, wheat flour, and spices for underprivileged households.',
        date: new Date(Date.now() + 2 * 86400000 + 4 * 3600000), // in 2 days at 10 AM
        location: 'BhojanSeva Community Kitchen, Navrangpura, Ahmedabad',
        imageUrl: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=600&q=80',
        capacity: 40,
        registrationsCount: 18,
        createdAt: now,
      },
      {
        title: 'Night Shelter Hot Meal Run & Distribution Walk',
        description: 'Volunteer squad walk to deliver warm khichdi, bananas, and blankets to night shelters around Kalupur Railway Station and Old City settlements.',
        date: new Date(Date.now() + 4 * 86400000 + 13 * 3600000), // in 4 days at 7 PM
        location: 'Assembly Point: Near Kalupur Swaminarayan Temple Gate',
        imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=600&q=80',
        capacity: 25,
        registrationsCount: 12,
        createdAt: now,
      },
      {
        title: 'Community Food Safety & Hygiene Workshop',
        description: 'Interactive certification workshop on food handling standards, temperature control, and packaging protocols for surplus collection volunteers and food coordinators.',
        date: new Date(Date.now() + 7 * 86400000 + 5 * 3600000), // in 7 days at 11 AM
        location: 'AMA Hall, ATIRA Campus, Dr. Vikram Sarabhai Marg, Ahmedabad',
        imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=600&q=80',
        capacity: 60,
        registrationsCount: 34,
        createdAt: now,
      },
      {
        title: 'Sunday Morning Fruit & Nutrition Drive for Kids',
        description: 'Pack and distribute vitamin-rich fruit boxes (apples, bananas, oranges, dates) for 300 children at community learning centers.',
        date: new Date(Date.now() + 10 * 86400000 + 3 * 3600000), // in 10 days
        location: 'Sabarmati Riverfront Children Garden, Ahmedabad',
        imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=600&q=80',
        capacity: 30,
        registrationsCount: 8,
        createdAt: now,
      },
    ];
    await Event.insertMany(eventItems);
    console.log(`Seeded ${eventItems.length} community events.`);

    console.log('All dummy impact data successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedData();
