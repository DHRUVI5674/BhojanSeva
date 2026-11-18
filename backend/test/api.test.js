const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000/api';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 RUNNING COMPREHENSIVE BHOJANSEVA API TESTS');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  const testSuffix = Date.now();
  let donorToken = '';
  let recipientToken = '';
  let volunteerToken = '';
  let adminToken = '';
  let donationId = '';
  let requestId = '';
  let taskId = '';

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.body.success, 'Health check endpoint returns 200');

    // 2. Register Donor
    const regDonor = await request('/auth/register', 'POST', {
      name: 'Radhe Bhojanalaya',
      email: `donor_${testSuffix}@example.com`,
      password: 'Password123!',
      phone: '+91 9876543210',
      role: 'donor',
      organizationName: 'Radhe Caterers & Banquet',
      address: 'Near SG Highway, Ahmedabad',
      coordinates: [72.5074, 23.0338],
    });
    assert(regDonor.status === 201 && regDonor.body.token, 'Register Donor succeeds with JWT');
    donorToken = regDonor.body.token;

    // 3. Register Recipient
    const regRecipient = await request('/auth/register', 'POST', {
      name: 'Sneha Foundation NGO',
      email: `recipient_${testSuffix}@example.com`,
      password: 'Password123!',
      phone: '+91 9876543211',
      role: 'recipient',
      organizationName: 'Sneha Bal Ashram & Food Drive',
      address: 'Paldi, Ahmedabad',
      coordinates: [72.5644, 23.0125],
    });
    assert(regRecipient.status === 201 && regRecipient.body.token, 'Register Recipient succeeds with JWT');
    recipientToken = regRecipient.body.token;

    // 4. Register Volunteer
    const regVolunteer = await request('/auth/register', 'POST', {
      name: 'Amit Patel',
      email: `volunteer_${testSuffix}@example.com`,
      password: 'Password123!',
      phone: '+91 9876543212',
      role: 'volunteer',
      address: 'Navrangpura, Ahmedabad',
      coordinates: [72.5539, 23.0366],
    });
    assert(regVolunteer.status === 201 && regVolunteer.body.token, 'Register Volunteer succeeds with JWT');
    volunteerToken = regVolunteer.body.token;

    // 5. Register Admin
    const regAdmin = await request('/auth/register', 'POST', {
      name: 'Super Admin',
      email: `admin_${testSuffix}@example.com`,
      password: 'Password123!',
      phone: '+91 9876543213',
      role: 'admin',
      address: 'Headquarters, Ahmedabad',
    });
    assert(regAdmin.status === 201 && regAdmin.body.token, 'Register Admin succeeds with JWT');
    adminToken = regAdmin.body.token;

    // 6. Login Test
    const loginRes = await request('/auth/login', 'POST', {
      email: `donor_${testSuffix}@example.com`,
      password: 'Password123!',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'Login user returns 200 and token');

    // 7. Get Me
    const meRes = await request('/auth/me', 'GET', null, donorToken);
    assert(meRes.status === 200 && meRes.body.user.role === 'donor', 'Get profile (/auth/me) returns user');

    // 8. Create Food Donation
    const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const createDonationRes = await request(
      '/donations',
      'POST',
      {
        title: 'Fresh Dal Khichdi and Gujarati Curry',
        description: 'Nutritious, hygienically packed hot food prepared 1 hour ago for catering event.',
        category: 'cooked_meals',
        quantity: 50,
        unit: 'servings',
        peopleServed: 50,
        expiryTime: expiryDate,
        isVegetarian: true,
        allergens: ['Dairy (Ghee)'],
        pickupAddress: 'Radhe Banquet, SG Highway, Ahmedabad',
        pickupInstructions: 'Call upon arrival at back entrance gate #2',
        coordinates: [72.5074, 23.0338],
      },
      donorToken
    );
    assert(createDonationRes.status === 201 && createDonationRes.body.donation._id, 'Donor creates donation');
    donationId = createDonationRes.body.donation._id;

    // 9. Browse Available Food
    const browseRes = await request('/donations?category=cooked_meals');
    assert(
      browseRes.status === 200 && browseRes.body.donations.some((d) => d._id === donationId),
      'Browse available donations contains created food'
    );

    // 10. Recipient Requests Food
    const requestRes = await request(
      '/requests',
      'POST',
      {
        donationId,
        requestedQuantity: 50,
        peopleToFeed: 50,
        deliveryAddress: 'Sneha Bal Ashram, Paldi, Ahmedabad',
        deliveryInstructions: 'Deliver to community dining hall',
      },
      recipientToken
    );
    assert(requestRes.status === 201 && requestRes.body.request._id, 'Recipient requests available donation');
    requestId = requestRes.body.request._id;

    // 11. Donor Views Incoming Requests
    const incomingRes = await request('/requests/incoming', 'GET', null, donorToken);
    assert(
      incomingRes.status === 200 && incomingRes.body.requests.some((r) => r._id === requestId),
      'Donor views incoming request'
    );

    // 12. Donor Accepts Request
    const acceptRes = await request(
      `/requests/${requestId}/status`,
      'PUT',
      { status: 'ACCEPTED', donorNotes: 'Food is packed and ready for pickup.' },
      donorToken
    );
    assert(acceptRes.status === 200 && acceptRes.body.request.status === 'ACCEPTED', 'Donor accepts request');

    // 13. Volunteer Views Available Delivery Tasks
    const tasksRes = await request('/volunteer/available-tasks', 'GET', null, volunteerToken);
    assert(
      tasksRes.status === 200 && tasksRes.body.tasks.length > 0,
      'Volunteer sees available delivery task'
    );
    taskId = tasksRes.body.tasks[0]._id;

    // 14. Volunteer Accepts Task
    const claimRes = await request(`/volunteer/tasks/${taskId}/accept`, 'PUT', null, volunteerToken);
    assert(claimRes.status === 200 && claimRes.body.task.status === 'ACCEPTED', 'Volunteer accepts task');

    // 15. Volunteer Confirms Pickup
    const pickupRes = await request(`/volunteer/tasks/${taskId}/pickup`, 'PUT', null, volunteerToken);
    assert(pickupRes.status === 200 && pickupRes.body.task.status === 'PICKED_UP', 'Volunteer confirms pickup');

    // 16. Volunteer Confirms Delivery
    const deliverRes = await request(`/volunteer/tasks/${taskId}/deliver`, 'PUT', null, volunteerToken);
    assert(deliverRes.status === 200 && deliverRes.body.task.status === 'DELIVERED', 'Volunteer confirms delivery');

    // 17. Check Notification for Recipient
    const notifRes = await request('/notifications', 'GET', null, recipientToken);
    assert(
      notifRes.status === 200 && notifRes.body.notifications.length > 0,
      'Recipient receives automatic status notifications'
    );

    // 18. Admin Platform Stats
    const statsRes = await request('/admin/stats', 'GET', null, adminToken);
    assert(
      statsRes.status === 200 &&
        statsRes.body.stats.deliveredDonations >= 1 &&
        statsRes.body.stats.totalPeopleFed >= 50,
      'Admin dashboard displays real MongoDB stats including people fed'
    );

    // 19. Admin Users List
    const usersRes = await request('/admin/users', 'GET', null, adminToken);
    assert(usersRes.status === 200 && usersRes.body.users.length >= 4, 'Admin lists registered users');

    console.log('\n=============================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with exception:', err);
    process.exit(1);
  }
};

runTests();
